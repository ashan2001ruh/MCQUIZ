import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const QuizHistory = () => {
  const [quizAttempts, setQuizAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchQuizHistory = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          navigate('/login');
          return;
        }

        // Get user from localStorage
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
        
        // Debug: Check token and user info
        console.log('Stored user:', storedUser);
        console.log('Token length:', token ? token.length : 0);

        // Fetch quiz history from backend - get all attempts (no pagination)
        console.log('Making API call with token:', token ? 'Token exists' : 'No token');
        const response = await fetch('http://localhost:3001/api/user-attempts/history?limit=1000', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log('API response status:', response.status);
        console.log('API response headers:', response.headers);

        if (response.ok) {
          const data = await response.json();
          console.log('Quiz history data:', data);
          console.log('Total attempts from API:', data.attempts?.length || 0);
          console.log('Pagination info:', data.pagination);
          
                     if (data.attempts && data.attempts.length > 0) {
             console.log('First attempt sample:', data.attempts[0]);
             console.log('Total attempts found:', data.attempts.length);
             console.log('Score structure:', data.attempts[0].score);
             console.log('Time spent:', data.attempts[0].timeSpent);
             console.log('Answers count:', data.attempts[0].score.total);
             console.log('Correct answers:', data.attempts[0].score.correct);
             console.log('Score percentage:', data.attempts[0].score.percentage);
           } else {
            console.log('No attempts found in database');
          }
          
          setQuizAttempts(data.attempts || []);
        } else {
          console.log('Quiz history API response not ok:', response.status);
          const errorText = await response.text();
          console.log('Error response:', errorText);
          setQuizAttempts([]);
        }
      } catch (err) {
        console.error('Error fetching quiz history:', err);
        setError('Failed to load quiz history. Please try again.');
        setQuizAttempts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchQuizHistory();
  }, [navigate]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPassStatusColor = (passed) => {
    return passed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#DDE8F0]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#018ABD] mx-auto mb-4"></div>
          <p className="text-[#004581]">Loading quiz history...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#DDE8F0]">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center border border-[#004581]">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold mb-4 text-[#004581]">Error Loading Quiz History</h2>
          <p className="mb-6 text-[#004581]">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-[#018ABD] text-white px-6 py-3 rounded-full hover:bg-[#004581] transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#DDE8F0]">
      {/* Header */}
      <header className="bg-gradient-to-r from-[#014482] to-[#0389BC] shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <Link
                to="/user-dashboard"
                className="text-white hover:text-gray-200 transition-colors"
              >
                ← Back to Dashboard
              </Link>
              <h1 className="text-2xl font-bold text-white">Quiz History</h1>
            </div>
            <span className="text-white font-medium">
              Welcome, {user?.firstName || 'User'}!
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8 border border-[#018ABD]">
          <h2 className="text-2xl font-bold text-[#004581] mb-2">
            Your Quiz Attempts 📊
          </h2>
          <p className="text-[#004581] opacity-80">
            Review all your past quiz attempts and track your progress over time.
          </p>
        </div>

        {/* Quiz History List */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-[#018ABD]">
          <h3 className="text-xl font-bold text-[#004581] mb-6">All Attempts ({quizAttempts.length})</h3>
          
          {quizAttempts.length > 0 ? (
            <div className="space-y-4">
              {quizAttempts.map((attempt, index) => (
                <div key={attempt._id || index} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    {/* Quiz Info */}
                    <div className="flex-1">
                                             <div className="flex items-start justify-between mb-2">
                         <h4 className="text-lg font-semibold text-[#004581]">
                           {attempt.quiz?.title || 'Unknown Quiz'}
                         </h4>
                         <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPassStatusColor(attempt.passed)}`}>
                           {attempt.passed ? 'Passed' : 'Failed'}
                         </span>
                       </div>
                      
                                             <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
                         <span>Subject: {attempt.quiz?.subject?.name || 'Unknown Subject'}</span>
                         {attempt.quiz?.difficulty && (
                           <span className={`px-2 py-1 rounded text-xs ${getDifficultyColor(attempt.quiz.difficulty)}`}>
                             {attempt.quiz.difficulty}
                           </span>
                         )}
                         <span>Attempted: {formatDate(attempt.submittedAt)}</span>
                       </div>

                                               {/* Score and Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="text-center">
                            <p className="text-sm text-gray-600">Score</p>
                            <p className={`text-xl font-bold ${getScoreColor(attempt.score?.percentage || 0)}`}>
                              {attempt.score?.percentage || 0}%
                            </p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm text-gray-600">Questions</p>
                            <p className="text-lg font-semibold text-[#004581]">
                              {attempt.score?.total || 'N/A'}
                            </p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm text-gray-600">Correct</p>
                            <p className="text-lg font-semibold text-green-600">
                              {attempt.score?.correct || 'N/A'}
                            </p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm text-gray-600">Time Taken</p>
                            <p className="text-lg font-semibold text-[#004581]">
                              {attempt.timeSpent ? `${Math.round(attempt.timeSpent / 60)} min` : 'N/A'}
                            </p>
                          </div>
                        </div>
                        
                        
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-2 lg:flex-col">
                                             <Link
                         to={`/quizzes/${attempt.quiz.id}/attempt`}
                         className="bg-[#018ABD] text-white px-4 py-2 rounded text-sm hover:bg-[#004581] transition-colors text-center"
                       >
                         Retake Quiz
                       </Link>
                      <button
                        className="bg-gray-100 text-[#004581] px-4 py-2 rounded text-sm hover:bg-gray-200 transition-colors"
                        onClick={() => {
                          // TODO: Implement detailed review functionality
                          alert('Detailed review feature coming soon!');
                        }}
                      >
                        Review Answers
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
                         <div className="text-center py-12">
               <div className="text-6xl mb-4">📝</div>
               <h3 className="text-xl font-semibold text-[#004581] mb-2">No Quiz Attempts Yet</h3>
               <p className="text-[#004581] opacity-80 mb-6">
                 Start taking quizzes to see your history here!
               </p>
               <div className="space-y-4">
                 <Link
                   to="/courses"
                   className="inline-block bg-[#018ABD] text-white px-6 py-3 rounded-full font-medium hover:bg-[#004581] transition-colors"
                 >
                   Browse Courses
                 </Link>
                                   <div className="mt-4 space-y-2">
                    <button
                      onClick={() => {
                        fetch('http://localhost:3001/api/test/database')
                          .then(res => res.json())
                          .then(data => {
                            console.log('Database test result:', data);
                            alert(`Database test: ${data.attempts.count} attempts found`);
                          })
                          .catch(err => {
                            console.error('Database test error:', err);
                            alert('Database test failed');
                          });
                      }}
                      className="text-sm text-[#018ABD] hover:underline block"
                    >
                      Check Database (Debug)
                    </button>
                                         <button
                       onClick={() => {
                         fetch('http://localhost:3001/api/fix-attempts')
                           .then(res => res.json())
                           .then(data => {
                             console.log('Fix attempts result:', data);
                             alert(`Fixed ${data.fixedCount} attempts. Please refresh the page.`);
                             window.location.reload();
                           })
                           .catch(err => {
                             console.error('Fix attempts error:', err);
                             alert('Failed to fix attempts');
                           });
                       }}
                       className="text-sm text-red-600 hover:underline block"
                     >
                       Fix Data Structure (Debug)
                     </button>
                                           <button
                        onClick={() => {
                          fetch('http://localhost:3001/api/create-test-attempt')
                            .then(res => res.json())
                            .then(data => {
                              console.log('Create test attempt result:', data);
                              alert(`Created test attempt. Please refresh the page.`);
                              window.location.reload();
                            })
                            .catch(err => {
                              console.error('Create test attempt error:', err);
                              alert('Failed to create test attempt');
                            });
                        }}
                        className="text-sm text-green-600 hover:underline block"
                      >
                        Create Test Attempt (Debug)
                      </button>
                      <button
                        onClick={() => {
                          fetch('http://localhost:3001/api/debug/attempts')
                            .then(res => res.json())
                            .then(data => {
                              console.log('Debug attempts result:', data);
                              alert(`Found ${data.totalAttempts} attempts. Check console for details.`);
                            })
                            .catch(err => {
                              console.error('Debug attempts error:', err);
                              alert('Failed to debug attempts');
                            });
                        }}
                        className="text-sm text-purple-600 hover:underline block"
                      >
                        Debug Raw Data (Debug)
                      </button>
                                             <button
                         onClick={() => {
                           const storedUser = localStorage.getItem('user');
                           if (storedUser) {
                             const user = JSON.parse(storedUser);
                             fetch(`http://localhost:3001/api/test/user-attempts/${user._id}`)
                               .then(res => res.json())
                               .then(data => {
                                 console.log('Test user attempts result:', data);
                                 alert(`User ${user.firstName} has ${data.totalAttempts} attempts. Check console for details.`);
                               })
                               .catch(err => {
                                 console.error('Test user attempts error:', err);
                                 alert('Failed to test user attempts');
                               });
                           } else {
                             alert('No user found in localStorage');
                           }
                         }}
                         className="text-sm text-orange-600 hover:underline block"
                       >
                         Test User Attempts (Debug)
                       </button>
                       <button
                         onClick={async () => {
                           const token = localStorage.getItem('authToken');
                           if (!token) {
                             alert('No auth token found');
                             return;
                           }
                           
                           try {
                             const response = await fetch('http://localhost:3001/api/user-attempts/history?limit=1000', {
                               headers: { Authorization: `Bearer ${token}` }
                             });
                             
                             console.log('Direct API call status:', response.status);
                             const data = await response.json();
                             console.log('Direct API call result:', data);
                             alert(`API returned ${data.attempts?.length || 0} attempts. Check console for full response.`);
                           } catch (err) {
                             console.error('Direct API call error:', err);
                             alert('Direct API call failed');
                           }
                         }}
                         className="text-sm text-blue-600 hover:underline block"
                       >
                         Test Direct API Call (Debug)
                       </button>
                  </div>
               </div>
             </div>
          )}
        </div>

        {/* Summary Stats */}
        {quizAttempts.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-[#018ABD] text-center">
              <h4 className="text-lg font-semibold text-[#004581] mb-2">Total Attempts</h4>
              <p className="text-3xl font-bold text-[#018ABD]">{quizAttempts.length}</p>
            </div>
                         <div className="bg-white rounded-xl shadow-sm p-6 border border-[#018ABD] text-center">
               <h4 className="text-lg font-semibold text-[#004581] mb-2">Average Score</h4>
               <p className="text-3xl font-bold text-[#018ABD]">
                 {Math.round(quizAttempts.reduce((sum, attempt) => sum + attempt.score.percentage, 0) / quizAttempts.length)}%
               </p>
             </div>
            <div className="bg-white rounded-xl shadow-sm p-6 border border-[#018ABD] text-center">
              <h4 className="text-lg font-semibold text-[#004581] mb-2">Pass Rate</h4>
              <p className="text-3xl font-bold text-[#018ABD]">
                {Math.round((quizAttempts.filter(attempt => attempt.passed).length / quizAttempts.length) * 100)}%
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-[#014482] text-white py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-xl font-bold mb-2">MCQuiz</h2>
          <p className="text-sm opacity-80 mb-4">Your MCQ learning companion</p>
          <p className="text-sm opacity-80">
            &copy; {new Date().getFullYear()} MCQuiz. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default QuizHistory;
