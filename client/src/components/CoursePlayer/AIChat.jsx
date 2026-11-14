import React, { useState, useRef, useEffect } from 'react';
import api from '../../config/server';
import { renderMarkdown } from '../../utils/markdown';

const SUGGESTIONS = ['Summarise this lesson', 'Explain the key idea simply', 'Give me a practice question'];

const AIChat = ({ course, activeLesson }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'ai', content: `Hi! I'm your AI tutor for **${course.title}**. Ask me anything about this course.` }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isOpen]);

    useEffect(() => {
        if (isOpen) inputRef.current?.focus();
        if (!isOpen) return;
        const onKey = (e) => e.key === 'Escape' && setIsOpen(false);
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [isOpen]);

    const send = async (text) => {
        const userMessage = text.trim();
        if (!userMessage || loading) return;

        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setInput('');
        setLoading(true);

        try {
            const context = activeLesson
                ? `Current Lesson: ${activeLesson.title}. Content Snippet: ${activeLesson.content || activeLesson.description || "Video Lesson"}. Course Description: ${course.description}`
                : `Course Description: ${course.description}`;

            const res = await api.post('/users/ai-chat', { message: userMessage, context, courseTitle: course.title });

            setMessages(prev => [...prev, {
                role: 'ai',
                content: res.data.success ? res.data.reply : "Sorry, I'm having trouble connecting right now.",
                error: !res.data.success,
            }]);
        } catch (error) {
            console.error("AI Chat Error", error);
            setMessages(prev => [...prev, { role: 'ai', content: error.response?.data?.message || "Something went wrong. Please try again later.", error: true }]);
        } finally {
            setLoading(false);
        }
    };

    const handleSend = (e) => {
        e.preventDefault();
        send(input);
    };

    return (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 flex flex-col items-end">
            {isOpen && (
                <div
                    role="dialog"
                    aria-label="AI tutor chat"
                    className="mb-3 w-[calc(100vw-2rem)] sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col h-[min(520px,calc(100dvh-7rem))] animate-fade-in-up"
                >
                    <div className="bg-navy-900 p-4 text-white flex justify-between items-center shrink-0">
                        <div className="flex items-center gap-3">
                            <span className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center">
                                <i className="fas fa-robot" aria-hidden="true"></i>
                            </span>
                            <div>
                                <h3 className="font-bold text-sm">AI Tutor</h3>
                                <p className="text-xs text-blue-200 truncate max-w-[14rem]">{activeLesson ? `On: ${activeLesson.title}` : 'Powered by Gemini'}</p>
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)} aria-label="Close chat" className="w-8 h-8 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition">
                            <i className="fas fa-times" aria-hidden="true"></i>
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 bg-gray-50 flex flex-col gap-3 custom-scrollbar" aria-live="polite">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-sm break-words ${msg.role === 'user'
                                    ? 'bg-blue-600 text-white rounded-tr-sm whitespace-pre-wrap'
                                    : msg.error
                                        ? 'bg-red-50 text-red-700 border border-red-100 rounded-tl-sm'
                                        : 'bg-white text-gray-700 border border-gray-200 rounded-tl-sm shadow-sm'}`}
                                >
                                    {msg.role === 'ai' && (
                                        <div className="flex items-center gap-1 mb-1 text-[11px] font-bold text-blue-600 uppercase tracking-wider">
                                            <i className="fas fa-wand-magic-sparkles" aria-hidden="true"></i> AI Tutor
                                        </div>
                                    )}
                                    {msg.role === 'ai' ? renderMarkdown(msg.content) : msg.content}
                                </div>
                            </div>
                        ))}
                        {messages.length === 1 && !loading && (
                            <div className="flex flex-wrap gap-2">
                                {SUGGESTIONS.map(s => (
                                    <button key={s} onClick={() => send(s)} className="px-3 py-1.5 text-xs font-medium bg-white border border-blue-100 text-blue-700 rounded-full hover:bg-blue-50 transition">
                                        {s}
                                    </button>
                                ))}
                            </div>
                        )}
                        {loading && (
                            <div className="flex justify-start" aria-label="AI tutor is typing">
                                <div className="bg-white p-3 rounded-2xl rounded-tl-sm border border-gray-200 shadow-sm flex gap-1">
                                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:150ms]"></span>
                                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:300ms]"></span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <form onSubmit={handleSend} className="p-3 bg-white border-t border-gray-100 shrink-0">
                        <div className="relative">
                            <label htmlFor="ai-chat-input" className="sr-only">Ask the AI tutor a question</label>
                            <input
                                id="ai-chat-input"
                                ref={inputRef}
                                type="text"
                                placeholder="Ask a question..."
                                className="w-full pl-4 pr-12 py-3 bg-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm transition"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                disabled={loading}
                                maxLength={1000}
                            />
                            <button
                                type="submit"
                                disabled={loading || !input.trim()}
                                aria-label="Send message"
                                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <i className="fas fa-paper-plane text-xs" aria-hidden="true"></i>
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <button
                onClick={() => setIsOpen(!isOpen)}
                aria-label={isOpen ? 'Close AI tutor' : 'Open AI tutor'}
                aria-expanded={isOpen}
                className={`w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 ${isOpen
                    ? 'bg-white text-gray-600 border border-gray-200'
                    : 'bg-blue-600 text-white hover:bg-blue-700 hover:scale-105'}`}
            >
                <i className={`fas ${isOpen ? 'fa-times text-xl' : 'fa-robot text-2xl'}`} aria-hidden="true"></i>
            </button>
        </div>
    );
};

export default AIChat;
