import React, { useState, useEffect, useRef } from 'react';
import Axios from 'axios';
import { useNavigate } from 'react-router-dom';
import AddQuiz from './AddQuiz'; 
import EditQuiz from './EditQuiz';
import DeleteQuiz from './DeleteQuiz';
import AddSubjectModal from './modals/AddSubjectModal';
import EditSubjectModal from './modals/EditSubjectModal';
import DeleteConfirmModal from './modals/DeleteConfirmModal';
import { FaSearch, FaSignOutAlt, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import AdminFeedbackManagement from './AdminFeedbackManagement';

export default function Dashboard() {
  const [adminData, setAdminData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [quizStats, setQuizStats] = useState(null);
  const [subjectStats, setSubjectStats] = useState(null);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });
  const [filters, setFilters] = useState({
    search: '',
    subject: '',
    difficulty: '',
    active: '',
    subscriptionLevel: ''
  });
  
  const [isAddQuizOpen, setIsAddQuizOpen] = useState(false);
  const [isEditQuizOpen, setIsEditQuizOpen] = useState(false);
  const [currentQuiz, setCurrentQuiz] = useState(null);
  const [isDeleteQuizOpen, setIsDeleteQuizOpen] = useState(false);
  const [quizToDelete, setQuizToDelete] = useState(null);
  
  const [subjects, setSubjects] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentSubject, setCurrentSubject] = useState(null);
  const [subjectFilters, setSubjectFilters] = useState({
    level: '',
    search: '',
    page: 1,
    limit: 10
  });
  const [subjectPagination, setSubjectPagination] = useState({
    total: 0,
    pages: 1
  });
  
  const navigate = useNavigate();
  
  useEffect(() => {
    const checkAdminAuth = async () => {
      const user = JSON.parse(localStorage.getItem('user')) || {};
      const token = localStorage.getItem('authToken');
      
      if (!token || user.role !== 'admin') {
        navigate('/login');
        return;
      }
      
      try {
        const response = await Axios.get('http://localhost:3001/api/admin/profile', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        setAdminData(response.data);        
        fetchQuizzes();
        fetchQuizStats();
        fetchSubjectStats();
        fetchSubjects();
        
      } catch (error) {
        console.error('Failed to fetch admin data:', error);
        setError('Failed to load admin data. Please login again.');
        setLoading(false);
        
        if (error.response && error.response.status === 401) {
          localStorage.removeItem('authToken');
          localStorage.removeItem('user');
          navigate('/login');
        }
      }
    };
    
    checkAdminAuth();
  }, [navigate]);
  
  const fetchQuizzes = async (page = 1) => {
    try {
      const token = localStorage.getItem('authToken');
      const { search, subject, difficulty, active, subscriptionLevel } = filters;
      
      let url = `http://localhost:3001/api/admin/quizzes?page=${page}&limit=${pagination.limit}`;
      
      if (search) url += `&search=${search}`;
      if (subject) url += `&subject=${subject}`;
      if (difficulty) url += `&difficulty=${difficulty}`;
      if (active !== '') url += `&active=${active}`;
      if (subscriptionLevel) url += `&subscriptionLevel=${subscriptionLevel}`;
      
      const response = await Axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setQuizzes(response.data.quizzes);
      setPagination({
        ...pagination,
        page: response.data.pagination.page,
        total: response.data.pagination.total,
        pages: response.data.pagination.pages
      });
      
    } catch (error) {
      console.error('Failed to fetch quizzes:', error);
      setError('Failed to load quizzes. Please try again.');
    }
  };
  
  const fetchQuizStats = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await Axios.get('http://localhost:3001/api/admin/quizzes/stats', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setQuizStats(response.data);
      
    } catch (error) {
      console.error('Failed to fetch quiz stats:', error);
    }
  };
  
  const fetchSubjectStats = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await Axios.get('http://localhost:3001/api/admin/subjects/stats', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setSubjectStats(response.data);
      
    } catch (error) {
      console.error('Failed to fetch subject stats:', error);
    }
  };
  
  const fetchSubjects = async () => {
    setLoading(true);
    const token = localStorage.getItem('authToken');
    
    try {
      const queryParams = new URLSearchParams({
        level: subjectFilters.level,
        search: subjectFilters.search,
        page: subjectFilters.page,
        limit: subjectFilters.limit
      }).toString();
      
      const response = await Axios.get(`http://localhost:3001/api/admin/subjects?${queryParams}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setSubjects(response.data.subjects);
      setSubjectPagination(response.data.pagination);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch subjects:', error);
      setError('Failed to load subjects. Please try again.');
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (adminData) {
      fetchSubjects();
    }
  }, [subjectFilters, adminData]);
  
  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= pagination.pages) {
      fetchQuizzes(newPage);
    }
  };
  
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleApplyFilters = () => {
    setPagination(prev => ({
      ...prev,
      page: 1
    }));
    fetchQuizzes(1);
  };
  
  const handleQuizAction = async (id, action, quizTitle = '') => {
    if (action === 'edit') {
      try {
        const token = localStorage.getItem('authToken');
        const response = await Axios.get(`http://localhost:3001/api/admin/quizzes/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
  
        setCurrentQuiz(response.data);
        setIsEditQuizOpen(true);
      } catch (error) {
        console.error('Failed to fetch quiz details:', error);
        setError('Failed to load quiz details. Please try again.');
      }
    } else if (action === 'view') {
      navigate(`/admin/quizzes/${id}`);
    } else if (action === 'delete') {
      setQuizToDelete({ id, title: quizTitle });
      setIsDeleteQuizOpen(true);
    }
  };
  
  const handleSubjectSearch = (e) => {
    setSubjectFilters({
      ...subjectFilters,
      search: e.target.value,
      page: 1
    });
  };
  
  const handleLevelFilter = (e) => {
    setSubjectFilters({
      ...subjectFilters,
      level: e.target.value,
      page: 1
    });
  };
  
  const handleSubjectPageChange = (newPage) => {
    setSubjectFilters({
      ...subjectFilters,
      page: newPage
    });
  };
  
  const openEditModal = (subject) => {
    setCurrentSubject(subject);
    setShowEditModal(true);
  };
  
  const openDeleteModal = (subject) => {
    setCurrentSubject(subject);
    setShowDeleteModal(true);
  };
  
  const handleAddSubject = async (subjectData) => {
    const token = localStorage.getItem('authToken');
    
    try {
      await Axios.post('http://localhost:3001/api/admin/subjects', subjectData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setShowAddModal(false);
      fetchSubjects();
    } catch (error) {
      console.error('Failed to add subject:', error);
      return { 
        error: error.response?.data?.message || 'Failed to add subject'
      };
    }
  };
  
  const handleEditSubject = async (subjectData) => {
    const token = localStorage.getItem('authToken');
    
    try {
      await Axios.put(`http://localhost:3001/api/admin/subjects/${currentSubject._id}`, subjectData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setShowEditModal(false);
      fetchSubjects();
    } catch (error) {
      console.error('Failed to update subject:', error);
      return { 
        error: error.response?.data?.message || 'Failed to update subject'
      };
    }
  };
  
  const handleDeleteSubject = async () => {
    const token = localStorage.getItem('authToken');
    
    try {
      await Axios.delete(`http://localhost:3001/api/admin/subjects/${currentSubject._id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setShowDeleteModal(false);
      fetchSubjects();
    } catch (error) {
      console.error('Failed to delete subject:', error);
      return { 
        error: error.response?.data?.message || 'Failed to delete subject'
      };
    }
  };
  
  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    navigate('/login');
  };
  
  const handleQuizAdded = () => {
    fetchQuizzes(1);
    fetchQuizStats();
    fetchSubjectStats();
  };
  
  const handleQuizUpdated = () => {
    fetchQuizzes(pagination.page);
    fetchQuizStats();
    fetchSubjectStats();
    setIsEditQuizOpen(false);
  };
  
  if (loading && !adminData) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#014482]"></div>
      </div>
    );
  }
  
  return (
<div className="min-h-screen bg-[#DEE8F1] font-inter">
  <header className="shadow ">
    <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
      <h1 className="text-xl sm:text-2xl font-bold font-inter text-[#014482]">MCQuiz</h1>
      <div className="flex items-center">
        {adminData && (
          <span className="mr-2 font-semibold font-inter text-[#014482] text-xs sm:text-sm hidden sm:block truncate max-w-xs">
            {adminData.email}
          </span>
        )}
        <button 
          onClick={handleLogout}
          className="px-2 py-1 sm:px-4 sm:py-2 bg-red-500 text-white rounded hover:bg-red-600 flex items-center text-xs sm:text-sm"
        >
          <FaSignOutAlt className="mr-1 sm:mr-2" /> 
          <span className="hidden xs:inline">Logout</span>
        </button>
      </div>
    </div>
  </header>
  
  {/* Dashboard Title */}
  <div className="text-center m-4 sm:m-6 lg:m-8">
    <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold font-inter">
      <span style={{ color: '#014482' }}>Welcome to the </span>
      <span style={{ color: '#0389BC' }}>Dashboard</span>
    </h1>
  </div>
  
  {error && (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative text-sm">
        {error}
      </div>
    </div>
  )}
  
  <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6">
      <div className="bg-[#3195c0] text-white shadow rounded-lg p-4 sm:p-6">
        <h3 className="text-sm sm:text-lg font-medium mb-1 sm:mb-2">Total Quizzes</h3>
        <p className="text-2xl sm:text-3xl font-bold">{quizStats?.totalQuizzes || 0}</p>
      </div>
      
      <div className="bg-[#4d87cf] text-white shadow rounded-lg p-4 sm:p-6">
        <h3 className="text-sm sm:text-lg font-medium mb-1 sm:mb-2">Total Subjects</h3>
        <p className="text-2xl sm:text-3xl font-bold">{subjectStats?.totalSubjects || 0}</p>
      </div>
      
      <div className="bg-[#2d67ad] text-white shadow rounded-lg p-4 sm:p-6">
        <h3 className="text-sm sm:text-lg font-medium mb-1 sm:mb-2">Education Levels</h3>
        <ul className="text-xs sm:text-sm">
          {subjectStats?.byLevel?.map((level) => (
            <li key={level.level} className="flex justify-between mb-1">
              <span>{level.level}</span>
              <span>{level.subjectCount} Subjects</span>
            </li>
          ))}
        </ul>
      </div>
      
      <div className="bg-[#2d44ad] text-white shadow rounded-lg p-4 sm:p-6">
        <h3 className="text-sm sm:text-lg font-medium mb-1 sm:mb-2">Quiz Difficulty</h3>
        <ul className="text-xs sm:text-sm">
          {quizStats?.byDifficulty?.map((item) => (
            <li key={item.difficulty} className="flex justify-between mb-1">
              <span>{item.difficulty}</span>
              <span>{item.count} quizzes</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  </div>
  
  <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
    <div className="shadow rounded-lg overflow-hidden mb-6 ">
      <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-300 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <h2 className="text-xl sm:text-2xl font-semibold text-[#014482] font-inter">Subject Management</h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-[#018ABD] text-white font-medium px-3 py-1 sm:px-4 sm:py-2 mt-6 rounded-full hover:bg-[#004581] transition duration-300"
        >
          Create New Subject
        </button>
      </div>
      
      <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-300">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search subjects..."
              className="w-full p-2 pl-8 bg-[#DEE8F1] border border-[#014482] rounded text-gray-700 text-xs sm:text-sm"
              value={subjectFilters.search}
              onChange={handleSubjectSearch}
            />
            <div className="absolute left-2 top-2.5 text-[#014482]">
              <FaSearch size={12} />
            </div>
          </div>
          <div>
            <select 
              className="w-full p-2 bg-[#DEE8F1] border border-[#014482] rounded text-[#014482] text-xs sm:text-sm"
              value={subjectFilters.level}
              onChange={handleLevelFilter}
            >
              <option value="">All Levels</option>
              <option value="Scholarship">Scholarship</option>
              <option value="O/L">O/L</option>
              <option value="A/L">A/L</option>
            </select>
          </div>
        </div>
      </div>
      
      <div className="hidden sm:block overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b border-gray-300 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="py-2 px-4 border-b border-gray-300 text-left text-xs font-medium text-gray-500 uppercase">Level</th>
              <th className="py-2 px-4 border-b border-gray-300 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
              <th className="py-2 px-4 border-b border-gray-300 text-left text-xs font-medium text-gray-500 uppercase">Quiz Count</th>
              <th className="py-2 px-4 border-b border-gray-300 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="py-2 px-4 border-b border-gray-300 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            {subjects.length === 0 ? (
              <tr>
                <td colSpan="6" className="py-4 px-4 text-center text-gray-500 text-xs sm:text-sm">
                  No subjects found
                </td>
              </tr>
            ) : (
              subjects.map((subject) => (
              <tr key={subject._id} className="hover:bg-[#cbe1ea]">
                <td className="py-3 px-4 border-b border-gray-300 text-xs sm:text-sm">{subject.name}</td>
                <td className="py-3 px-4 border-b border-gray-300 text-xs sm:text-sm">{subject.level}</td>
                <td className="py-3 px-4 border-b border-gray-300 text-xs sm:text-sm truncate max-w-xs">{subject.description || 'N/A'}</td>
                <td className="py-3 px-4 border-b border-gray-300 text-xs sm:text-sm">{subject.quizCount}</td>
                <td className="py-3 px-4 border-b border-gray-300">
                  <span className={`px-2 py-0.5 rounded text-xs ${subject.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {subject.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="py-3 px-4 border-b border-gray-300">
                  <div className="flex items-center justify-center space-x-4">
                    <button 
                      onClick={() => openEditModal(subject)} 
                      className="text-[#0389BC] hover:text-blue-900 flex items-center text-xs sm:text-sm"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => openDeleteModal(subject)} 
                      className="text-red-600 hover:text-red-900 flex items-center text-xs sm:text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      <div className="block sm:hidden">
        {subjects.length === 0 ? (
          <div className="p-4 text-center text-gray-500 text-sm">
            No subjects found
          </div>
        ) : (
          subjects.map((subject) => (
            <div key={subject._id} className="p-4 border-b border-gray-300 hover:bg-[#cbe1ea]">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-medium text-sm">{subject.name}</h3>
                  <p className="text-xs text-gray-600">{subject.level}</p>
                </div>
                <span className={`px-2 py-0.5 rounded text-xs ${subject.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {subject.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <p className="text-xs text-gray-600 mb-2 truncate">{subject.description || 'N/A'}</p>
              <div className="text-xs text-gray-600 mb-3">
                Quizzes: {subject.quizCount}
              </div>
              <div className="flex justify-end space-x-3">
                <button 
                  onClick={() => openEditModal(subject)} 
                  className="text-[#0389BC] hover:text-blue-900 text-xs"
                >
                  Edit
                </button>
                <button 
                  onClick={() => openDeleteModal(subject)} 
                  className="text-red-600 hover:text-red-900 text-xs"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
      
      {subjectPagination.pages > 1 && (
        <div className="px-4 sm:px-6 py-3 sm:py-4 flex justify-center mt-2 sm:mt-4">
          <div className="flex text-xs sm:text-sm">
            <button
              disabled={subjectFilters.page === 1}
              onClick={() => handleSubjectPageChange(subjectFilters.page - 1)}
              className={`px-2 sm:px-3 py-1 rounded-l flex items-center ${subjectFilters.page === 1 ? 'bg-gray-100 text-gray-400' : 'bg-gray-200 hover:bg-gray-300'}`}
            >
              <FaChevronLeft className="mr-1" size={8} /> Prev
            </button>
            <div className="px-2 sm:px-4 py-1 bg-gray-100 flex items-center text-xs">
              Page {subjectFilters.page} of {subjectPagination.pages}
            </div>
            <button
              disabled={subjectFilters.page === subjectPagination.pages}
              onClick={() => handleSubjectPageChange(subjectFilters.page + 1)}
              className={`px-2 sm:px-3 py-1 rounded-r flex items-center ${subjectFilters.page === subjectPagination.pages ? 'bg-gray-100 text-gray-400' : 'bg-gray-200 hover:bg-gray-300'}`}
            >
              Next <FaChevronRight className="ml-1" size={8} />
            </button>
          </div>
        </div>
      )}
    </div>
  </div>
  
  <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
    <div className="shadow rounded-lg overflow-hidden ">
      <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-300 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <h2 className="text-xl sm:text-2xl font-semibold text-[#014482] font-inter">Quiz Management</h2>
        <button
          onClick={() => setIsAddQuizOpen(true)}
          className="bg-[#018ABD] text-white font-medium px-3 py-1 sm:px-4 sm:py-2 mt-6 rounded-full hover:bg-[#004581] transition duration-300"
        >
          Create New Quiz
        </button>
      </div>
      
      <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-300">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
          <div>
            <input
              type="text"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder="Search by title..."
              className="w-full px-3 py-2 text-[#014482] border bg-[#DEE8F1] border-[#014482] rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm"
            />
          </div>
          
          <div>
            <select
              name="difficulty"
              value={filters.difficulty}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 text-[#014482] border bg-[#DEE8F1] border-[#014482] rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm"
            >
              <option value="">All Difficulties</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>
          
          <div>
            <select
              name="subscriptionLevel"
              value={filters.subscriptionLevel}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 text-[#014482] border bg-[#DEE8F1] border-[#014482] rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm"
            >
              <option value="">All Subscription Levels</option>
                             <option value="Basic">Basic</option>
               <option value="School Pro">School Pro</option>
               <option value="O/L Pro">O/L Pro</option>
               <option value="A/L Pro">A/L Pro</option>
            </select>
          </div>
          
          <div>
            <select
              name="active"
              value={filters.active}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 text-[#014482] border bg-[#DEE8F1] border-[#014482] rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm"
            >
              <option value="">All Status</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>
          
          <div className="flex items-end">
            <button
              onClick={handleApplyFilters}
              className="w-full px-3 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 text-xs sm:text-sm"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>
      
      <div className="hidden sm:block overflow-x-auto mt-2 sm:mt-4">
        <table className="min-w-full divide-y divide-gray-300">
          <thead>
            <tr>
              <th scope="col" className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Title
              </th>
              <th scope="col" className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Subject
              </th>
              <th scope="col" className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Questions
              </th>
              <th scope="col" className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Difficulty
              </th>
              <th scope="col" className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Subscription
              </th>
              <th scope="col" className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-300">
            {quizzes.length > 0 ? (
              quizzes.map((quiz) => (
                <tr key={quiz._id} className="hover:bg-[#cbe1ea]">
                  <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap">
                    <div className="text-xs sm:text-sm font-medium text-gray-900">{quiz.title}</div>
                  </td>
                  <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap">
                    <div className="text-xs sm:text-sm text-gray-500">{quiz.subject?.name}</div>
                    <div className="text-xs text-gray-400">{quiz.subject?.level}</div>
                  </td>
                  <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap">
                    <div className="text-xs sm:text-sm text-gray-900">{quiz.questionsCount}</div>
                  </td>
                  <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5  rounded-full 
                      ${quiz.difficulty === 'Easy' ? 'bg-green-100 text-green-800' : 
                        quiz.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-red-100 text-red-800'}`}>
                      {quiz.difficulty}
                    </span>
                  </td>
                  <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap">
                                         <span className={`px-2 inline-flex text-xs leading-5 rounded-full 
                       ${quiz.subscriptionLevel === 'Basic' ? 'bg-blue-100 text-blue-800' : 
                         quiz.subscriptionLevel === 'School Pro' ? 'bg-purple-100 text-purple-800' : 
                         quiz.subscriptionLevel === 'O/L Pro' ? 'bg-orange-100 text-orange-800' : 
                         'bg-red-100 text-red-800'}`}>
                       {quiz.subscriptionLevel}
                     </span>
                  </td>
                  <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 rounded-full 
                      ${quiz.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {quiz.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                    <button 
                      onClick={() => handleQuizAction(quiz._id, 'edit')}
                      className="text-indigo-600 hover:text-indigo-900 mr-2"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleQuizAction(quiz._id, 'delete', quiz.title)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="px-3 sm:px-6 py-2 sm:py-4 text-center text-xs sm:text-sm text-gray-500">
                  No quizzes found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="block sm:hidden divide-y divide-gray-300">
        {quizzes.length > 0 ? (
          quizzes.map((quiz) => (
            <div key={quiz._id} className="p-4 hover:bg-[#cbe1ea]">
              <div className="flex justify-between items-start mb-2">
                <div className="font-medium text-sm">{quiz.title}</div>
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold
                  ${quiz.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {quiz.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="text-xs text-gray-500 mb-1">
                Subject: {quiz.subject?.name} ({quiz.subject?.level})
              </div>
              <div className="flex justify-between items-center mb-2">
                <div className="text-xs text-gray-500">
                  Questions: {quiz.questionsCount}
                </div>
                <div className="flex space-x-1">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold
                    ${quiz.difficulty === 'Easy' ? 'bg-green-100 text-green-800' : 
                      quiz.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-red-100 text-red-800'}`}>
                    {quiz.difficulty}
                  </span>
                                     <span className={`px-2 py-0.5 rounded-full text-xs font-semibold
                     ${quiz.subscriptionLevel === 'Basic' ? 'bg-blue-100 text-blue-800' : 
                       quiz.subscriptionLevel === 'School Pro' ? 'bg-purple-100 text-purple-800' : 
                       quiz.subscriptionLevel === 'O/L Pro' ? 'bg-orange-100 text-orange-800' : 
                       'bg-red-100 text-red-800'}`}>
                     {quiz.subscriptionLevel}
                   </span>
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-2">
                <button 
                  onClick={() => handleQuizAction(quiz._id, 'edit')}
                  className="text-indigo-600 hover:text-indigo-900 text-xs"
                >
                  Edit
                </button>
                <button 
                  onClick={() => handleQuizAction(quiz._id, 'delete', quiz.title)}
                  className="text-red-600 hover:text-red-900 text-xs"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="p-4 text-center text-xs text-gray-500">
            No quizzes found
          </div>
        )}
      </div>
      
      {pagination.total > 0 && (
        <div className="px-4 sm:px-6 py-3 sm:py-4 flex flex-col sm:flex-row justify-between items-center mt-2 sm:mt-4 text-xs sm:text-sm">
          <div className="text-gray-700 mb-2 sm:mb-0">
            Showing <span className="font-medium">{((pagination.page - 1) * pagination.limit) + 1}</span> to{' '}
            <span className="font-medium">
              {Math.min(pagination.page * pagination.limit, pagination.total)}
            </span> of{' '}
            <span className="font-medium">{pagination.total}</span> results
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className={`px-2 sm:px-3 py-1 rounded border ${
                pagination.page === 1 
                ? 'text-gray-400 cursor-not-allowed' 
                : 'text-blue-500 hover:bg-blue-50'
              }`}
            >
              Previous
            </button>
            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.pages}
              className={`px-2 sm:px-3 py-1 rounded border ${
                pagination.page === pagination.pages 
                ? 'text-gray-400 cursor-not-allowed' 
                : 'text-blue-500 hover:bg-blue-50'
              }`}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  </div>
  
  {isAddQuizOpen && (
    <AddQuiz 
      isOpen={isAddQuizOpen} 
      onClose={() => setIsAddQuizOpen(false)}
      onQuizAdded={handleQuizAdded}
    />
  )}
  
  {isEditQuizOpen && currentQuiz && (
    <EditQuiz 
      isOpen={isEditQuizOpen} 
      onClose={() => setIsEditQuizOpen(false)}
      onQuizUpdated={handleQuizUpdated}
      quiz={currentQuiz}
    />
  )}
  {isDeleteQuizOpen && quizToDelete && (
    <DeleteQuiz
      isOpen={isDeleteQuizOpen}
      onClose={() => setIsDeleteQuizOpen(false)}
      quizId={quizToDelete.id}
      quizTitle={quizToDelete.title}
      onQuizDeleted={() => {
        fetchQuizzes(pagination.page);
        fetchQuizStats();
        fetchSubjectStats();
      }}
    />
  )}

  <AddSubjectModal 
    isOpen={showAddModal}
    onClose={() => setShowAddModal(false)}
    onSubmit={handleAddSubject}
  />
  
  {currentSubject && (
    <EditSubjectModal 
      isOpen={showEditModal}
      onClose={() => setShowEditModal(false)}
      onSubmit={handleEditSubject}
      subject={currentSubject}
    />
  )}
  
  {currentSubject && (
    <DeleteConfirmModal 
      isOpen={showDeleteModal}
      onClose={() => setShowDeleteModal(false)}
      onConfirm={handleDeleteSubject}
      subject={currentSubject}
    />
  )}

  {/* Feedback Management Section */}
  <div className="mt-8">
    <AdminFeedbackManagement />
  </div>
</div>
  );
}