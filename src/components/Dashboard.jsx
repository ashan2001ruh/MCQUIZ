// src/components/Dashboard.jsx
import React, { useEffect, useState } from 'react';
import Axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaSignOutAlt, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

import AddQuiz from './AddQuiz';
import EditQuiz from './EditQuiz';
import DeleteQuiz from './DeleteQuiz';
import AddSubjectModal from './modals/AddSubjectModal';
import EditSubjectModal from './modals/EditSubjectModal';
import DeleteConfirmModal from './modals/DeleteConfirmModal';
import AdminFeedbackManagement from './AdminFeedbackManagement';
import AdminSubscriptionManagement from './AdminSubscriptionManagement';

export default function Dashboard() {
  // Auth/admin
  const [adminData, setAdminData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Quizzes & stats
  const [quizzes, setQuizzes] = useState([]);
  const [quizStats, setQuizStats] = useState(null);

  // Subjects & stats
  const [subjects, setSubjects] = useState([]);
  const [subjectStats, setSubjectStats] = useState(null);

  // pagination & filters for quizzes
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 0 });
  const [filters, setFilters] = useState({
    search: '',
    subject: '',
    difficulty: '',
    active: '',
    subscriptionLevel: '',
  });

  // subject controls and pagination
  const [subjectFilters, setSubjectFilters] = useState({ level: '', search: '', page: 1, limit: 10 });
  const [subjectPagination, setSubjectPagination] = useState({ total: 0, pages: 1 });

  // Modals and current items
  const [isAddQuizOpen, setIsAddQuizOpen] = useState(false);
  const [isEditQuizOpen, setIsEditQuizOpen] = useState(false);
  const [currentQuiz, setCurrentQuiz] = useState(null);
  const [isDeleteQuizOpen, setIsDeleteQuizOpen] = useState(false);
  const [quizToDelete, setQuizToDelete] = useState(null);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentSubject, setCurrentSubject] = useState(null);

  const navigate = useNavigate();

  // -----------------------
  // AUTH & INITIAL LOAD
  // -----------------------
  useEffect(() => {
    const checkAdminAuth = async () => {
      const user = JSON.parse(localStorage.getItem('user')) || {};
      const token = localStorage.getItem('authToken');

      if (!token || user.role !== 'admin') {
        navigate('/login');
        return;
      }

      try {
        const res = await Axios.get('http://localhost:3001/api/admin/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAdminData(res.data);
        // fetch initial data after auth
        await Promise.all([fetchQuizzes(1), fetchQuizStats(), fetchSubjectStats(), fetchSubjects()]);
      } catch (err) {
        console.error('Failed to fetch admin data:', err);
        setError('Failed to load admin data. Please login again.');
        setLoading(false);

        if (err.response && err.response.status === 401) {
          localStorage.removeItem('authToken');
          localStorage.removeItem('user');
          navigate('/login');
        }
      }
    };

    checkAdminAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  // When subject filters change (or adminData becomes available), refetch subjects
  useEffect(() => {
    if (adminData) {
      fetchSubjects();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subjectFilters, adminData]);

  // -----------------------
  // API FUNCTIONS
  // -----------------------
  const fetchQuizzes = async (page = 1) => {
    try {
      const token = localStorage.getItem('authToken');
      const { search, subject, difficulty, active, subscriptionLevel } = filters;

      let url = `http://localhost:3001/api/admin/quizzes?page=${page}&limit=${pagination.limit}`;

      if (search) url += `&search=${encodeURIComponent(search)}`;
      if (subject) url += `&subject=${encodeURIComponent(subject)}`;
      if (difficulty) url += `&difficulty=${encodeURIComponent(difficulty)}`;
      if (active !== '') url += `&active=${encodeURIComponent(active)}`;
      if (subscriptionLevel) url += `&subscriptionLevel=${encodeURIComponent(subscriptionLevel)}`;

      const res = await Axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setQuizzes(res.data.quizzes || []);
      setPagination((prev) => ({
        ...prev,
        page: res.data.pagination?.page ?? page,
        total: res.data.pagination?.total ?? 0,
        pages: res.data.pagination?.pages ?? 0,
      }));
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch quizzes:', err);
      setError('Failed to load quizzes. Please try again.');
      setLoading(false);
    }
  };

  const fetchQuizStats = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const res = await Axios.get('http://localhost:3001/api/admin/quizzes/stats', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setQuizStats(res.data);
    } catch (err) {
      console.error('Failed to fetch quiz stats:', err);
    }
  };

  const fetchSubjectStats = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const res = await Axios.get('http://localhost:3001/api/admin/subjects/stats', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSubjectStats(res.data);
    } catch (err) {
      console.error('Failed to fetch subject stats:', err);
    }
  };

  const fetchSubjects = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const q = new URLSearchParams({
        level: subjectFilters.level || '',
        search: subjectFilters.search || '',
        page: String(subjectFilters.page || 1),
        limit: String(subjectFilters.limit || 10),
      }).toString();

      const res = await Axios.get(`http://localhost:3001/api/admin/subjects?${q}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setSubjects(res.data.subjects || []);
      setSubjectPagination(res.data.pagination || { total: 0, pages: 1 });
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch subjects:', err);
      setError('Failed to load subjects. Please try again.');
      setLoading(false);
    }
  };

  // -----------------------
  // HANDLERS
  // -----------------------
  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= pagination.pages) {
      fetchQuizzes(newPage);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleApplyFilters = () => {
    setPagination((prev) => ({ ...prev, page: 1 }));
    fetchQuizzes(1);
  };

  const handleQuizAction = async (id, action, quizTitle = '') => {
    if (action === 'edit') {
      try {
        const token = localStorage.getItem('authToken');
        const res = await Axios.get(`http://localhost:3001/api/admin/quizzes/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCurrentQuiz(res.data);
        setIsEditQuizOpen(true);
      } catch (err) {
        console.error('Failed to fetch quiz details:', err);
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
    setSubjectFilters((prev) => ({ ...prev, search: e.target.value, page: 1 }));
  };

  const handleLevelFilter = (e) => {
    setSubjectFilters((prev) => ({ ...prev, level: e.target.value, page: 1 }));
  };

  const handleSubjectPageChange = (newPage) => {
    setSubjectFilters((prev) => ({ ...prev, page: newPage }));
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
    try {
      const token = localStorage.getItem('authToken');
      await Axios.post('http://localhost:3001/api/admin/subjects', subjectData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setShowAddModal(false);
      fetchSubjects();
      return {};
    } catch (err) {
      console.error('Failed to add subject:', err);
      return { error: err.response?.data?.message || 'Failed to add subject' };
    }
  };

  const handleEditSubject = async (subjectData) => {
    if (!currentSubject?._id) return { error: 'No subject selected' };
    try {
      const token = localStorage.getItem('authToken');
      await Axios.put(`http://localhost:3001/api/admin/subjects/${currentSubject._id}`, subjectData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setShowEditModal(false);
      fetchSubjects();
      return {};
    } catch (err) {
      console.error('Failed to update subject:', err);
      return { error: err.response?.data?.message || 'Failed to update subject' };
    }
  };

  const handleDeleteSubject = async () => {
    if (!currentSubject?._id) return { error: 'No subject selected' };
    try {
      const token = localStorage.getItem('authToken');
      await Axios.delete(`http://localhost:3001/api/admin/subjects/${currentSubject._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setShowDeleteModal(false);
      fetchSubjects();
      return {};
    } catch (err) {
      console.error('Failed to delete subject:', err);
      return { error: err.response?.data?.message || 'Failed to delete subject' };
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

  // helper badge component
  const Badge = ({ children, className = '' }) => (
    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${className}`}>{children}</span>
  );

  // -----------------------
  // RENDER
  // -----------------------
  if (loading && !adminData) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#014482]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#DEE8F1] font-inter">
  {/* Header */}
  <header className="bg-white shadow-sm sticky top-0 z-10">
    <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
      {/* Logo and title container - placed together on the left */}
      <div className="flex items-center">
        <div className="w-12 h-12 bg-gradient-to-r from-[#014482] to-[#018ABD] rounded-xl flex items-center justify-center shadow-lg">
          <span className="text-3xl text-white font-bold">Q</span>
        </div>
        <h1 className="ml-3 text-3xl font-bold bg-gradient-to-r from-[#014482] to-[#018ABD] bg-clip-text text-transparent leading-none">
          MCQuiz
        </h1>
      </div>
      
      {/* User info and logout button on the right */}
      <div className="flex items-center space-x-3">
        {adminData && <span className="hidden sm:block text-sm text-gray-600 truncate max-w-xs">{adminData.email}</span>}
        <button onClick={handleLogout} className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 flex items-center text-sm shadow">
          <FaSignOutAlt className="mr-2" /> Logout
        </button>
      </div>
    </div>
  </header>
  

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Title */}
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold">
            <span className="text-[#014482]">Welcome to the </span>
            <span className="text-[#018ABD]">Dashboard</span>
          </h2>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6 text-sm">{error}</div>
        )}

        {/* Stats */}
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

        {/* Subject Management */}
        <section className="bg-white shadow rounded-2xl p-6 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <h2 className="text-lg sm:text-xl font-semibold text-[#014482]">Subject Management</h2>
            <button onClick={() => setShowAddModal(true)} className="bg-[#018ABD] text-white px-4 py-2 rounded-lg text-sm hover:bg-[#014482] shadow">
              + Create New Subject
            </button>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search subjects..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#018ABD] focus:outline-none"
                value={subjectFilters.search}
                onChange={handleSubjectSearch}
              />
              <FaSearch className="absolute right-3 top-3 text-gray-400" size={14} />
            </div>

            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#018ABD] focus:outline-none"
              value={subjectFilters.level}
              onChange={handleLevelFilter}
            >
              <option value="">All Levels</option>
              <option value="Scholarship">Scholarship</option>
              <option value="O/L">O/L</option>
              <option value="A/L">A/L</option>
            </select>
          </div>

          {/* Table (desktop) */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="min-w-full text-sm text-left border-t">
              <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
                <tr>
                  <th className="py-2 px-4">Name</th>
                  <th className="py-2 px-4">Level</th>
                  <th className="py-2 px-4">Description</th>
                  <th className="py-2 px-4">Quiz Count</th>
                  <th className="py-2 px-4">Status</th>
                  <th className="py-2 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {subjects.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-4 px-4 text-center text-gray-500">
                      No subjects found
                    </td>
                  </tr>
                ) : (
                  subjects.map((subject) => (
                    <tr key={subject._id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">{subject.name}</td>
                      <td className="py-3 px-4">{subject.level}</td>
                      <td className="py-3 px-4 truncate max-w-xs">{subject.description || 'N/A'}</td>
                      <td className="py-3 px-4">{subject.quizCount}</td>
                      <td className="py-3 px-4">
                        {subject.isActive ? (
                          <Badge className="bg-green-100 text-green-800">Active</Badge>
                        ) : (
                          <Badge className="bg-red-100 text-red-800">Inactive</Badge>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center space-x-3">
                          <button onClick={() => openEditModal(subject)} className="text-blue-600 hover:text-blue-900 text-sm">
                            Edit
                          </button>
                          <button onClick={() => openDeleteModal(subject)} className="text-red-600 hover:text-red-900 text-sm">
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

          {/* Cards (mobile) */}
          <div className="block sm:hidden divide-y">
            {subjects.length === 0 ? (
              <div className="p-4 text-center text-gray-500 text-sm">No subjects found</div>
            ) : (
              subjects.map((subject) => (
                <div key={subject._id} className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-medium text-sm">{subject.name}</h3>
                      <p className="text-xs text-gray-600">{subject.level}</p>
                    </div>
                    {subject.isActive ? (
                      <Badge className="bg-green-100 text-green-800">Active</Badge>
                    ) : (
                      <Badge className="bg-red-100 text-red-800">Inactive</Badge>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 mb-2 truncate">{subject.description || 'N/A'}</p>
                  <div className="text-xs text-gray-600 mb-3">Quizzes: {subject.quizCount}</div>
                  <div className="flex justify-end space-x-3">
                    <button onClick={() => openEditModal(subject)} className="text-blue-600 hover:text-blue-900 text-xs">
                      Edit
                    </button>
                    <button onClick={() => openDeleteModal(subject)} className="text-red-600 hover:text-red-900 text-xs">
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Subject Pagination */}
          {subjectPagination.pages > 1 && (
            <div className="flex justify-center mt-4">
              <div className="flex text-sm">
                <button
                  disabled={subjectFilters.page === 1}
                  onClick={() => handleSubjectPageChange(subjectFilters.page - 1)}
                  className={`px-3 py-1 rounded-l flex items-center border ${subjectFilters.page === 1 ? 'text-gray-400 bg-gray-100 cursor-not-allowed' : 'hover:bg-gray-100'}`}
                >
                  <FaChevronLeft className="mr-1" size={10} /> Prev
                </button>
                <div className="px-4 py-1 border-t border-b">
                  Page {subjectFilters.page} of {subjectPagination.pages}
                </div>
                <button
                  disabled={subjectFilters.page === subjectPagination.pages}
                  onClick={() => handleSubjectPageChange(subjectFilters.page + 1)}
                  className={`px-3 py-1 rounded-r flex items-center border ${subjectFilters.page === subjectPagination.pages ? 'text-gray-400 bg-gray-100 cursor-not-allowed' : 'hover:bg-gray-100'}`}
                >
                  Next <FaChevronRight className="ml-1" size={10} />
                </button>
              </div>
            </div>
          )}
        </section>

        {/* Quiz Management */}
        <section className="bg-white shadow rounded-2xl p-6 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <h2 className="text-lg sm:text-xl font-semibold text-[#014482]">Quiz Management</h2>
            <button onClick={() => setIsAddQuizOpen(true)} className="bg-[#018ABD] text-white px-4 py-2 rounded-lg text-sm hover:bg-[#014482] shadow">
              + Create New Quiz
            </button>
          </div>

          {/* Quiz Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
            <input
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder="Search by title..."
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#018ABD] focus:outline-none"
            />

            <select name="difficulty" value={filters.difficulty} onChange={handleFilterChange} className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
              <option value="">All Difficulties</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>

            <select name="subscriptionLevel" value={filters.subscriptionLevel} onChange={handleFilterChange} className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
              <option value="">All Subscription Levels</option>
              <option value="Basic">Basic</option>
              <option value="School Pro">School Pro</option>
              <option value="O/L Pro">O/L Pro</option>
              <option value="A/L Pro">A/L Pro</option>
            </select>

            <select name="active" value={filters.active} onChange={handleFilterChange} className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
              <option value="">All Status</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>

            <div>
              <button onClick={handleApplyFilters} className="w-full px-3 py-2 bg-[#014482] text-white rounded-lg text-sm hover:bg-gray-900 shadow">
                Apply Filters
              </button>
            </div>
          </div>

          {/* Quiz Table (desktop) */}
          <div className="hidden sm:block overflow-x-auto mt-2">
            <table className="min-w-full text-sm text-left border-t">
              <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
                <tr>
                  <th className="px-4 py-2">Title</th>
                  <th className="px-4 py-2">Subject</th>
                  <th className="px-4 py-2">Questions</th>
                  <th className="px-4 py-2">Difficulty</th>
                  <th className="px-4 py-2">Subscription</th>
                  <th className="px-4 py-2">Status</th>
                  <th className="px-4 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {quizzes.length > 0 ? (
                  quizzes.map((quiz) => (
                    <tr key={quiz._id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">{quiz.title}</td>
                      <td className="px-4 py-3 text-gray-700">
                        <div>{quiz.subject?.name}</div>
                        <div className="text-xs text-gray-500">{quiz.subject?.level}</div>
                      </td>
                      <td className="px-4 py-3">{quiz.questionsCount}</td>
                      <td className="px-4 py-3">
                        <Badge className={quiz.difficulty === 'Easy' ? 'bg-green-100 text-green-800' : quiz.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}>
                          {quiz.difficulty}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          className={
                            quiz.subscriptionLevel === 'Basic'
                              ? 'bg-blue-100 text-blue-800'
                              : quiz.subscriptionLevel === 'School Pro'
                              ? 'bg-purple-100 text-purple-800'
                              : quiz.subscriptionLevel === 'O/L Pro'
                              ? 'bg-orange-100 text-orange-800'
                              : 'bg-red-100 text-red-800'
                          }
                        >
                          {quiz.subscriptionLevel || '—'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        {quiz.isActive ? <Badge className="bg-green-100 text-green-800">Active</Badge> : <Badge className="bg-red-100 text-red-800">Inactive</Badge>}
                      </td>
                      <td className="px-4 py-3 space-x-2">
                        <button onClick={() => handleQuizAction(quiz._id, 'edit')} className="text-blue-600 hover:text-blue-900">
                          Edit
                        </button>
                        <button onClick={() => handleQuizAction(quiz._id, 'delete', quiz.title)} className="text-red-600 hover:text-red-900">
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="px-4 py-6 text-center text-gray-500">
                      No quizzes found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Quiz Cards (mobile) */}
          <div className="block sm:hidden divide-y">
            {quizzes.length > 0 ? (
              quizzes.map((quiz) => (
                <div key={quiz._id} className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="font-medium text-sm">{quiz.title}</div>
                    {quiz.isActive ? <Badge className="bg-green-100 text-green-800">Active</Badge> : <Badge className="bg-red-100 text-red-800">Inactive</Badge>}
                  </div>
                  <div className="text-xs text-gray-600 mb-1">Subject: {quiz.subject?.name} ({quiz.subject?.level})</div>
                  <div className="flex justify-between items-center">
                    <div className="text-xs text-gray-600">Questions: {quiz.questionsCount}</div>
                    <div className="flex space-x-2">
                      <Badge className={quiz.difficulty === 'Easy' ? 'bg-green-100 text-green-800' : quiz.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}>
                        {quiz.difficulty}
                      </Badge>
                      <Badge
                        className={
                          quiz.subscriptionLevel === 'Basic'
                            ? 'bg-blue-100 text-blue-800'
                            : quiz.subscriptionLevel === 'School Pro'
                            ? 'bg-purple-100 text-purple-800'
                            : quiz.subscriptionLevel === 'O/L Pro'
                            ? 'bg-orange-100 text-orange-800'
                            : 'bg-red-100 text-red-800'
                        }
                      >
                        {quiz.subscriptionLevel || '—'}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex justify-end space-x-3 mt-3">
                    <button onClick={() => handleQuizAction(quiz._id, 'edit')} className="text-blue-600 hover:text-blue-900 text-xs">
                      Edit
                    </button>
                    <button onClick={() => handleQuizAction(quiz._id, 'delete', quiz.title)} className="text-red-600 hover:text-red-900 text-xs">
                      Delete
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-xs text-gray-500">No quizzes found</div>
            )}
          </div>

          {/* Quiz Pagination */}
          {pagination.total > 0 && (
            <div className="flex flex-col sm:flex-row justify-between items-center mt-4 text-sm">
              <div className="text-gray-700 mb-2 sm:mb-0">
                Showing <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span> to <span className="font-medium">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> of <span className="font-medium">{pagination.total}</span> results
              </div>
              <div className="flex space-x-2">
                <button onClick={() => handlePageChange(pagination.page - 1)} disabled={pagination.page === 1} className={`px-3 py-1 rounded border ${pagination.page === 1 ? 'text-gray-400 cursor-not-allowed bg-gray-100' : 'hover:bg-gray-100'}`}>
                  Previous
                </button>
                <button onClick={() => handlePageChange(pagination.page + 1)} disabled={pagination.page === pagination.pages} className={`px-3 py-1 rounded border ${pagination.page === pagination.pages ? 'text-gray-400 cursor-not-allowed bg-gray-100' : 'hover:bg-gray-100'}`}>
                  Next
                </button>
              </div>
            </div>
          )}
        </section>

        {/* Subscription & Feedback */}
        <section className="bg-white shadow rounded-2xl p-6 mb-8">
          
          <AdminSubscriptionManagement />
        </section>

        <section className="bg-white shadow rounded-2xl p-6 mb-8">
          
          <AdminFeedbackManagement />
        </section>
      </main>

      {/* Modals */}
      {isAddQuizOpen && <AddQuiz isOpen={isAddQuizOpen} onClose={() => setIsAddQuizOpen(false)} onQuizAdded={handleQuizAdded} />}

      {isEditQuizOpen && currentQuiz && <EditQuiz isOpen={isEditQuizOpen} onClose={() => setIsEditQuizOpen(false)} onQuizUpdated={handleQuizUpdated} quiz={currentQuiz} />}

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

      <AddSubjectModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} onSubmit={handleAddSubject} />

      {currentSubject && <EditSubjectModal isOpen={showEditModal} onClose={() => setShowEditModal(false)} onSubmit={handleEditSubject} subject={currentSubject} />}

      {currentSubject && <DeleteConfirmModal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} onConfirm={handleDeleteSubject} subject={currentSubject} />}
    </div>
  );
}
