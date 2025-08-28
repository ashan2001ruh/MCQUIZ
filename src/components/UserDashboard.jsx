import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import OnlineTestImage from '../Assets/Online test-amico.png';
import FeedbackSection from './FeedbackSection';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const UserDashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    quizzesTaken: 0,
    averageScore: 0,
    improvement: 0,
    passRate: 0,
    highestScore: 0,
    weeklyActivity: [],
    monthlyActivity: [],
    subjectPerformance: []
  });
  const [recentQuizzes, setRecentQuizzes] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          navigate('/login');
          return;
        }
        
        // Get user from localStorage first
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }

        // Fetch updated user profile data to get latest profile picture
        try {
          const userResponse = await fetch('http://localhost:3001/api/user/profile', {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (userResponse.ok) {
            const userData = await userResponse.json();
            console.log('👤 User Profile Data:', userData);
            setUser(userData.user);
            // Update localStorage with latest user data
            localStorage.setItem('user', JSON.stringify(userData.user));
          }
        } catch (userError) {
          console.log('Could not fetch user profile from API:', userError);
        }

        // Fetch user stats
        try {
          const statsResponse = await fetch('http://localhost:3001/api/user/stats', {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (statsResponse.ok) {
            const statsData = await statsResponse.json();
            console.log('📊 User Stats Data:', statsData);
            setStats({
              quizzesTaken: statsData.quizzesTaken || 0,
              averageScore: statsData.averageScore || 0,
              improvement: statsData.improvement || 0,
              passRate: statsData.passRate || 0,
              highestScore: statsData.highestScore || 0,
              weeklyActivity: statsData.weeklyActivity || [],
              monthlyActivity: statsData.monthlyActivity || [],
              subjectPerformance: statsData.subjectPerformance || []
            });
          }
        } catch (apiError) {
          console.log('Could not fetch user stats from API:', apiError);
        }

        // Fetch recent quiz attempts
        try {
          const quizzesResponse = await fetch('http://localhost:3001/api/user/recent-quizzes', {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (quizzesResponse.ok) {
            const quizzesData = await quizzesResponse.json();
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
          console.log('Could not fetch recent quizzes from API:', apiError);
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
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Prepare chart data
  const weeklyChartData = (() => {
    // Use the array directly from backend (already properly ordered Monday to Sunday)
    const chartData = stats.weeklyActivity || Array(7).fill(0);
    
    console.log('📊 Weekly Chart Data Debug:', {
      weeklyActivity: stats.weeklyActivity,
      chartData: chartData,
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    });
    
    return {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      datasets: [
        {
          label: 'Quizzes Taken',
          data: chartData,
          backgroundColor: 'rgba(1, 138, 189, 0.8)',
          borderColor: 'rgba(1, 138, 189, 1)',
          borderWidth: 2,
          borderRadius: 4,
          borderSkipped: false,
        }
      ]
    };
  })();

  const monthlyChartData = (() => {
    // Create months array for the last 6 months
    const months = [];
    const currentDate = new Date();
    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      months.push(monthDate.toLocaleDateString('en-US', { month: 'short' }));
    }

    // Create chart data array
    const chartData = [];
    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const year = monthDate.getFullYear();
      const month = monthDate.getMonth() + 1;
      
      // Find matching month data from backend
      const monthData = stats.monthlyActivity.find(activity => {
        if (!activity.month) return false;
        const [activityYear, activityMonth] = activity.month.split('-');
        return parseInt(activityYear) === year && parseInt(activityMonth) === month;
      });
      
      chartData.push(monthData ? monthData.averageScore : 0);
    }

    console.log('📊 Monthly Chart Data Debug:', {
      monthlyActivity: stats.monthlyActivity,
      chartData: chartData,
      labels: months
    });

    return {
      labels: months,
      datasets: [
        {
          label: 'Average Score (%)',
          data: chartData,
          borderColor: 'rgba(1, 138, 189, 1)',
          backgroundColor: 'rgba(1, 138, 189, 0.1)',
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: 'rgba(1, 138, 189, 1)',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 6,
          pointHoverRadius: 8,
        }
      ]
    };
  })();

  const progressChartData = {
    labels: ['Completed', 'Remaining'],
    datasets: [
      {
        data: [stats.averageScore || 0, 100 - (stats.averageScore || 0)],
        backgroundColor: [
          'rgba(1, 138, 189, 0.8)',
          'rgba(229, 231, 235, 0.5)'
        ],
        borderColor: [
          'rgba(1, 138, 189, 1)',
          'rgba(229, 231, 235, 1)'
        ],
        borderWidth: 2,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'rgba(1, 138, 189, 1)',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(0, 0, 0, 0.1)' },
        ticks: { color: '#6B7280', font: { size: 12 } },
      },
      x: {
        grid: { display: false },
        ticks: { color: '#6B7280', font: { size: 12 } },
      },
    },
  };

  const lineChartOptions = {
    ...chartOptions,
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        grid: { color: 'rgba(0, 0, 0, 0.1)' },
        ticks: {
          color: '#6B7280',
          font: { size: 12 },
          callback: function(value) { return value + '%'; }
        },
      },
      x: {
        grid: { display: false },
        ticks: { color: '#6B7280', font: { size: 12 } },
      },
    },
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#018ABD] mx-auto mb-6"></div>
          <p className="text-gray-700 text-lg font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-blue-50">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold mb-4 text-gray-800">Error Loading Dashboard</h2>
          <p className="mb-6 text-gray-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-[#018ABD] text-white px-8 py-3 rounded-lg hover:bg-[#004581] transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blue-50 flex">
      {/* Left Sidebar */}
      <div className="w-64 bg-white shadow-lg fixed h-full z-10">
        {/* Logo */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-r from-[#014482] to-[#018ABD] rounded-xl flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform duration-200">
                  <span className="text-3xl text-white font-bold">Q</span>
                </div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-[#014482] to-[#018ABD] bg-clip-text text-transparent">
                    MCQuiz
                  </h1>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="mt-8 px-4">
          <div className="space-y-2">
            <Link
              to="/courses"
              className="flex items-center px-4 py-3 text-gray-700 font-medium rounded-lg hover:bg-gray-100 transition-colors"
            >
              <svg className="w-5 h-5 mr-3 text-[#018ABD]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Try Quizzes</span>
            </Link>

            <Link
              to="/quiz-history"
              className="flex items-center px-4 py-3 text-gray-700 font-medium rounded-lg hover:bg-gray-100 transition-colors"
            >
              <svg className="w-5 h-5 mr-3 text-[#018ABD]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <span>Quiz History</span>
            </Link>

            <Link
              to="/user-profile"
              className="flex items-center px-4 py-3 text-gray-700 font-medium rounded-lg hover:bg-gray-100 transition-colors"
            >
              <svg className="w-5 h-5 mr-3 text-[#018ABD]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>Profile</span>
            </Link>

            <button
              onClick={() => {
                const feedbackSection = document.getElementById('feedback-section');
                if (feedbackSection) {
                  feedbackSection.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="flex items-center px-4 py-3 text-gray-700 font-medium rounded-lg hover:bg-gray-100 transition-colors w-full text-left"
            >
              <svg className="w-5 h-5 mr-3 text-[#018ABD]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span>Feedback</span>
            </button>
          </div>
        </nav>

        {/* Upgrade Account Card - Only show for Basic users */}
        {user?.subscriptionLevel === 'Basic' && (
          <div className="px-4 mt-8">
            <div className="bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-xl p-4 text-white">
              <div className="flex items-center mb-3">
                <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <h3 className="font-semibold text-sm">Upgrade your Account to Pro</h3>
              </div>
              <p className="text-xs mb-3 opacity-90">Upgrade to premium to get premium features</p>
              <Link
                to="/"
                onClick={(e) => {
                  e.preventDefault();
                  navigate('/');
                  // Wait for navigation to complete, then scroll to pricing section
                  setTimeout(() => {
                    const pricingSection = document.getElementById('pricing-section');
                    if (pricingSection) {
                      pricingSection.scrollIntoView({ behavior: 'smooth' });
                    }
                  }, 100);
                }}
                className="block w-full bg-white text-yellow-600 text-center py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors text-sm"
              >
                Upgrade
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="ml-64 flex-1">
        {/* Top Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700 font-medium">
                Welcome, {user?.firstName || 'User'}! 👋
              </span>
              <div className="flex items-center space-x-2">
                {user?.profilePicture && user.profilePicture.trim() !== '' ? (
                  <img
                    src={user.profilePicture.startsWith('http') ? user.profilePicture : `http://localhost:3001/${user.profilePicture}`}
                    alt="Profile"
                    className="w-10 h-10 rounded-full object-cover border-2 border-[#018ABD]"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full border-2 border-[#018ABD] bg-gray-50 flex items-center justify-center">
                    <svg className="w-6 h-6 text-[#018ABD]" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                    </svg>
                  </div>
                )}
                <button
                  onClick={handleLogout}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors text-sm"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Dashboard Content */}
        <div className="p-6">
          {/* Welcome Banner */}
          <div className="bg-gradient-to-r from-[#014482] via-[#0389BC] to-[#018ABD] rounded-2xl p-8 mb-8 text-white relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h2 className="text-3xl font-bold mb-2">Welcome to MCQuiz Learning Platform! 🎯</h2>
                <p className="text-lg opacity-90">Master your subjects with our comprehensive MCQ practice tests. Track your progress, improve your skills, and achieve academic excellence!</p>
                <Link
                  to="/courses"
                  className="inline-block bg-white text-[#018ABD] px-6 py-3 rounded-lg font-semibold mt-4 hover:bg-gray-100 transition-colors"
                >
                  Start Learning
                </Link>
              </div>
              <div className="hidden lg:block">
                <img src={OnlineTestImage} alt="Online Test" className="w-48 h-48 object-contain" />
              </div>
            </div>
          </div>

          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Quizzes Taken</h3>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <p className="text-3xl font-bold text-green-600">{stats.quizzesTaken || 0}</p>
              <p className="text-sm text-gray-600 mt-2">Total quizzes completed</p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Average Score</h3>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
              <p className="text-3xl font-bold text-blue-600">
                {Number.isInteger(stats.averageScore || 0) ? (stats.averageScore || 0) : (stats.averageScore || 0).toFixed(1)}%
              </p>
              <p className="text-sm text-gray-600 mt-2">Your performance score</p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Pass Rate</h3>
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                </div>
              </div>
              <p className="text-3xl font-bold text-purple-600">
                {Number.isInteger(stats.passRate || 0) ? (stats.passRate || 0) : (stats.passRate || 0).toFixed(1)}%
              </p>
              <p className="text-sm text-gray-600 mt-2">Success rate</p>
            </div>
          </div>

          {/* Charts and Analytics Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Learning Activity Chart */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
              <h3 className="text-xl font-semibold text-gray-800 mb-6">Learning Activity (This Week)</h3>
              <div className="h-64">
                <Bar data={weeklyChartData} options={chartOptions} />
              </div>
              <p className="text-center text-gray-500 text-sm mt-4">
                {stats.weeklyActivity && stats.weeklyActivity.length > 0 
                  ? 'Based on your quiz activity this week' 
                  : 'No quiz activity this week yet'}
              </p>
            </div>

            {/* Progress Donut Chart */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
              <h3 className="text-xl font-semibold text-gray-800 mb-6">Overall Progress</h3>
              <div className="flex items-center justify-center mb-6">
                <div className="relative w-32 h-32">
                  <Doughnut 
                    data={progressChartData} 
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { display: false },
                        tooltip: { enabled: false },
                      },
                      cutout: '70%',
                    }} 
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold text-gray-800">{stats.averageScore || 0}%</span>
                  </div>
                </div>
              </div>
              <p className="text-center text-gray-600 mb-4">Your average quiz performance</p>
              <div className="text-center text-sm text-gray-500 mb-4">
                <p>Quizzes: {stats.quizzesTaken || 0}</p>
                <p>Pass Rate: {stats.passRate || 0}%</p>
                <p>Highest Score: {stats.highestScore || 0}%</p>
              </div>
              <button 
                onClick={() => navigate('/quiz-history')}
                className="w-full bg-[#014482] text-white py-2 rounded-lg font-medium hover:bg-[#004581] transition-colors"
              >
                View Detailed Stats
              </button>
            </div>
          </div>

          {/* Score Activity Chart */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 mb-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-6">Score Performance (Last 6 Months)</h3>
            <div className="h-64">
              <Line data={monthlyChartData} options={lineChartOptions} />
            </div>
            <p className="text-center text-gray-500 text-sm mt-4">
              {stats.monthlyActivity && stats.monthlyActivity.length > 0 
                ? 'Based on your monthly performance' 
                : 'Complete more quizzes to see your monthly performance data'}
            </p>
          </div>

          {/* Recent Quiz Attempts */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 mb-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-6">Recent Quiz Attempts</h3>
            {recentQuizzes.length > 0 ? (
              <div className="space-y-4">
                {recentQuizzes.slice(0, 5).map((quiz, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-[#018ABD] rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-800">{quiz.quiz?.title || 'Quiz'}</h4>
                        <p className="text-sm text-gray-600">{quiz.quiz?.subject?.name || 'Subject'}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-lg font-bold ${getScoreColor(quiz.score?.percentage || 0)}`}>
                        {quiz.score?.percentage || 0}%
                      </p>
                      <p className="text-sm text-gray-600">{formatDate(quiz.submittedAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600">No recent quiz attempts found.</p>
                <Link
                  to="/courses"
                  className="inline-block bg-[#018ABD] text-white px-6 py-2 rounded-lg mt-4 hover:bg-[#004581] transition-colors"
                >
                  Take Your First Quiz
                </Link>
              </div>
            )}
          </div>

          {/* Feedback Section */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 mb-8" id="feedback-section">
            <h3 className="text-xl font-semibold text-gray-800 mb-6">Share Your Feedback</h3>
            <FeedbackSection />
          </div>

          
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
