import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AiOutlineMessage, AiOutlineSend, AiOutlineCheckCircle, AiOutlineCloseCircle } from 'react-icons/ai';

const FeedbackSection = () => {
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' or 'error'
  const [userFeedbacks, setUserFeedbacks] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    fetchUserFeedbacks();
  }, []);

  const fetchUserFeedbacks = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      const response = await fetch('/api/feedback/user?limit=5', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUserFeedbacks(data.feedback || []);
      }
    } catch (error) {
      console.error('Error fetching user feedbacks:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!feedback.trim()) {
      setMessage('Please enter your feedback');
      setMessageType('error');
      return;
    }

    setIsSubmitting(true);
    setMessage('');

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/feedback/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ feedback: feedback.trim() })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Feedback submitted successfully! Thank you for your input.');
        setMessageType('success');
        setFeedback('');
        fetchUserFeedbacks(); // Refresh the list
      } else {
        setMessage(data.message || 'Failed to submit feedback');
        setMessageType('error');
      }
    } catch (error) {
      setMessage('Network error. Please try again.');
      setMessageType('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getSentimentIcon = (sentiment) => {
    return sentiment === 'positive' ? (
      <AiOutlineCheckCircle className="text-green-500" size={20} />
    ) : (
      <AiOutlineCloseCircle className="text-red-500" size={20} />
    );
  };

  const getSentimentColor = (sentiment) => {
    return sentiment === 'positive' ? 'text-green-600' : 'text-red-600';
  };

  const getSentimentBg = (sentiment) => {
    return sentiment === 'positive' ? 'bg-green-50' : 'bg-red-50';
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mt-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-[#004581] flex items-center gap-2">
          <AiOutlineMessage />
          Share Your Feedback
        </h3>
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="text-sm text-[#018ABD] hover:underline"
        >
          {showHistory ? 'Hide History' : 'Show History'}
        </button>
      </div>

      {/* Feedback Form */}
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="mb-4">
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Tell us what you think about MCQuiz! Share your experience, suggestions, or any issues you've encountered..."
            className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-[#018ABD] focus:outline-none transition-colors resize-none"
            rows="4"
            maxLength="500"
          />
          <div className="flex justify-between items-center mt-2">
            <span className="text-sm text-gray-500">
              {feedback.length}/500 characters
            </span>
            <button
              type="submit"
              disabled={isSubmitting || !feedback.trim()}
              className="bg-[#018ABD] hover:bg-[#004581] text-white px-6 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <AiOutlineSend />
                  Submit Feedback
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Message Display */}
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-lg mb-4 ${
            messageType === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          }`}
        >
          {message}
        </motion.div>
      )}

      {/* Feedback History */}
      {showHistory && userFeedbacks.length > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="border-t pt-4"
        >
          <h4 className="text-lg font-medium text-[#004581] mb-4">Your Recent Feedback</h4>
          <div className="space-y-3">
            {userFeedbacks.map((item) => (
              <motion.div
                key={item._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`p-4 rounded-lg border ${getSentimentBg(item.sentiment)}`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    {getSentimentIcon(item.sentiment)}
                    <span className={`font-medium ${getSentimentColor(item.sentiment)}`}>
                      {item.sentiment.charAt(0).toUpperCase() + item.sentiment.slice(1)}
                    </span>
                    {item.confidence && (
                      <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                        {(item.confidence * 100).toFixed(0)}% confidence
                      </span>
                    )}
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-gray-700">{item.feedback}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {showHistory && userFeedbacks.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="border-t pt-4 text-center text-gray-500"
        >
          No feedback submitted yet. Be the first to share your thoughts!
        </motion.div>
      )}
    </div>
  );
};

export default FeedbackSection;
