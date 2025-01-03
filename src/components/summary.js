import React, { useState, useEffect } from 'react';
const InterviewSummary = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const questions = [
        {
            question: "What is the capital of France?",
            options: ["Berlin", "Madrid", "Paris", "Rome"],
        },
        {
            question: "Which planet is known as the Red Planet?",
            options: ["Earth", "Mars", "Jupiter", "Saturn"],
        },
        {
            question: "What is the largest ocean on Earth?",
            options: ["Atlantic", "Indian", "Arctic", "Pacific"],
        },
        {
            question: "Which element has the chemical symbol 'O'?",
            options: ["Oxygen", "Osmium", "Ozone", "Oganesson"],
        },
    ];

    useEffect(() => {
        const fetchData = async () => {
            try {
                // setLoading(true);
                // const response = await fetch('https://api.example.com/data');
                // if (!response.ok) {
                //     throw new Error('Network response was not ok');
                // }
                // const result = await response.json();
                // setData(result);
                console.log(localStorage.getItem("AllVideoURL"))

            } catch (error) {
                setError(error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    return (

        <div className="App">
            {loading && (
                <div className="loading-overlay">
                    <div className="spinner"></div>
                </div>
            )}
            <div className="quiz-container">
                <h3>Your Interview Summary</h3>
                {questions.map((question, index) => (
                    <div key={index} className="question">
                        <div className="options">
                            <h3>Q{index + 1}  {question.question}</h3>

                            {question.options.map((option, idx) => (
                                <div key={idx} className="option">
                                    {/* <input type="radio" id={`option-${index}-${idx}`} name={`question-${index}`} /> */}
                                    <label htmlFor={`option-${index}-${idx}`}>{option}</label>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}

            </div>
        </div>
    );
};

export default InterviewSummary;
