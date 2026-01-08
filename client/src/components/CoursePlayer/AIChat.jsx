import React, { useState, useRef, useEffect } from 'react';
import api from '../../config/server';

const AIChat = ({ course, activeLesson }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'ai', content: `Hi! I'm your AI tutor for ${course.title}. Ask me anything about this course!` }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || loading) return;

        const userMessage = input.trim();
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setInput('');
        setLoading(true);

        try {
            // Prepare context based on active lesson or general course info
            const context = activeLesson
                ? `Current Lesson: ${activeLesson.title}. Content Snippet: ${activeLesson.content || activeLesson.description || "Video Lesson"}. Course Description: ${course.description}`
                : `Course Description: ${course.description}`;

            const res = await api.post('/users/ai-chat', {
                message: userMessage,
                context,
                courseTitle: course.title
            });

            if (res.data.success) {
                setMessages(prev => [...prev, { role: 'ai', content: res.data.reply }]);
            } else {
                setMessages(prev => [...prev, { role: 'ai', content: "Sorry, I'm having trouble connecting right now." }]);
            }
        } catch (error) {
            console.error("AI Chat Error", error);
            setMessages(prev => [...prev, { role: 'ai', content: "Something went wrong. Please try again later." }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
            {/* Chat Window */}
            {isOpen && (
                <div className="mb-4 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col h-[500px] animate-fade-in-up">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-navy-900 to-blue-800 p-4 text-white flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <i className="fas fa-robot text-xl"></i>
                            <div>
                                <h3 className="font-bold text-sm">AI Tutor</h3>
                                <p className="text-xs text-blue-200">Powered by Gemini</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="text-white/80 hover:text-white transition"
                        >
                            <i className="fas fa-times"></i>
                        </button>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 bg-gray-50 flex flex-col gap-3">
                        {messages.map((msg, idx) => (
                            <div
                                key={idx}
                                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[80%] p-3 rounded-2xl text-sm ${msg.role === 'user'
                                        ? 'bg-blue-600 text-white rounded-tr-none'
                                        : 'bg-white text-gray-700 border border-gray-200 rounded-tl-none shadow-sm'
                                        }`}
                                >
                                    {msg.role === 'ai' && (
                                        <div className="flex items-center gap-1 mb-1 text-xs font-bold text-blue-600 uppercase tracking-wider">
                                            <i className="fas fa-sparkles"></i> AI
                                        </div>
                                    )}
                                    <div className="whitespace-pre-wrap">{msg.content}</div>
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className="flex justify-start">
                                <div className="bg-white p-3 rounded-2xl rounded-tl-none border border-gray-200 shadow-sm">
                                    <div className="flex gap-1">
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <form onSubmit={handleSend} className="p-3 bg-white border-t border-gray-100">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Ask a question..."
                                className="w-full pl-4 pr-12 py-3 bg-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm transition"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                disabled={loading}
                            />
                            <button
                                type="submit"
                                disabled={loading || !input.trim()}
                                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <i className="fas fa-paper-plane text-xs"></i>
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Floating Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 ${isOpen
                        ? 'bg-gray-100 text-gray-600 rotate-90 scale-90'
                        : 'bg-gradient-to-r from-navy-900 to-blue-800 text-white hover:scale-110 border-2 border-white/20'
                    }`}
            >
                {isOpen ? <i className="fas fa-times text-xl"></i> : <i className="fas fa-robot text-2xl"></i>}
            </button>
        </div>
    );
};

export default AIChat;
