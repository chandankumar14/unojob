import React, { useState } from 'react';

const FeedbackPage = () => {
    const [feedback, setFeedback] = useState('');
    const [rating, setRating] = useState(0); // New state for rating
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleFeedbackChange = (e) => {
        setFeedback(e.target.value);
    };

    const handleStarClick = (index) => {
        setRating(index + 1);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (feedback.trim()) {
            setIsSubmitted(true);
        }
    };

    const renderStars = () => {
        const stars = [];
        for (let i = 0; i < 5; i++) {
            stars.push(
                <span
                    key={i}
                    onClick={() => handleStarClick(i)}
                    style={{
                        cursor: 'pointer',
                        color: i < rating ? 'gold' : 'gray',
                        fontSize: '30px',
                    }}
                >
                    &#9733;
                </span>
            );
        }
        return stars;
    };

    return (
        <div className="feedback-container">
            {!isSubmitted ? (
                <div className="feedback-form">
                    <h2>We Value Your Feedback!</h2>
                    <p>Let us know how we did and how we can improve!</p>
                    <form onSubmit={handleSubmit}>
                        <div className="rating-section">
                            <p>Rate Us:</p>
                            <div>{renderStars()}</div>
                        </div>
                        <textarea
                            className="feedback-input"
                            value={feedback}
                            onChange={handleFeedbackChange}
                            placeholder="Write your feedback here..."
                            rows="6"
                        />
                        <button type="submit" className="submit-btn">
                            Submit Feedback
                        </button>
                    </form>
                </div>
            ) : (
                <div className="thank-you-message">
                    <h2>Thank You!</h2>
                    <p>Your feedback has been successfully submitted. We truly appreciate your input!</p>
                    <p>Your Rating: {rating} out of 5</p> {/* Display rating */}
                </div>
            )}
        </div>
    );
};

export default FeedbackPage;
