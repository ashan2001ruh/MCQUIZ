import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import OnlineTestImage from '../Assets/Online test-amico.png';
import ImageA from '../Assets/ImageA.png';
import ImageB from '../Assets/ImageB.png';
import ImageC from '../Assets/ImageC.png';
import FeedbackSection from './FeedbackSection';

const UserDashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    quizzesTaken: 0,
    averageScore: 0,
    improvement: 0,
    passRate: 0,
    highestScore: 0
  });
  const [recentQuizzes, setRecentQuizzes] = useState([]);
  const [enrolledSubjects, setEnrolledSubjects] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);
  const navigate = useNavigate();

    useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          navigate('/login');
          return;
        }
        
        console.log('User token found, fetching dashboard data...');

        // Get user from localStorage first
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }

        // Fetch real data from backend APIs
        try {
          // Fetch user profile
          const userResponse = await fetch('http://localhost:3001/api/profile', {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (userResponse.ok) {
            const userData = await userResponse.json();
            if (userData.user) {
              setUser(userData.user);
              localStorage.setItem('user', JSON.stringify(userData.user));
            }
          }
        } catch (apiError) {
          console.log('Could not fetch user profile from API, using stored data');
        }

        try {
          // Fetch user stats
          console.log('Fetching user stats...');
          const statsResponse = await fetch('http://localhost:3001/api/user/stats', {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (statsResponse.ok) {
            const statsData = await statsResponse.json();
            console.log('Real user stats:', statsData);
            setStats({
              quizzesTaken: statsData.quizzesTaken || 0,
              averageScore: statsData.averageScore || 0,
              improvement: statsData.improvement || 0,
              passRate: statsData.passRate || 0,
              highestScore: statsData.highestScore || 0
            });
          } else {
            console.log('Stats API response not ok:', statsResponse.status);
            // Set default stats if API fails
            setStats({
              quizzesTaken: 0,
              averageScore: 0,
              improvement: 0,
              passRate: 0,
              highestScore: 0
            });
          }
        } catch (apiError) {
          console.log('Could not fetch user stats from API:', apiError);
          // Set default stats if API fails
          setStats({
            quizzesTaken: 0,
            averageScore: 0,
            improvement: 0,
            passRate: 0,
            highestScore: 0
          });
        }

        try {
          // Fetch recent quiz attempts
          console.log('Fetching recent quizzes...');
          const quizzesResponse = await fetch('http://localhost:3001/api/user/recent-quizzes', {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (quizzesResponse.ok) {
            const quizzesData = await quizzesResponse.json();
            console.log('Real recent quizzes:', quizzesData);
            // Transform the data to match the expected format
            const transformedQuizzes = (quizzesData.attempts || []).map(attempt => ({
              quiz: {
                title: attempt.quizTitle || 'Unknown Quiz',
                subject: { name: attempt.subjectName || 'Unknown Subject' },
                difficulty: attempt.difficulty || 'Medium',
                subscriptionLevel: attempt.subscriptionLevel || 'Basic'
              },
              score: { percentage: attempt.score || 0 },
              passed: attempt.passed || false,
              submittedAt: attempt.attemptDate || new Date().toISOString()
            }));
            setRecentQuizzes(transformedQuizzes);
          } else {
            console.log('Recent quizzes API response not ok:', quizzesResponse.status);
            setRecentQuizzes([]);
          }
        } catch (apiError) {
          console.log('Could not fetch recent quizzes from API:', apiError);
          setRecentQuizzes([]);
        }

        try {
          // Fetch user's enrolled courses
          console.log('Fetching enrolled courses...');
          const enrolledResponse = await fetch('http://localhost:3001/api/enrolled-courses', {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (enrolledResponse.ok) {
            const enrolledData = await enrolledResponse.json();
            console.log('Enrolled courses:', enrolledData);
            setEnrolledSubjects(enrolledData.subjects || []);
          } else {
            console.log('Enrolled courses API response not ok:', enrolledResponse.status);
            setEnrolledSubjects([]);
          }
        } catch (apiError) {
          console.log('Could not fetch enrolled courses from API:', apiError);
          setEnrolledSubjects([]);
        }

      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('Failed to load dashboard data. Please try again.');
        if (err.response?.status === 401) {
          localStorage.removeItem('authToken');
          localStorage.removeItem('user');
          navigate('/login');
        }
      } finally {
        setLoading(false);
        setLastUpdated(new Date());
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleRefresh = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        navigate('/login');
        return;
      }

      // Fetch fresh data
      try {
        // Fetch user stats
        const statsResponse = await fetch('http://localhost:3001/api/user/stats', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          console.log('Refreshed user stats:', statsData);
          setStats({
            quizzesTaken: statsData.quizzesTaken || 0,
            averageScore: statsData.averageScore || 0,
            improvement: statsData.improvement || 0,
            passRate: statsData.passRate || 0,
            highestScore: statsData.highestScore || 0
          });
        }
      } catch (apiError) {
        console.log('Could not refresh user stats:', apiError);
      }

      try {
        // Fetch recent quiz attempts
        const quizzesResponse = await fetch('http://localhost:3001/api/user/recent-quizzes', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (quizzesResponse.ok) {
          const quizzesData = await quizzesResponse.json();
          console.log('Refreshed recent quizzes:', quizzesData);
          // Transform the data to match the expected format
          const transformedQuizzes = (quizzesData.attempts || []).map(attempt => ({
            quiz: {
              title: attempt.quizTitle || 'Unknown Quiz',
              subject: { name: attempt.subjectName || 'Unknown Subject' },
              difficulty: attempt.difficulty || 'Medium',
              subscriptionLevel: attempt.subscriptionLevel || 'Basic'
            },
            score: { percentage: attempt.score || 0 },
            passed: attempt.passed || false,
            submittedAt: attempt.attemptDate || new Date().toISOString()
          }));
          setRecentQuizzes(transformedQuizzes);
        }
      } catch (apiError) {
        console.log('Could not refresh recent quizzes:', apiError);
      }

      try {
        // Fetch enrolled courses
        const enrolledResponse = await fetch('http://localhost:3001/api/enrolled-courses', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (enrolledResponse.ok) {
          const enrolledData = await enrolledResponse.json();
          console.log('Refreshed enrolled courses:', enrolledData);
          setEnrolledSubjects(enrolledData.subjects || []);
        }
      } catch (apiError) {
        console.log('Could not refresh enrolled courses:', apiError);
      }
    } catch (err) {
      console.error('Error refreshing data:', err);
      setError('Failed to refresh dashboard data. Please try again.');
    } finally {
      setLoading(false);
      setLastUpdated(new Date());
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#DDE8F0] to-[#B8D4E3]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#018ABD] mx-auto mb-6"></div>
          <p className="text-[#004581] text-lg font-medium">Loading your dashboard...</p>
          <div className="mt-4">
            <img src={OnlineTestImage} alt="Loading" className="w-32 h-32 mx-auto opacity-50" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#DDE8F0] to-[#B8D4E3]">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center border-2 border-[#004581]">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold mb-4 text-[#004581]">Error Loading Dashboard</h2>
          <p className="mb-6 text-[#004581]">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-gradient-to-r from-[#018ABD] to-[#004581] text-white px-8 py-3 rounded-full hover:shadow-lg transition-all transform hover:scale-105"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#DDE8F0] to-[#B8D4E3]">
      {/* Header */}
      <header className="bg-gradient-to-r from-[#014482] via-[#0389BC] to-[#018ABD] shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg">
                <span className="text-2xl">🎯</span>
              </div>
              <h1 className="text-3xl font-bold text-white">MCQuiz Dashboard</h1>
            </div>
            <div className="flex items-center space-x-6">
              <span className="text-white font-medium text-lg">
                Welcome, {user?.firstName || 'User'}! 👋
              </span>
              <button
                onClick={handleRefresh}
                className="text-white hover:text-gray-200 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all flex items-center space-x-2"
                title="Refresh Dashboard Data"
              >
                <span className="text-xl">🔄</span>
                <span className="hidden sm:inline font-medium">Refresh</span>
              </button>
              <button
                onClick={handleLogout}
                className="text-white hover:text-gray-200 px-6 py-2 rounded-full bg-red-500/20 backdrop-blur-sm hover:bg-red-500/30 transition-all font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Banner with Image */}
        <div className="bg-gradient-to-r from-white to-blue-50 rounded-2xl shadow-xl p-8 mb-8 border-2 border-[#018ABD] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 opacity-10">
            <img src={ImageA} alt="Decoration" className="w-full h-full object-cover" />
          </div>
          <div className="relative z-10 flex justify-between items-start">
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-[#004581] mb-3 flex items-center">
                <span className="mr-3">🚀</span>
                Welcome to your Learning Dashboard!
              </h2>
              <p className="text-[#004581] opacity-80 text-lg leading-relaxed">
                Track your progress, view your enrolled courses, and continue your learning journey with our interactive quiz platform.
              </p>
            </div>
            <div className="hidden lg:block ml-8">
              <img src={OnlineTestImage} alt="Online Test" className="w-48 h-48 object-contain" />
            </div>
          </div>
          {lastUpdated && (
            <div className="absolute bottom-4 right-4 text-right">
              <p className="text-xs text-gray-500 bg-white/80 px-3 py-1 rounded-full">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </p>
            </div>
          )}
        </div>

        {/* Stats Cards with Enhanced Design */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-50 via-white to-blue-100 rounded-2xl shadow-xl p-6 border-2 border-blue-200 hover:shadow-2xl hover:scale-105 transition-all duration-300 group">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-blue-900">Quizzes Taken</h3>
              <span className="text-2xl group-hover:scale-110 transition-transform">📝</span>
            </div>
            <p className="text-4xl font-bold text-blue-600 mb-2">{stats.quizzesTaken || 0}</p>
            <div className="w-full bg-blue-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full" style={{width: `${Math.min((stats.quizzesTaken || 0) * 10, 100)}%`}}></div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 via-white to-blue-100 rounded-2xl shadow-xl p-6 border-2 border-blue-200 hover:shadow-2xl hover:scale-105 transition-all duration-300 group">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-blue-900">Average Score</h3>
              <span className="text-2xl group-hover:scale-110 transition-transform">🎯</span>
            </div>
            <p className="text-4xl font-bold text-blue-600 mb-2">
              {Number.isInteger(stats.averageScore || 0) ? (stats.averageScore || 0) : (stats.averageScore || 0).toFixed(2)}%
            </p>
            <div className="w-full bg-blue-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full" style={{width: `${stats.averageScore || 0}%`}}></div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 via-white to-blue-100 rounded-2xl shadow-xl p-6 border-2 border-blue-200 hover:shadow-2xl hover:scale-105 transition-all duration-300 group">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-blue-900">Improvement</h3>
              <span className="text-2xl group-hover:scale-110 transition-transform">📈</span>
            </div>
            <p className="text-4xl font-bold text-blue-600 mb-2">
              {(stats.improvement || 0) > 0 ? '+' : ''}
              {Number.isInteger(stats.improvement || 0) ? (stats.improvement || 0) : (stats.improvement || 0).toFixed(2)}%
            </p>
            <div className="w-full bg-blue-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full" style={{width: `${Math.abs(stats.improvement || 0)}%`}}></div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 via-white to-blue-100 rounded-2xl shadow-xl p-6 border-2 border-blue-200 hover:shadow-2xl hover:scale-105 transition-all duration-300 group">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-blue-900">Pass Rate</h3>
              <span className="text-2xl group-hover:scale-110 transition-transform">🏆</span>
            </div>
            <p className="text-4xl font-bold text-blue-600 mb-2">
              {Number.isInteger(stats.passRate || 0) ? (stats.passRate || 0) : (stats.passRate || 0).toFixed(2)}%
            </p>
            <div className="w-full bg-blue-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full" style={{width: `${stats.passRate || 0}%`}}></div>
            </div>
          </div>
        </div>

        {/* Recent Activity with Enhanced Design */}
        <div className="bg-gradient-to-br from-blue-50 via-white to-blue-100 rounded-2xl shadow-xl p-8 border-2 border-blue-200 mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 opacity-10">
            <img src={ImageB} alt="Decoration" className="w-full h-full object-cover" />
          </div>
          <div className="relative z-10">
            <h3 className="text-3xl font-bold text-blue-900 mb-8 flex items-center">
              <span className="mr-3 text-4xl">📊</span>
              Recent Quiz Attempts
            </h3>

            {recentQuizzes.length > 0 ? (
              <div className="grid gap-6">
                {recentQuizzes.map((quiz, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-xl shadow-lg p-6 flex justify-between items-center border-2 border-gray-200 hover:shadow-xl hover:border-blue-300 transition-all duration-300 transform hover:scale-[1.02]"
                  >
                    {/* Left side: quiz info */}
                    <div className="flex-1">
                      <h4 className="font-bold text-blue-900 text-lg mb-2">
                        {quiz.quiz?.title || 'Quiz'}
                      </h4>
                      <p className="text-gray-600 mb-3 flex items-center">
                        <span className="mr-2">📚</span>
                        {quiz.quiz?.subject?.name || 'Subject'} • {formatDate(quiz.submittedAt)}
                      </p>

                      {quiz.quiz?.difficulty && (
                        <span
                          className={`inline-block text-sm px-3 py-1 rounded-full font-medium ${getDifficultyColor(
                            quiz.quiz.difficulty
                          )}`}
                        >
                          {quiz.quiz.difficulty}
                        </span>
                      )}
                    </div>

                    {/* Right side: results */}
                    <div className="text-right ml-6">
                      <span
                        className={`px-4 py-2 rounded-full text-sm font-bold mb-3 inline-block ${
                          quiz.passed
                            ? 'bg-green-100 text-green-800 border-2 border-green-300'
                            : 'bg-red-100 text-red-800 border-2 border-red-300'
                        }`}
                      >
                        {quiz.passed ? '✅ Passed' : '❌ Failed'}
                      </span>
                                                                     <p
                          className={`text-4xl font-bold ${getScoreColor(
                            quiz.score?.percentage || 0
                          )}`}
                        >
                          {Number.isInteger(quiz.score?.percentage || 0) ? (quiz.score?.percentage || 0) : (quiz.score?.percentage || 0).toFixed(2)}%
                        </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-4xl">📝</span>
                </div>
                <p className="text-blue-900 opacity-80 mb-6 text-lg">
                  No recent quiz attempts found.
                </p>
                <Link
                  to="/courses"
                  className="inline-block bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-4 rounded-full text-lg font-medium hover:shadow-lg transition-all transform hover:scale-105"
                >
                  Take Your First Quiz
                </Link>
              </div>
            )}
          </div>
        </div>  

        {/* Quick Actions with Enhanced Design */}
        {user?.subscriptionLevel === 'Basic' && (
          <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl p-8 border-2 border-gray-200 mb-8">
            <h3 className="text-2xl font-bold text-[#004581] mb-6 flex items-center">
              <span className="mr-3 text-3xl">⚡</span>
              Quick Actions
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <Link
                to="/courses"
                className="bg-gradient-to-br from-blue-50 to-white rounded-xl shadow-lg p-6 border-2 border-blue-200 hover:shadow-xl hover:border-blue-400 transition-all duration-300 transform hover:scale-105 text-center group"
              >
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <span className="text-3xl">🎯</span>
                </div>
                <h4 className="font-bold text-[#004581] text-lg mb-2">Try More Quizzes</h4>
                <p className="text-gray-600">Explore our quiz collection</p>
              </Link>

              <Link
                to="/quiz-history"
                className="bg-gradient-to-br from-green-50 to-white rounded-xl shadow-lg p-6 border-2 border-green-200 hover:shadow-xl hover:border-green-400 transition-all duration-300 transform hover:scale-105 text-center group"
              >
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <span className="text-3xl">📚</span>
                </div>
                <h4 className="font-bold text-[#004581] text-lg mb-2">Quiz History</h4>
                <p className="text-gray-600">View past attempts</p>
              </Link>

              <Link
                to="/#pricing-section"
                className="bg-gradient-to-br from-purple-50 to-white rounded-xl shadow-lg p-6 border-2 border-purple-200 hover:shadow-xl hover:border-purple-400 transition-all duration-300 transform hover:scale-105 text-center group"
              >
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <span className="text-3xl">💎</span>
                </div>
                <h4 className="font-bold text-[#004581] text-lg mb-2">Go Premium</h4>
                <p className="text-gray-600">Upgrade your plan</p>
              </Link>
            </div>
          </div>
        )}

        {/* Quick Actions for pro users */}
        {user?.subscriptionLevel !== 'Basic' && (
          <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl p-8 border-2 border-gray-200 mb-8">
            <h3 className="text-2xl font-bold text-[#004581] mb-6 flex items-center">
              <span className="mr-3 text-3xl">🚀</span>
              Premium Actions
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Link
                to="/courses"
                className="bg-gradient-to-br from-blue-50 to-white rounded-xl shadow-lg p-6 border-2 border-blue-200 hover:shadow-xl hover:border-blue-400 transition-all duration-300 transform hover:scale-105 text-center group"
              >
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <span className="text-3xl">🎯</span>
                </div>
                <h4 className="font-bold text-[#004581] text-lg mb-2">Try More Quizzes</h4>
                <p className="text-gray-600">Explore our quiz collection</p>
              </Link>

              <Link
                to="/quiz-history"
                className="bg-gradient-to-br from-green-50 to-white rounded-xl shadow-lg p-6 border-2 border-green-200 hover:shadow-xl hover:border-green-400 transition-all duration-300 transform hover:scale-105 text-center group"
              >
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <span className="text-3xl">📚</span>
                </div>
                <h4 className="font-bold text-[#004581] text-lg mb-2">Quiz History</h4>
                <p className="text-gray-600">View past attempts</p>
              </Link>
            </div>
          </div>
        )}

        {/* Motivation Section */}
        <div className="bg-gradient-to-r from-[#004581] to-[#018ABD] rounded-2xl shadow-xl p-8 text-white text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 opacity-20">
            <img src={ImageC} alt="Decoration" className="w-full h-full object-cover" />
          </div>
          <div className="relative z-10">
            <h3 className="text-3xl font-bold mb-4">Keep Learning, Keep Growing!</h3>
            <p className="text-xl opacity-90 mb-6">
              Every quiz is a step towards knowledge. You're doing amazing!
            </p>
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-[#014482] to-[#0389BC] text-white py-12 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mr-4">
              <span className="text-2xl">🎯</span>
            </div>
            <h2 className="text-2xl font-bold">MCQuiz</h2>
          </div>
          <p className="text-lg opacity-90 mb-4">Your MCQ learning companion</p>
          <p className="text-sm opacity-80">
            &copy; {new Date().getFullYear()} MCQuiz. All rights reserved.
          </p>
        </div>
      </footer>

       {/* Feedback Section */}
      <FeedbackSection />
    </div>
  );
};

export default UserDashboard;
