import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

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
                difficulty: attempt.difficulty || 'Medium'
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
              difficulty: attempt.difficulty || 'Medium'
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
      <div className="min-h-screen flex items-center justify-center bg-[#DDE8F0]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#018ABD] mx-auto mb-4"></div>
          <p className="text-[#004581]">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#DDE8F0]">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center border border-[#004581]">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold mb-4 text-[#004581]">Error Loading Dashboard</h2>
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
            <h1 className="text-2xl font-bold text-white">MCQuiz Dashboard</h1>
            <div className="flex items-center space-x-4">
              <span className="text-white font-medium">
                Welcome, {user?.firstName || 'User'}!
              </span>
              <button
                onClick={handleRefresh}
                className="text-white hover:text-gray-200 px-4 py-2 rounded flex items-center space-x-1"
                title="Refresh Dashboard Data"
              >
                <span>🔄</span>
                <span className="hidden sm:inline">Refresh</span>
              </button>
              <button
                onClick={handleLogout}
                className="text-white hover:text-gray-200 px-4 py-2 rounded"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Banner */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8 border border-[#018ABD]">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-2xl font-bold text-[#004581] mb-2">
                Welcome to your Learning Dashboard! 👋
              </h2>
              <p className="text-[#004581] opacity-80">
                Track your progress, view your enrolled courses, and continue your learning journey.
              </p>
            </div>
            {lastUpdated && (
              <div className="text-right">
                <p className="text-xs text-gray-500">
                  Last updated: {lastUpdated.toLocaleTimeString()}
                </p>
              </div>
            )}
          </div>
          <Link
            to="/courses"
            className="bg-[#018ABD] text-white px-6 py-3 rounded-full font-medium hover:bg-[#004581] transition-colors inline-block"
          >
            Browse Courses
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-[#018ABD]">
            <h3 className="text-lg font-semibold text-[#004581] mb-2">Quizzes Taken</h3>
            <p className="text-3xl font-bold text-[#018ABD]">{stats.quizzesTaken || 0}</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6 border border-[#018ABD]">
            <h3 className="text-lg font-semibold text-[#004581] mb-2">Average Score</h3>
            <p className={`text-3xl font-bold ${getScoreColor(stats.averageScore || 0)}`}>
              {stats.averageScore || 0}%
            </p>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6 border border-[#018ABD]">
            <h3 className="text-lg font-semibold text-[#004581] mb-2">Improvement</h3>
            <p className={`text-3xl font-bold ${(stats.improvement || 0) > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {(stats.improvement || 0) > 0 ? '+' : ''}{stats.improvement || 0}%
            </p>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6 border border-[#018ABD]">
            <h3 className="text-lg font-semibold text-[#004581] mb-2">Pass Rate</h3>
            <p className="text-3xl font-bold text-[#018ABD]">{stats.passRate || 0}%</p>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-[#018ABD] mb-8">
          <h3 className="text-xl font-bold text-[#004581] mb-6">Recent Quiz Attempts</h3>
          {recentQuizzes.length > 0 ? (
            <div className="space-y-4">
              {recentQuizzes.map((quiz, index) => (
                <div key={index} className="border-b border-gray-200 pb-4 last:border-b-0">
                  <div className="flex justify-between items-center">
                                       <div>
                     <h4 className="font-medium text-[#004581]">{quiz.quiz?.title || 'Quiz'}</h4>
                     <p className="text-sm text-gray-600">
                       {quiz.quiz?.subject?.name || 'Subject'} • {formatDate(quiz.submittedAt)}
                     </p>
                   </div>
                   <div className="text-right">
                     <span className={`px-2 py-1 rounded-full text-sm ${quiz.passed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                       {quiz.passed ? 'Passed' : 'Failed'}
                     </span>
                     <p className={`text-lg font-bold ${getScoreColor(quiz.score?.percentage || 0)}`}>
                       {quiz.score?.percentage || 0}%
                     </p>
                   </div>
                  </div>
                                     {quiz.quiz?.difficulty && (
                     <div className="mt-2">
                       <span className={`text-xs px-2 py-1 rounded ${getDifficultyColor(quiz.quiz.difficulty)}`}>
                         {quiz.quiz.difficulty}
                       </span>
                     </div>
                   )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-[#004581] opacity-80 mb-4">No recent quiz attempts found.</p>
              <Link
                to="/courses"
                className="inline-block bg-[#018ABD] text-white px-4 py-2 rounded-full text-sm hover:bg-[#004581] transition-colors"
              >
                Take Your First Quiz
              </Link>
            </div>
          )}
        </div>

        {/* Enrolled Courses */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-[#018ABD] mb-8">
          <h3 className="text-xl font-bold text-[#004581] mb-6">My Enrolled Courses</h3>
          {enrolledSubjects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {enrolledSubjects.map((course, index) => (
                <div key={course._id || index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-[#004581]">{course.name}</h4>
                    <span className={`text-xs px-2 py-1 rounded ${course.isEnrolled ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                      {course.isEnrolled ? 'Active' : 'Available'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{course.description || 'No description available'}</p>
                  <p className="text-xs text-gray-500 mb-4">Level: {course.level}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">
                      {course.isEnrolled ? 'Continue learning' : 'Start learning'}
                    </span>
                    <Link
                      to={`/subject/${course._id}/quizzes`}
                      className="bg-[#018ABD] text-white px-4 py-2 rounded text-sm hover:bg-[#004581] transition-colors"
                    >
                      {course.isEnrolled ? 'Continue' : 'Start'}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-[#004581] opacity-80 mb-4">No enrolled courses found.</p>
              <Link
                to="/courses"
                className="inline-block bg-[#018ABD] text-white px-6 py-3 rounded-full font-medium hover:bg-[#004581] transition-colors"
              >
                Browse Courses
              </Link>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            to="/courses"
            className="bg-white rounded-lg shadow-sm p-4 border border-[#018ABD] hover:bg-gray-50 transition-colors text-center"
          >
            <h4 className="font-medium text-[#004581]">Browse Courses</h4>
            <p className="text-sm text-gray-600 mt-1">Explore new subjects</p>
          </Link>

          <Link
            to="/quiz-history"
            className="bg-white rounded-lg shadow-sm p-4 border border-[#018ABD] hover:bg-gray-50 transition-colors text-center"
          >
            <h4 className="font-medium text-[#004581]">Quiz History</h4>
            <p className="text-sm text-gray-600 mt-1">View past attempts</p>
          </Link>

          <Link
            to="/subscription"
            className="bg-white rounded-lg shadow-sm p-4 border border-[#018ABD] hover:bg-gray-50 transition-colors text-center"
          >
            <h4 className="font-medium text-[#004581]">Premium</h4>
            <p className="text-sm text-gray-600 mt-1">Upgrade your plan</p>
          </Link>

          <Link
            to="/profile"
            className="bg-white rounded-lg shadow-sm p-4 border border-[#018ABD] hover:bg-gray-50 transition-colors text-center"
          >
            <h4 className="font-medium text-[#004581]">Profile</h4>
            <p className="text-sm text-gray-600 mt-1">Manage settings</p>
          </Link>
        </div>
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

export default UserDashboard;
