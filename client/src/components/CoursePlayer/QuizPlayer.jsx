import React, { useState } from 'react';

const QuizPlayer = ({ lesson, onComplete }) => {
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState({}); // { questionIndex: optionIndex }
    const [showResult, setShowResult] = useState(false);

    const handleOptionSelect = (qIndex, oIndex) => {
        setAnswers({ ...answers, [qIndex]: oIndex });
    };

    const calculateScore = () => {
        let score = 0;
        lesson.questions.forEach((q, idx) => {
            if (answers[idx] === q.correctAnswer) score++;
        });
        return score;
    };

    const handleSubmit = () => {
        setShowResult(true);
        const score = calculateScore();
        const passed = score >= (lesson.questions.length / 2);
        if (passed && onComplete) {
            onComplete();
        }
    };

    const handleRetry = () => {
        setAnswers({});
        setShowResult(false);
        setCurrentQuestion(0);
    };

    if (!lesson.questions || lesson.questions.length === 0) return <div className="p-8">No questions in this quiz.</div>;

    if (showResult) {
        const score = calculateScore();
        const passed = score >= (lesson.questions.length / 2);

        return (
            <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-sm text-center">
                <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center text-4xl mb-4 ${passed ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                    <i className={`fas ${passed ? 'fa-trophy' : 'fa-times'}`}></i>
                </div>
                <h2 className="text-2xl font-bold text-navy-900 mb-2">{passed ? 'Quiz Passed!' : 'Keep Practicing'}</h2>
                <p className="text-gray-600 mb-6">You scored {score} out of {lesson.questions.length}</p>

                <button
                    onClick={handleRetry}
                    className={`px-6 py-2 bg-navy-900 text-white font-bold rounded-lg hover:bg-blue-900 transition`}
                >
                    Retry Quiz
                </button>
            </div>
        );
    }

    const question = lesson.questions[currentQuestion];

    return (
        <div className="max-w-3xl mx-auto">
            <div className="mb-6 flex justify-between items-center">
                <h2 className="text-xl font-bold text-navy-900">Quiz: {lesson.title}</h2>
                <span className="text-sm font-bold text-gray-500">Question {currentQuestion + 1} of {lesson.questions.length}</span>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6">
                <h3 className="text-lg font-medium text-navy-900 mb-4">{question.question}</h3>

                <div className="space-y-3">
                    {question.options.map((option, idx) => (
                        <div
                            key={idx}
                            onClick={() => handleOptionSelect(currentQuestion, idx)}
                            className={`p-4 rounded-lg border cursor-pointer transition flex items-center gap-3 ${answers[currentQuestion] === idx
                                ? 'border-navy-500 bg-navy-50 ring-1 ring-navy-500'
                                : 'border-gray-200 hover:bg-gray-50'
                                }`}
                        >
                            <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${answers[currentQuestion] === idx ? 'border-navy-900' : 'border-gray-400'}`}>
                                {answers[currentQuestion] === idx && <div className="w-3 h-3 bg-navy-900 rounded-full"></div>}
                            </div>
                            <span>{option}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex justify-between">
                <button
                    disabled={currentQuestion === 0}
                    onClick={() => setCurrentQuestion(curr => curr - 1)}
                    className="px-6 py-2 text-gray-600 font-bold disabled:opacity-50"
                >
                    Previous
                </button>

                {currentQuestion < lesson.questions.length - 1 ? (
                    <button
                        onClick={() => setCurrentQuestion(curr => curr + 1)}
                        className="px-6 py-2 bg-navy-900 text-white font-bold rounded-lg hover:bg-blue-800 disabled:opacity-50 transition"
                    >
                        Next Question
                    </button>
                ) : (
                    <button
                        onClick={handleSubmit}
                        className="px-6 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition"
                    >
                        Submit Quiz
                    </button>
                )}
            </div>
        </div>
    );
};

export default QuizPlayer;
