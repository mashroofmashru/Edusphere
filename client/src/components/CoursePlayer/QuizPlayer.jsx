import React, { useState } from 'react';

const PASS_RATIO = 0.5;

const QuizPlayer = ({ lesson, onComplete, onContinue, alreadyPassed = false }) => {
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState({}); // { questionIndex: optionIndex }
    const [showResult, setShowResult] = useState(false);
    const [reviewing, setReviewing] = useState(false);

    const questions = lesson.questions || [];
    const total = questions.length;
    const passMark = Math.ceil(total * PASS_RATIO);

    if (total === 0) {
        return <p className="p-6 text-center text-gray-500">This quiz doesn't have any questions yet.</p>;
    }

    const answeredCount = Object.keys(answers).length;
    const unanswered = questions.map((_, i) => i).filter(i => answers[i] === undefined);
    const score = questions.reduce((n, q, idx) => n + (answers[idx] === q.correctAnswer ? 1 : 0), 0);
    const passed = score >= passMark;

    const handleSubmit = () => {
        if (unanswered.length) {
            setCurrentQuestion(unanswered[0]);
            return;
        }
        setShowResult(true);
        if (passed && onComplete) onComplete();
    };

    const handleRetry = () => {
        setAnswers({});
        setShowResult(false);
        setReviewing(false);
        setCurrentQuestion(0);
    };

    if (showResult && !reviewing) {
        return (
            <div className="max-w-xl mx-auto text-center py-4" role="status">
                <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center text-4xl mb-4 ${passed ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                    <i className={`fas ${passed ? 'fa-trophy' : 'fa-redo'}`} aria-hidden="true"></i>
                </div>
                <h2 className="text-2xl font-bold text-navy-900 mb-2">{passed ? 'Quiz Passed!' : 'Not quite there yet'}</h2>
                <p className="text-gray-600 mb-1">You scored <strong>{score}</strong> out of {total} ({Math.round((score / total) * 100)}%).</p>
                <p className="text-sm text-gray-500 mb-8">{passed ? 'This lesson is now marked complete.' : `You need ${passMark} correct answers to pass.`}</p>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button onClick={() => setReviewing(true)} className="px-6 py-2.5 border border-gray-200 text-navy-900 font-bold rounded-lg hover:bg-gray-50 transition">
                        Review Answers
                    </button>
                    <button onClick={handleRetry} className="px-6 py-2.5 border border-gray-200 text-navy-900 font-bold rounded-lg hover:bg-gray-50 transition">
                        Retry Quiz
                    </button>
                    {passed && onContinue && (
                        <button onClick={onContinue} className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition">
                            Continue <i className="fas fa-arrow-right ml-1" aria-hidden="true"></i>
                        </button>
                    )}
                </div>
            </div>
        );
    }

    // Review mode: show every question with the right / chosen answers
    if (reviewing) {
        return (
            <div className="max-w-3xl mx-auto space-y-5">
                <div className="flex flex-wrap justify-between items-center gap-3">
                    <h2 className="text-xl font-bold text-navy-900">Answer Review · {score}/{total}</h2>
                    <button onClick={() => setReviewing(false)} className="text-sm font-bold text-blue-600 hover:underline">Back to results</button>
                </div>
                {questions.map((q, qi) => (
                    <div key={qi} className="p-5 rounded-xl border border-gray-100 bg-gray-50">
                        <p className="font-medium text-navy-900 mb-3">{qi + 1}. {q.question}</p>
                        <ul className="space-y-2">
                            {q.options.map((opt, oi) => {
                                const correct = oi === q.correctAnswer;
                                const chosen = answers[qi] === oi;
                                return (
                                    <li key={oi} className={`p-3 rounded-lg border text-sm flex items-center gap-2 ${correct ? 'border-green-300 bg-green-50 text-green-800' : chosen ? 'border-red-300 bg-red-50 text-red-800' : 'border-gray-200 bg-white text-gray-600'}`}>
                                        <i className={`fas ${correct ? 'fa-check-circle' : chosen ? 'fa-times-circle' : 'fa-circle text-gray-200'}`} aria-hidden="true"></i>
                                        <span className="flex-1">{opt}</span>
                                        {chosen && <span className="text-xs font-bold">Your answer</span>}
                                        {correct && !chosen && <span className="text-xs font-bold">Correct answer</span>}
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                ))}
                <div className="flex justify-end gap-3">
                    <button onClick={handleRetry} className="px-6 py-2.5 border border-gray-200 text-navy-900 font-bold rounded-lg hover:bg-white transition">Retry Quiz</button>
                    {passed && onContinue && (
                        <button onClick={onContinue} className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition">Continue</button>
                    )}
                </div>
            </div>
        );
    }

    const question = questions[currentQuestion];
    const isLast = currentQuestion === total - 1;

    return (
        <div className="max-w-3xl mx-auto">
            {alreadyPassed && (
                <p className="mb-4 text-sm text-green-700 bg-green-50 border border-green-100 rounded-lg px-4 py-2">
                    <i className="fas fa-check-circle mr-2" aria-hidden="true"></i>You've already passed this quiz. Feel free to practise again.
                </p>
            )}
            <div className="mb-4 flex flex-wrap justify-between items-center gap-2">
                <span className="text-sm font-bold text-gray-500">Question {currentQuestion + 1} of {total}</span>
                <span className="text-sm text-gray-500">Pass mark: {passMark}/{total}</span>
            </div>

            {/* Question dots: jump around and see what's answered */}
            <div className="flex flex-wrap gap-2 mb-6" role="group" aria-label="Questions">
                {questions.map((_, i) => (
                    <button
                        key={i}
                        onClick={() => setCurrentQuestion(i)}
                        aria-label={`Question ${i + 1}${answers[i] !== undefined ? ', answered' : ''}`}
                        aria-current={i === currentQuestion ? 'step' : undefined}
                        className={`w-8 h-8 rounded-full text-xs font-bold transition ${i === currentQuestion ? 'bg-navy-900 text-white' : answers[i] !== undefined ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                    >
                        {i + 1}
                    </button>
                ))}
            </div>

            <fieldset className="mb-6">
                <legend className="text-lg font-medium text-navy-900 mb-4">{question.question}</legend>
                <div className="space-y-3">
                    {question.options.map((option, idx) => {
                        const selected = answers[currentQuestion] === idx;
                        return (
                            <label
                                key={idx}
                                className={`p-4 rounded-lg border cursor-pointer transition flex items-center gap-3 ${selected
                                    ? 'border-blue-600 bg-blue-50 ring-1 ring-blue-600'
                                    : 'border-gray-200 hover:bg-gray-50'}`}
                            >
                                <input
                                    type="radio"
                                    name={`q-${currentQuestion}`}
                                    className="sr-only"
                                    checked={selected}
                                    onChange={() => setAnswers({ ...answers, [currentQuestion]: idx })}
                                />
                                <span className={`w-5 h-5 shrink-0 rounded-full border-2 flex items-center justify-center ${selected ? 'border-blue-600' : 'border-gray-300'}`} aria-hidden="true">
                                    {selected && <span className="w-2.5 h-2.5 bg-blue-600 rounded-full"></span>}
                                </span>
                                <span className="text-gray-800">{option}</span>
                            </label>
                        );
                    })}
                </div>
            </fieldset>

            <div className="flex justify-between items-center gap-3">
                <button
                    disabled={currentQuestion === 0}
                    onClick={() => setCurrentQuestion(c => c - 1)}
                    className="px-5 py-2.5 text-gray-600 font-bold rounded-lg hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-transparent transition"
                >
                    Previous
                </button>

                {!isLast ? (
                    <button
                        onClick={() => setCurrentQuestion(c => c + 1)}
                        className="px-6 py-2.5 bg-navy-900 text-white font-bold rounded-lg hover:bg-navy-800 transition"
                    >
                        Next Question
                    </button>
                ) : (
                    <div className="text-right">
                        <button
                            onClick={handleSubmit}
                            className="px-6 py-2.5 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition"
                        >
                            Submit Quiz
                        </button>
                        {unanswered.length > 0 && (
                            <p className="text-xs text-amber-600 mt-2">{answeredCount}/{total} answered. Submitting takes you to the first unanswered question.</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default QuizPlayer;
