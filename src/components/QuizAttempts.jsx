import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { quizService, handleApiError, authService } from '../services/apiService';

const QuizAttempt = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  
  // Quiz data and loading states
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Quiz attempt states
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [showTimeoutModal, setShowTimeoutModal] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);
  
  const timerRef = useRef(null);
  const startTimeRef = useRef(null);
  const isSubmittingRef = useRef(false);

  // Check authentication on component mount
  useEffect(() => {
    const checkAuth = () => {
      const authenticated = authService.isAuthenticated();
      setIsAuthenticated(authenticated);
      
      if (!authenticated) {
        console.log('User not authenticated, redirecting to login');
        alert('Please login to take this quiz');
        navigate('/login', { state: { from: `/quizzes/${quizId}/attempt` } });
        return;
      }
      
      console.log('User authenticated, proceeding to fetch quiz data');
    };
    
    checkAuth();
  }, [quizId, navigate]);

  // Fetch quiz data after authentication is confirmed
  useEffect(() => {
    const fetchQuizData = async () => {
      // Don't fetch if user is not authenticated
      if (!isAuthenticated) {
        console.log('Not authenticated, skipping quiz data fetch');
        return;
      }

      try {
        setLoading(true);
        console.log('Fetching quiz data for ID:', quizId);
        const response = await quizService.getQuizForAttempt(quizId);
        
        console.log('Quiz API response:', response);
        
        if (response && response.quiz) {
          setQuiz(response.quiz);
          setTimeRemaining(response.quiz.timeLimit * 60); // Convert minutes to seconds
          // Initialize answers array with null values
          setAnswers(new Array(response.quiz.questions.length).fill(null));
          console.log('Quiz data loaded successfully:', {
            title: response.quiz.title,
            questionsCount: response.quiz.questions.length,
            timeLimit: response.quiz.timeLimit
          });
        } else {
          console.error('Invalid quiz response:', response);
          setError('Quiz data not found or invalid response from server');
        }
      } catch (err) {
        console.error('Error fetching quiz:', err);
        
        // Handle subscription access error
        if (err.message.includes('403') || err.message.includes('Access denied')) {
          alert('This quiz requires a subscription. Please upgrade to access Pro/OL/AL content.');
          navigate('/pricing');
          return;
        }
        
        setError(handleApiError(err));
      } finally {
        setLoading(false);
      }
    };

    if (quizId && isAuthenticated) {
      fetchQuizData();
    }
  }, [quizId, isAuthenticated, navigate]);

  // Timer effect
  useEffect(() => {
    if (quizStarted && timeRemaining > 0 && !quizSubmitted) {
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleTimeOut();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }

    return () => clearInterval(timerRef.current);
  }, [quizStarted, timeRemaining, quizSubmitted]);

  // Handle quiz start
  const handleStartQuiz = () => {
    setQuizStarted(true);
    startTimeRef.current = Date.now();
    console.log('Quiz started at:', new Date().toISOString());
  };

  // Handle answer selection
  const handleAnswerSelect = (questionIndex, answerIndex) => {
    const updatedAnswers = [...answers];
    updatedAnswers[questionIndex] = answerIndex;
    setAnswers(updatedAnswers);
    console.log(`Question ${questionIndex + 1} answered:`, answerIndex);
  };

  // Handle navigation between questions
  const handleNextQuestion = () => {
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleQuestionJump = (questionIndex) => {
    setCurrentQuestion(questionIndex);
  };

  // Handle timeout
  const handleTimeOut = () => {
    if (isSubmittingRef.current || quizSubmitted) return;
    
    console.log('Quiz timed out');
    setShowTimeoutModal(true);
    clearInterval(timerRef.current);
    
    // Auto-submit after showing timeout modal
    setTimeout(() => {
      setShowTimeoutModal(false);
      submitQuiz(true); // Pass true to indicate timeout submission
    }, 3000);
  };

  // Calculate time spent
  const getTimeSpent = () => {
    if (startTimeRef.current) {
      return Math.floor((Date.now() - startTimeRef.current) / 1000);
    }
    return 0;
  };

  // Handle manual quiz submission
  const handleSubmitQuiz = () => {
    const unansweredCount = answers.filter(answer => answer === null).length;
    let confirmMessage = 'Are you sure you want to submit your quiz?';
    
    if (unansweredCount > 0) {
      confirmMessage += `\n\nYou have ${unansweredCount} unanswered question${unansweredCount > 1 ? 's' : ''}.`;
    }
    
    confirmMessage += '\n\nYou cannot change your answers after submission.';
    
    if (window.confirm(confirmMessage)) {
      submitQuiz(false);
    }
  };

  // Submit quiz function
  const submitQuiz = async (isTimeout = false) => {
    if (isSubmittingRef.current || quizSubmitted) return;
    
    try {
      isSubmittingRef.current = true;
      setSubmitting(true);
      setQuizSubmitted(true);
      clearInterval(timerRef.current);
      
      const timeSpent = getTimeSpent();
      
      console.log('Submitting quiz with answers:', answers);
      console.log('Time spent:', timeSpent, 'seconds');
      console.log('Is timeout submission:', isTimeout);
      console.log('Quiz data:', quiz);
      
      // Prepare answers for submission - convert to the format expected by backend
      const submissionAnswers = answers.map((answer, index) => ({
        questionId: quiz.questions[index]._id,
        selectedOption: answer !== null ? answer : -1
      }));
      
      console.log('Submission answers prepared:', submissionAnswers);
      
      const response = await quizService.submitQuizAttempt(quizId, submissionAnswers, timeSpent);
      
      console.log('Full response from server:', response);
      
      if (response && response.score !== undefined) {
        console.log('Quiz submitted successfully:', response);
        setSubmissionResult({
          score: response.score,
          correctAnswers: response.correctAnswers,
          totalQuestions: response.totalQuestions,
          passed: response.passed,
          passingScore: response.passingScore,
          results: response.results || [],
          isTimeout,
          answeredQuestions: answers.filter(answer => answer !== null).length
        });
        setShowResultModal(true);
      } else {
        console.error('Invalid response structure:', response);
        throw new Error('Invalid response from server');
      }
    } catch (err) {
      console.error('Error submitting quiz:', err);
      console.error('Error details:', {
        message: err.message,
        stack: err.stack,
        response: err.response
      });
      
      // Show a more user-friendly error message
      let errorMessage = 'Failed to submit quiz. ';
      if (err.message.includes('Network error')) {
        errorMessage += 'Please check your internet connection and try again.';
      } else if (err.message.includes('401')) {
        errorMessage += 'Your session has expired. Please login again.';
      } else if (err.message.includes('500')) {
        errorMessage += 'Server error. Please try again later.';
      } else {
        errorMessage += err.message;
      }
      
      setError(errorMessage);
      setQuizSubmitted(false); // Allow retry on error
    } finally {
      setSubmitting(false);
      isSubmittingRef.current = false;
    }
  };

  // Handle result modal close
  const handleResultModalClose = () => {
    setShowResultModal(false);
    navigate(-1); // Go back to previous page
  };

  // Format time display
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Get answered questions count
  const getAnsweredCount = () => {
    return answers.filter(answer => answer !== null).length;
  };

  // Get score color based on percentage
  const getScoreColor = (percentage) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (!isAuthenticated && !loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#DDE8F0' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: '#018ABD' }}></div>
          <p style={{ color: '#004581' }}>Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#DDE8F0' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: '#018ABD' }}></div>
          <p style={{ color: '#004581' }}>Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#DDE8F0' }}>
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full mx-4" style={{ borderColor: '#004581', borderWidth: '1px' }}>
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold mb-4" style={{ color: '#004581' }}>Error</h2>
            <p className="mb-6" style={{ color: '#004581' }}>{error}</p>
            <button
              onClick={() => navigate(-1)}
              className="text-white px-6 py-2 rounded-full hover:opacity-90 transition-colors"
              style={{ backgroundColor: '#018ABD' }}
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#DDE8F0' }}>
        <div className="text-center">
          <p style={{ color: '#004581' }}>Quiz not found</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 text-white px-6 py-2 rounded-full hover:opacity-90 transition-colors"
            style={{ backgroundColor: '#018ABD' }}
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Quiz start screen
  if (!quizStarted) {
    return (
      <div className="min-h-screen py-8" style={{ backgroundColor: '#DDE8F0' }}>
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-md p-8" style={{ borderColor: '#004581', borderWidth: '1px' }}>
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-4" style={{ color: '#004581' }}>{quiz.title}</h1>
              <p className="text-lg" style={{ color: '#004581' }}>{quiz.description}</p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="p-6 rounded-lg" style={{ backgroundColor: '#DDE8F0', borderColor: '#004581', borderWidth: '1px' }}>
                <h3 className="font-semibold mb-3" style={{ color: '#004581' }}>Quiz Information</h3>
                <div className="space-y-2 text-sm">
                  <p style={{ color: '#004581' }}><span className="font-medium">Subject:</span> {quiz.subject?.name}</p>
                  <p style={{ color: '#004581' }}><span className="font-medium">Difficulty:</span> {quiz.difficulty}</p>
                  <p style={{ color: '#004581' }}><span className="font-medium">Questions:</span> {quiz.questionsCount || quiz.questions.length}</p>
                  <p style={{ color: '#004581' }}><span className="font-medium">Time Limit:</span> {quiz.timeLimit} minutes</p>
                  <p style={{ color: '#004581' }}><span className="font-medium">Passing Score:</span> {quiz.passingScore}%</p>
                </div>
              </div>
              
              <div className="p-6 rounded-lg" style={{ backgroundColor: '#DDE8F0', borderColor: '#004581', borderWidth: '1px' }}>
                <h3 className="font-semibold mb-3" style={{ color: '#004581' }}>Instructions</h3>
                <ul className="text-sm space-y-1" style={{ color: '#004581' }}>
                  <li>• Read each question carefully</li>
                  <li>• Select the best answer for each question</li>
                  <li>• You can navigate between questions</li>
                  <li>• Submit before time runs out</li>
                  <li>• You cannot change answers after submission</li>
                </ul>
              </div>
            </div>
            
            <div className="text-center">
              <button
                onClick={handleStartQuiz}
                className="text-white px-8 py-3 rounded-full text-lg font-medium hover:opacity-90 transition-colors"
                style={{ backgroundColor: '#018ABD' }}
              >
                Start Quiz
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentQ = quiz.questions[currentQuestion];

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#DDE8F0' }}>
      {/* Timeout Modal */}
      {showTimeoutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full mx-4" style={{ borderColor: '#004581', borderWidth: '1px' }}>
            <div className="text-center">
              <div className="text-red-500 text-6xl mb-4">⏰</div>
              <h2 className="text-2xl font-bold mb-4" style={{ color: '#004581' }}>Time's Up!</h2>
              <p className="mb-4" style={{ color: '#004581' }}>Your quiz time has expired.</p>
              <p className="text-sm mb-4" style={{ color: '#004581' }}>Submitting your answers automatically...</p>
              <div className="mt-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto" style={{ borderColor: '#018ABD' }}></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Result Modal */}
      {showResultModal && submissionResult && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full mx-4" style={{ borderColor: '#004581', borderWidth: '1px' }}>
            <div className="text-center">
              <div className={`text-6xl mb-4 ${submissionResult.score >= quiz.passingScore ? 'text-green-500' : 'text-red-500'}`}>
                {submissionResult.score >= quiz.passingScore ? '🎉' : '📊'}
              </div>
              <h2 className="text-2xl font-bold mb-4" style={{ color: '#004581' }}>
                {submissionResult.isTimeout ? 'Quiz Submitted (Time Up)' : 'Quiz Completed!'}
              </h2>
              
              <div className="p-6 rounded-lg mb-6" style={{ backgroundColor: '#DDE8F0', borderColor: '#004581', borderWidth: '1px' }}>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p style={{ color: '#004581' }}>Score</p>
                    <p className={`text-2xl font-bold ${getScoreColor(submissionResult.score)}`}>
                      {submissionResult.score.toFixed(2)}%
                    </p>
                  </div>
                  <div>
                    <p style={{ color: '#004581' }}>Correct Answers</p>
                    <p className="text-2xl font-bold" style={{ color: '#004581' }}>
                      {submissionResult.correctAnswers}/{submissionResult.totalQuestions}
                    </p>
                  </div>
                  <div>
                    <p style={{ color: '#004581' }}>Questions Answered</p>
                    <p className="text-lg font-semibold" style={{ color: '#004581' }}>
                      {submissionResult.answeredQuestions}/{submissionResult.totalQuestions}
                    </p>
                  </div>
                  <div>
                    <p style={{ color: '#004581' }}>Time Spent</p>
                    <p className="text-lg font-semibold" style={{ color: '#004581' }}>
                      {Math.floor(getTimeSpent() / 60)}m {getTimeSpent() % 60}s
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="mb-6">
                {submissionResult.score >= quiz.passingScore ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-green-800 font-medium">🎊 Congratulations!</p>
                    <p className="text-green-700 text-sm">You passed the quiz!</p>
                  </div>
                ) : (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-800 font-medium">Keep practicing!</p>
                    <p className="text-red-700 text-sm">You need {quiz.passingScore}% to pass.</p>
                  </div>
                )}
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={handleResultModalClose}
                  className="flex-1 text-white px-6 py-2 rounded-full hover:opacity-90 transition-colors"
                  style={{ backgroundColor: '#018ABD' }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header with timer and progress */}
      <div className="bg-[#DDE8F0} shadow-sm border-b sticky top-0 z-40" style={{ borderColor: '#004581' }}>
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold" style={{ color: '#004581' }}>{quiz.title}</h1>
              <p className="text-sm" style={{ color: '#004581' }}>
                Question {currentQuestion + 1} of {quiz.questions.length} • 
                Answered: {getAnsweredCount()}/{quiz.questions.length}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className={`text-lg font-mono px-3 py-1 rounded ${
                timeRemaining < 300 ? 'bg-red-100 text-red-700' : 'text-white'
              }`} style={timeRemaining >= 300 ? { backgroundColor: '#018ABD' } : {}}>
                {formatTime(timeRemaining)}
              </div>
              <button
                onClick={handleSubmitQuiz}
                disabled={submitting || quizSubmitted}
                className="bg-green-600 text-white px-4 py-2 rounded-full hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Submitting...' : 'Submit Quiz'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Question Navigation Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-[#DDE8F0} rounded-lg shadow-md p-4 sticky top-24" style={{ borderColor: '#004581', borderWidth: '1px' }}>
              <h3 className="font-semibold mb-4" style={{ color: '#004581' }}>Questions</h3>
              <div className="grid grid-cols-5 lg:grid-cols-1 gap-2">
                {quiz.questions.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuestionJump(index)}
                    disabled={quizSubmitted}
                    className={`p-2 text-sm rounded-full transition-colors ${
                      index === currentQuestion
                        ? 'text-white'
                        : answers[index] !== null
                        ? 'bg-green-100 text-green-700 border border-green-300'
                        : 'hover:opacity-80'
                    } ${quizSubmitted ? 'opacity-50 cursor-not-allowed' : ''}`}
                    style={
                      index === currentQuestion
                        ? { backgroundColor: '#018ABD' }
                        : answers[index] === null
                        ? { backgroundColor: '#DDE8F0', color: '#004581', borderColor: '#004581', borderWidth: '1px' }
                        : {}
                    }
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Question Area */}
          <div className="lg:col-span-3">
            <div className="bg-[#DDE8F0] rounded-lg shadow-md p-6" style={{ borderColor: '#004581', borderWidth: '1px' }}>
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm" style={{ color: '#004581' }}>
                    Question {currentQuestion + 1} of {quiz.questions.length}
                  </span>
                  <div className="w-full rounded-full h-2 mx-4" style={{ backgroundColor: '#DDE8F0' }}>
                    <div
                      className="h-2 rounded-full transition-all duration-300"
                      style={{ 
                        backgroundColor: '#018ABD',
                        width: `${((currentQuestion + 1) / quiz.questions.length) * 100}%` 
                      }}
                    ></div>
                  </div>
                </div>
                <h2 className="text-xl font-semibold mb-6" style={{ color: '#004581' }}>
                  {currentQ.question}
                </h2>
              </div>

              <div className="space-y-3 mb-8">
                {currentQ.options.map((option, index) => (
                  <label
                    key={index}
                    className={`flex items-start p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      answers[currentQuestion] === index
                        ? 'bg-blue-50'
                        : 'hover:opacity-80'
                    } ${quizSubmitted ? 'opacity-50 cursor-not-allowed' : ''}`}
                    style={{
                      borderColor: answers[currentQuestion] === index ? '#018ABD' : '#004581',
                      backgroundColor: answers[currentQuestion] === index ? '#DDE8F0' : 'bg-[#DDE8F0}'
                    }}
                  >
                    <input
                      type="radio"
                      name={`question-${currentQuestion}`}
                      value={index}
                      checked={answers[currentQuestion] === index}
                      onChange={() => handleAnswerSelect(currentQuestion, index)}
                      disabled={quizSubmitted}
                      className="mt-1 mr-3"
                      style={{ accentColor: '#018ABD' }}
                    />
                    <span style={{ color: '#004581' }}>{option}</span>
                  </label>
                ))}
              </div>

              {/* Navigation Buttons */}
              <div className="flex justify-between">
                <button
                  onClick={handlePreviousQuestion}
                  disabled={currentQuestion === 0 || quizSubmitted}
                  className="px-6 py-2 rounded-full hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  style={{ 
                    color: '#004581', 
                    borderColor: '#004581', 
                    borderWidth: '1px',
                    backgroundColor: 'bg-[#DDE8F0}'
                  }}
                >
                  Previous
                </button>
                
                <div className="flex space-x-3">
                  {currentQuestion < quiz.questions.length - 1 ? (
                    <button
                      onClick={handleNextQuestion}
                      disabled={quizSubmitted}
                      className="px-6 py-2 text-white rounded-full hover:opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ backgroundColor: '#018ABD' }}
                    >
                      Next
                    </button>
                  ) : (
                    <button
                      onClick={handleSubmitQuiz}
                      disabled={submitting || quizSubmitted}
                      className="px-6 py-2 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submitting ? 'Submitting...' : 'Submit Quiz'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizAttempt;