import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const Courses = () => {
  const [subjects, setSubjects] = useState([]);
  const [levels, setLevels] = useState([]);
  const [selectedLevel, setSelectedLevel] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [subjectQuizzes, setSubjectQuizzes] = useState({});
  
  const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };
  
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        setLoading(true);
        
        let url;
        if (selectedLevel) {
          const encodedLevel = encodeURIComponent(selectedLevel);
          url = `${process.env.REACT_APP_API_URL || 'http://localhost:3001'}/api/subjects/level/${encodedLevel}`;
        } else {
          url = `${process.env.REACT_APP_API_URL || 'http://localhost:3001'}/api/subjects`;
        }
        
        const response = await axios.get(url, {
          headers: getAuthHeader()
        });
        
        if (selectedLevel) {
          setSubjects(response.data.subjects || []);
        } else {
          const subjectsData = response.data.subjects || [];
          setSubjects(subjectsData);
          
          if (Array.isArray(subjectsData)) {
            const uniqueLevels = [...new Set(subjectsData.map(subject => subject.level).filter(Boolean))];
            setLevels(uniqueLevels);
          }
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching subjects:', err);
        setError('Failed to load subjects. Please try again later.');
        setLoading(false);
      }
    };
    fetchSubjects();
  }, [selectedLevel]);
  
  useEffect(() => {
    const fetchQuizzes = async () => {
      if (!subjects.length) return;
      
      const quizzesBySubject = {};
      
      for (const subject of subjects) {
        if (!subject || !subject._id) continue;
        
        try {
          const url = `${process.env.REACT_APP_API_URL || 'http://localhost:3001'}/api/quizzes/subject/${subject._id}`;
          const response = await axios.get(url, {
            headers: getAuthHeader()
          });
          
          if (response.data && response.data.quizzes) {
            quizzesBySubject[subject._id] = response.data.quizzes;
          }
        } catch (err) {
          console.error(`Error fetching quizzes for subject ${subject._id}:`, err);
        }
      }
      
      setSubjectQuizzes(quizzesBySubject);
    };
    
    fetchQuizzes();
  }, [subjects]);

  const handleLevelChange = (level) => {
    setSelectedLevel(level);
  };
  
  const resetFilter = () => {
    setSelectedLevel('');
  };
  
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
              onClick={() => handleLevelChange(level)}
              className={`px-4 py-2 rounded-3xl border border-[#014482] text-[#014482] ${
                selectedLevel === level 
                  ? 'bg-[#014482] text-white' 
                  : 'bg-transparent hover:bg-gray-100'
              }`}
            >
              {level === "Grade 5" ? "Grade 5 Scholarship" : 
               level === "OL" ? "GCE O/L" : 
               level === "AL" ? "GCE A/L" : level}
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
      ) : selectedLevel ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjects.map((subject) => (
            subject && subject.isActive && (
              <SubjectCard 
                key={subject._id} 
                subject={subject} 
                quizzes={subjectQuizzes[subject._id] || []} 
              />
            )
          ))}
        </div>
      ) : (
        Object.keys(subjectsByLevel).map((level) => (
          <div key={level} className="mb-12">
            <h2 className="text-2xl font-bold mb-4 pb-2 border-b-2 border-gray-200">
              {level} <span className="text-gray-500 text-lg">({subjectsByLevel[level].length} subjects)</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {subjectsByLevel[level].map((subject) => (
                <SubjectCard 
                  key={subject._id} 
                  subject={subject}
                  quizzes={subjectQuizzes[subject._id] || []}
                />
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

const SubjectCard = ({ subject, quizzes }) => {
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
                      <Link
                        to=""
                        className="px-3 py-1 text-sm bg-[#008ABD] text-white rounded hover:bg-blue-700 transition-colors"
                      >
                        Try Now
                      </Link>
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