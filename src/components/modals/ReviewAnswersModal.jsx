import React, { useState, useEffect } from 'react';

const ReviewAnswersModal = ({ isOpen, onClose, attemptId }) => {
  const [attemptDetails, setAttemptDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && attemptId) {
      fetchAttemptDetails();
    }
  }, [isOpen, attemptId]);

  const fetchAttemptDetails = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setError('Authentication required');
        return;
      }

      const response = await fetch(`http://localhost:3001/api/user-attempts/attempt/${attemptId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setAttemptDetails(data.attempt);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to fetch attempt details');
      }
    } catch (err) {
      console.error('Error fetching attempt details:', err);
      setError('Failed to load attempt details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getOptionLabel = (index) => {
    return String.fromCharCode(65 + index); // A, B, C, D...
  };

  const getAnswerColor = (isCorrect) => {
    return isCorrect ? 'text-green-600' : 'text-red-600';
  };

  const getAnswerIcon = (isCorrect) => {
    return isCorrect ? '✅' : '❌';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#004581] to-[#018ABD] text-white p-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Review Quiz Answers</h2>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 text-2xl font-bold"
            >
              ×
            </button>
          </div>
          {attemptDetails && (
            <div className="mt-4">
              <h3 className="text-xl font-semibold">{attemptDetails.quiz.title}</h3>
                             <p className="text-blue-100">
                 {attemptDetails.quiz.subject.name} • {attemptDetails.quiz.difficulty} • 
                 Score: {attemptDetails.score.toFixed(2)}% • 
                 {attemptDetails.passed ? ' Passed' : ' Failed'}
               </p>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#018ABD] mx-auto mb-4"></div>
              <p className="text-[#004581]">Loading attempt details...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="text-red-500 text-5xl mb-4">⚠️</div>
              <h3 className="text-xl font-semibold text-[#004581] mb-2">Error Loading Details</h3>
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={fetchAttemptDetails}
                className="bg-[#018ABD] text-white px-6 py-3 rounded-full hover:bg-[#004581] transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : attemptDetails ? (
            <div className="space-y-6">
              {/* Summary Stats */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border-2 border-blue-200">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <p className="text-sm text-gray-600">Final Score</p>
                                         <p className={`text-3xl font-bold ${attemptDetails.score >= 80 ? 'text-green-600' : attemptDetails.score >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                       {attemptDetails.score.toFixed(2)}%
                     </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Questions</p>
                    <p className="text-2xl font-bold text-[#004581]">
                      {attemptDetails.detailedResults.length}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Correct</p>
                    <p className="text-2xl font-bold text-green-600">
                      {attemptDetails.detailedResults.filter(q => q.isCorrect).length}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Time Taken</p>
                    <p className="text-2xl font-bold text-[#004581]">
                      {attemptDetails.timeSpent ? `${Math.round(attemptDetails.timeSpent / 60)} min` : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Questions Review */}
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-[#004581] border-b-2 border-[#018ABD] pb-2">
                  Question Review
                </h3>
                
                {attemptDetails.detailedResults.map((question, index) => (
                  <div key={index} className="bg-white rounded-xl border-2 border-gray-200 p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-start space-x-3 mb-4">
                      <span className={`text-lg font-bold px-3 py-1 rounded-full ${
                        question.isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {index + 1}
                      </span>
                      <div className="flex-1">
                        <h4 className="text-lg font-semibold text-[#004581] mb-3">
                          {question.question}
                        </h4>
                        
                        {/* Options */}
                        <div className="space-y-2 mb-4">
                          {question.options.map((option, optionIndex) => (
                            <div
                              key={optionIndex}
                              className={`p-3 rounded-lg border-2 transition-all ${
                                optionIndex === question.correctAnswer
                                  ? 'border-green-500 bg-green-50'
                                  : optionIndex === question.userAnswer
                                  ? 'border-red-500 bg-red-50'
                                  : 'border-gray-200 bg-gray-50'
                              }`}
                            >
                              <div className="flex items-center space-x-3">
                                <span className={`font-bold ${
                                  optionIndex === question.correctAnswer
                                    ? 'text-green-600'
                                    : optionIndex === question.userAnswer
                                    ? 'text-red-600'
                                    : 'text-gray-500'
                                }`}>
                                  {getOptionLabel(optionIndex)}
                                </span>
                                <span className="flex-1">{option}</span>
                                {optionIndex === question.correctAnswer && (
                                  <span className="text-green-600 text-lg">✅</span>
                                )}
                                {optionIndex === question.userAnswer && optionIndex !== question.correctAnswer && (
                                  <span className="text-red-600 text-lg">❌</span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Answer Summary */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                          <div>
                            <p className="text-sm text-gray-600 mb-1">Your Answer:</p>
                            <p className={`font-semibold ${getAnswerColor(question.isCorrect)}`}>
                              {getAnswerIcon(question.isCorrect)} {getOptionLabel(question.userAnswer)} - {question.options[question.userAnswer]}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600 mb-1">Correct Answer:</p>
                            <p className="font-semibold text-green-600">
                              ✅ {getOptionLabel(question.correctAnswer)} - {question.options[question.correctAnswer]}
                            </p>
                          </div>
                        </div>

                        {/* Explanation */}
                        {question.explanation && (
                          <div className="mt-4 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                            <p className="text-sm text-gray-600 mb-1">Explanation:</p>
                            <p className="text-[#004581] font-medium">{question.explanation}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <div className="flex justify-end space-x-4">
            <button
              onClick={onClose}
              className="px-6 py-2 text-[#004581] border-2 border-[#004581] rounded-full hover:bg-[#004581] hover:text-white transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewAnswersModal;
