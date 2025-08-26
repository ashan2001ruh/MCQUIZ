import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

const Courses = () => {
  const [subjects, setSubjects] = useState([]);
  const [levels, setLevels] = useState([]);
  const [selectedLevel, setSelectedLevel] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [subjectQuizzes, setSubjectQuizzes] = useState({});
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const subscriptionAccess = {
    'Basic': ['A/L', 'O/L', 'Scholarship'], // Can see all subjects
    'A/L Pro': ['A/L'],
    'O/L Pro': ['O/L'],
    'School Pro': ['Scholarship']
  };
  
  const canAccessSubject = (subjectLevel) => {
    const userSub = user.subscriptionLevel || 'Basic';
    const allowedLevels = subscriptionAccess[userSub] || [];
  
    if (user?.role === 'admin') return true;
  
    return allowedLevels.includes(subjectLevel);
  };
  
  const getAuthHeader = () => {
    const token = localStorage.getItem('authToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const handleLevelChange = (level) => {
    setSelectedLevel(level);
  };

  const resetFilter = () => {
    setSelectedLevel('');
  };
  
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        setLoading(true);
        let url;
        if (selectedLevel) {
          const encodedLevel = encodeURIComponent(selectedLevel);
          url = `/api/subjects/level/${encodedLevel}`;
        } else {
          url = `/api/subjects`;
        }
        const response = await axios.get(url, {
          headers: getAuthHeader()
        });
        let subjectsData;
        if (selectedLevel) {
          subjectsData = response.data.subjects || [];
          setSubjects(subjectsData);
        } else {
          subjectsData = response.data.subjects || [];
          setSubjects(subjectsData);
          if (Array.isArray(subjectsData)) {
            const uniqueLevels = [...new Set(subjectsData.map(subject => subject.level).filter(Boolean))];
            // Sort levels in the desired order: A/L, O/L, Scholarship
            const sortedLevels = uniqueLevels.sort((a, b) => {
              const order = { 'A/L': 1, 'O/L': 2, 'Scholarship': 3 };
              return (order[a] || 999) - (order[b] || 999);
            });
            setLevels(sortedLevels);
          }
        }
        setLoading(false);
      } catch (err) {
        setError('Failed to load subjects. Please try again later.');
        setLoading(false);
      }
    };
    fetchSubjects();
  }, [selectedLevel]);
  
  useEffect(() => {
    const fetchQuizzes = async () => {
      if (!subjects.length) return;

      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const userLevel = user.subscriptionLevel || 'Basic';

      console.log("userLevel : ",userLevel);

      const quizzesBySubject = {};
      for (const subject of subjects) {
        if (!subject || !subject._id) continue;
        try {
          const url = `/api/user-quizzes/subject/${subject._id}`;
          const response = await axios.get(url, {
            headers: getAuthHeader()
          });
          if (response.data && response.data.quizzes) {
            // FILTER QIUZES TO MATCH USER SUBSCRIPTION LEVEL
            //quizzesBySubject[subject._id] = response.data.quizzes.filter(quiz => quiz.subscriptionLevel === userLevel);

            quizzesBySubject[subject._id] = response.data.quizzes.filter(quiz => {
              if (user?.role === 'admin') return true;
              return quiz.subscriptionLevel === userLevel;
            });

            console.log("Quizzes for subject", subject.name, ":", quizzesBySubject[subject._id]);
          }
        } catch (err) {
          // Ignore errors for individual subjects
        }
      }
      setSubjectQuizzes(quizzesBySubject);
      console.log(quizzesBySubject);
    };
    fetchQuizzes();
  }, [subjects]);
  
  const subjectsByLevel = Array.isArray(subjects) 
    ? subjects.reduce((acc, subject) => {
        if (!subject || !subject.isActive) return acc;
        if (!acc[subject.level]) {
          acc[subject.level] = [];
        }
        acc[subject.level].push(subject);
        return acc;
      }, {})
    : {};

  // Check if user is authenticated
  const isAuthenticated = () => {
    const token = localStorage.getItem('authToken');
    if (!token) return false;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp > Date.now() / 1000;
    } catch (error) {
      return false;
    }
  };

  // Check if subject requires subscription (Pro/OL/AL)
  const requiresSubscription = (level) => {
    return ['Pro', 'OL', 'AL'].includes(level);
  };

  // Handle quiz attempt with authentication and subscription checks
  const handleQuizAttempt = (quiz, subject) => {
    if (!isAuthenticated()) {
      alert('Please login to take this quiz');
      navigate('/login', { state: { from: `/quizzes/${quiz._id}/attempt` } });
      return;
    }
    if (requiresSubscription(subject.level)) {
      // Check if user has active subscription
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (!user.subscription || user.subscription.status !== 'active') {
        alert('This quiz requires a subscription. Please upgrade to access Pro/OL/AL content.');
        navigate('/pricing');
        return;
      }
    }
    // If all checks pass, navigate to quiz
    navigate(`/quizzes/${quiz._id}/attempt`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">
        <span className="text-[#014482]">All </span>
        <span className="text-[#018ABE]">Courses</span>
      </h1>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Filter by Level:</h2>
        <div className="flex flex-wrap gap-3 justify-center">
          <button
            onClick={resetFilter}
            className={`px-4 py-2 rounded-3xl border border-[#014482] text-[#014482] ${
              !selectedLevel 
                ? 'bg-[#014482] text-white' 
                : 'bg-transparent hover:bg-gray-100'
            }`}
          >
            All Subjects
          </button>
          {levels.map((level) => (
            <button
              key={level}
              onClick={() => handleLevelChange(level === 'School' ? 'Scholarship' : level)}
              className={`px-4 py-2 rounded-3xl border border-[#014482] text-[#014482] ${
                selectedLevel === level 
                  ? 'bg-[#014482] text-white' 
                  : 'bg-transparent hover:bg-gray-100'
              }`}
            >
              {level === "School" ? "Scholarship" :
               level === "Scholarship" ? "Scholarship" : 
               level === "O/L" ? "O/L" : 
               level === "A/L" ? "A/L" : level}
            </button>
          ))}
        </div>
      </div>


      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      ) : !Array.isArray(subjects) || subjects.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-xl text-gray-600">No subjects available</h3>
        </div>
      ) : (
        Object.keys(subjectsByLevel).map((level) => {
          const accessibleSubjects = subjectsByLevel[level].filter(subject =>
            subject?.isActive && canAccessSubject(subject.level)
          );
        
          if (accessibleSubjects.length === 0) return null; // ✅ Skip this level
        
          return (
            <div key={level} className="mb-12">
              <h2 className="text-2xl font-bold mb-4 pb-2 border-b-2 border-gray-200">
                {level} <span className="text-gray-500 text-lg">({accessibleSubjects.length} subjects)</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {accessibleSubjects.map((subject) => (
                  <SubjectCard 
                    key={subject._id} 
                    subject={subject}
                    quizzes={subjectQuizzes[subject._id] || []}
                    onQuizAttempt={handleQuizAttempt}
                  />
                ))}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

const SubjectCard = ({ subject, quizzes, onQuizAttempt }) => {
  const [expanded, setExpanded] = useState(false);
  const toggleExpanded = () => {
    setExpanded(!expanded);
  };
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 border border-[#0688BB]">
      <img 
        src="https://img.freepik.com/free-photo/front-view-stacked-books-graduation-cap-ladders-education-day_23-2149241014.jpg?t=st=1746176242~exp=1746179842~hmac=0fa67eaf44abbfc65644cc32553dd6220ebe7fa1dec2630ec5ecad6b230aa749&w=740" 
        alt="Course Image" 
        className="w-full h-48 object-cover"
      />
      <div className="p-6">
        <h3 className="text-xl font-bold mb-2 text-[#0688BB] text-left">{subject.name}</h3>
        <p className="text-sm text-[#585858] mb-4">{subject.level}</p>
        {subject.description && (
          <p className="text-[#585858] mb-4 line-clamp-3">{subject.description}</p>
        )}
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm font-medium text-[#0688BB]">
            {quizzes.length || 0} {(quizzes.length === 1) ? 'Quiz' : 'Quizzes'}
          </span>
          <button
            onClick={toggleExpanded}
            className="px-4 py-2 text-[#0688BB] border border-[#0688BB] rounded-md hover:bg-gray-100 transition-colors"
          >
            {expanded ? 'Hide Quizzes' : 'Show Quizzes'}
          </button>
        </div>
        {expanded && quizzes.length > 0 && (
          <div className="mt-4 border-t pt-4">
            <h4 className="font-medium mb-3">Available Quizzes:</h4>
            <ul className="space-y-3">
                {quizzes.map((quiz, index) => (
                  <li key={quiz._id} className="border-b pb-2">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-black">
                        {String(index + 1).padStart(2, '0')}. {quiz.title} 
                        <span className="ml-2 text-sm text-gray-500">
                          (Q.{quiz.questionsCount || '?'})
                        </span>
                      </span>
                      <button
                        onClick={() => onQuizAttempt(quiz, subject)}
                        className="px-3 py-1 text-sm bg-[#008ABD] text-white rounded hover:bg-blue-700 transition-colors"
                      >
                        Try Now
                      </button>
                    </div>
                  </li>
                ))}
            </ul>
          </div>
        )}
        {expanded && quizzes.length === 0 && (
          <div className="mt-4 border-t pt-4 text-center text-gray-500">
            No quizzes available for this subject yet.
          </div>
        )}
      </div>
    </div>
  );
};

export default Courses;