import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { quizService, handleApiError } from '../services/apiService';

const SubjectQuizzes = () => {
  const { subjectId } = useParams();
  const navigate = useNavigate();
  const [subject, setSubject] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  const difficulties = ['Easy', 'Medium', 'Hard'];
  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'title', label: 'Title A-Z' },
    { value: 'difficulty', label: 'Difficulty' }
  ];

  // Fetch quizzes for the subject
  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await quizService.getQuizzesBySubject(subjectId);
      setSubject(data.subject);
      setQuizzes(data.quizzes || []);
    } catch (err) {
      console.error('Error fetching quizzes:', err);
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (subjectId) {
      fetchQuizzes();
    }
  }, [subjectId]);

  // Filter and sort quizzes
  const getFilteredAndSortedQuizzes = () => {
    let filtered = [...quizzes];

    // Filter by difficulty
    if (selectedDifficulty) {
      filtered = filtered.filter(quiz => quiz.difficulty === selectedDifficulty);
    }

    // Sort quizzes
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'oldest':
          return new Date(a.createdAt) - new Date(b.createdAt);
        case 'title':
          return a.title.localeCompare(b.title);
        case 'difficulty':
          const difficultyOrder = { 'Easy': 1, 'Medium': 2, 'Hard': 3 };
          return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
        default:
          return 0;
      }
    });

    return filtered;
  };

  // Format time limit
  const formatTimeLimit = (minutes) => {
    if (!minutes) return 'No time limit';
    if (minutes < 60) return `${minutes} minutes`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  // Get difficulty color
  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy':
        return 'bg-green-100 text-green-800';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'Hard':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get user progress status
  const getProgressStatus = (userProgress) => {
    if (!userProgress.hasAttempted) {
      return { status: 'Not Started', color: 'text-gray-600', bg: 'bg-gray-100' };
    } else if (userProgress.passed) {
      return { status: 'Passed', color: 'text-green-600', bg: 'bg-green-100' };
    } else {
      return { status: 'In Progress', color: 'text-orange-600', bg: 'bg-orange-100' };
    }
  };

  // Navigate to quiz attempt page
  const handleTryNow = (quizId) => {
    navigate(`/quizzes/${quizId}/attempt`);
  };

  const filteredQuizzes = getFilteredAndSortedQuizzes();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#DDE8F0' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto" style={{ borderColor: '#018ABD' }}></div>
          <p className="mt-4" style={{ color: '#004581', opacity: 0.8 }}>Loading quizzes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#DDE8F0' }}>
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">⚠️</div>
          <p className="text-red-600 mb-4">{error}</p>
          <div className="space-x-4">
            <button
              onClick={fetchQuizzes}
              className="text-white px-6 py-3 rounded-full font-medium transition-colors hover:opacity-90"
              style={{ backgroundColor: '#018ABD' }}
            >
              Try Again
            </button>
            <button
              onClick={() => navigate('/courses')}
              className="text-white px-6 py-3 rounded-full font-medium transition-colors hover:opacity-90"
              style={{ backgroundColor: '#018ABD' }}
            >
              Back to Courses
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#DDE8F0' }}>
      {/* Header Section */}
      <div className="shadow-sm" style={{ backgroundColor: '#DDE8F0' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <nav className="flex items-center justify-center space-x-2 text-sm mb-4" style={{ color: '#004581', opacity: 0.7 }}>
              <button
                onClick={() => navigate('/courses')}
                className="transition-colors hover:opacity-100"
                style={{ color: '#004581' }}
              >
                Courses
              </button>
              <span>/</span>
              <span style={{ color: '#004581' }}>{subject?.name}</span>
            </nav>
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">
              <span style={{ color: '#004581' }}>{subject?.name} </span>
              <span style={{ color: '#018ABD' }}>Quizzes</span>
            </h1>
            <div className="flex items-center justify-center space-x-4">
              <span 
                className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium border-2"
                style={{ 
                  backgroundColor: '#DDE8F0', 
                  color: '#004581',
                  borderColor: '#018ABD'
                }}
              >
                {subject?.level}
              </span>
              <span style={{ color: '#004581', opacity: 0.7 }}>
                {quizzes.length} quiz{quizzes.length !== 1 ? 'es' : ''} available
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="rounded-lg shadow-sm p-6" style={{ backgroundColor: '#DDE8F0' }}>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            {/* Difficulty Filter */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedDifficulty('')}
                className={`px-6 py-3 rounded-full font-medium transition-colors ${
                  selectedDifficulty === ''
                    ? 'text-white'
                    : 'border-2'
                }`}
                style={selectedDifficulty === '' 
                  ? { backgroundColor: '#018ABD' }
                  : { backgroundColor: '#DDE8F0', color: '#004581', borderColor: '#018ABD' }
                }
              >
                All Difficulties
              </button>
              {difficulties.map((difficulty) => (
                <button
                  key={difficulty}
                  onClick={() => setSelectedDifficulty(difficulty)}
                  className={`px-6 py-3 rounded-full font-medium transition-colors ${
                    selectedDifficulty === difficulty
                      ? 'text-white'
                      : 'border-2'
                  }`}
                  style={selectedDifficulty === difficulty 
                    ? { backgroundColor: '#018ABD' }
                    : { backgroundColor: '#DDE8F0', color: '#004581', borderColor: '#018ABD' }
                  }
                >
                  {difficulty}
                </button>
              ))}
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium" style={{ color: '#004581' }}>Sort by:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border-2 rounded-full px-4 py-2 focus:ring-2 focus:ring-opacity-50"
                style={{ 
                  borderColor: '#018ABD', 
                  backgroundColor: '#DDE8F0',
                  color: '#004581',
                  focusRingColor: '#018ABD'
                }}
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Results Info */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-4">
        <p style={{ color: '#004581', opacity: 0.7 }}>
          Showing {filteredQuizzes.length} of {quizzes.length} quizzes
          {selectedDifficulty && ` (${selectedDifficulty} difficulty)`}
        </p>
      </div>

      {/* Quizzes Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {filteredQuizzes.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4" style={{ color: '#004581', opacity: 0.5 }}>📝</div>
            <h3 className="text-xl font-semibold mb-2" style={{ color: '#004581' }}>No quizzes found</h3>
            <p style={{ color: '#004581', opacity: 0.7 }}>
              {selectedDifficulty
                ? `No ${selectedDifficulty.toLowerCase()} quizzes available for this subject`
                : 'No quizzes are currently available for this subject'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredQuizzes.map((quiz) => {
              const progressStatus = getProgressStatus(quiz.userProgress);
              
              return (
                <div
                  key={quiz.id}
                  className="rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden"
                  style={{ backgroundColor: '#DDE8F0' }}
                >
                  <div className="p-6">
                    {/* Quiz Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold mb-2 line-clamp-2" style={{ color: '#004581' }}>
                          {quiz.title}
                        </h3>
                        {quiz.description && (
                          <p className="text-sm mb-3 line-clamp-2" style={{ color: '#004581', opacity: 0.7 }}>
                            {quiz.description}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Quiz Meta Information */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <span style={{ color: '#004581', opacity: 0.7 }}>Questions:</span>
                        <span className="font-semibold" style={{ color: '#004581' }}>{quiz.questionsCount}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span style={{ color: '#004581', opacity: 0.7 }}>Time Limit:</span>
                        <span className="font-semibold" style={{ color: '#004581' }}>{formatTimeLimit(quiz.timeLimit)}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span style={{ color: '#004581', opacity: 0.7 }}>Passing Score:</span>
                        <span className="font-semibold" style={{ color: '#004581' }}>{quiz.passingScore}%</span>
                      </div>
                    </div>

                    {/* Difficulty Badge */}
                    <div className="flex items-center justify-center mb-4">
                      <span 
                        className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium border-2"
                        style={{ 
                          backgroundColor: '#DDE8F0', 
                          color: '#004581',
                          borderColor: '#018ABD'
                        }}
                      >
                        {quiz.difficulty}
                      </span>
                    </div>

                    {/* Action Button */}
                    <button
                      onClick={() => handleTryNow(quiz.id)}
                      className="w-full text-white py-3 px-6 rounded-full transition-colors duration-200 font-semibold hover:opacity-90"
                      style={{ backgroundColor: '#018ABD' }}
                    >
                      Try Now
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default SubjectQuizzes;