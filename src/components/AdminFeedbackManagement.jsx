import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AiOutlineMessage, AiOutlineCheckCircle, AiOutlineCloseCircle, AiOutlineDelete, AiOutlineEye } from 'react-icons/ai';

const AdminFeedbackManagement = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [stats, setStats] = useState({
    overall: { positive: 0, negative: 0, total: 0 },
    recent: { positive: 0, negative: 0, total: 0 }
  });
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState('all'); // 'all', 'positive', 'negative'

  useEffect(() => {
    fetchFeedbacks();
    fetchStats();
  }, [currentPage, filter]);

  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      const response = await fetch(
        `http://localhost:3001/api/feedback/all?page=${currentPage}&limit=10&filter=${filter}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setFeedbacks(data.feedback || []);
        setTotalPages(data.pagination?.totalPages || 1);
      }
    } catch (error) {
      console.error('Error fetching feedbacks:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:3001/api/feedback/stats', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleDelete = async (feedbackId) => {
    if (!window.confirm('Are you sure you want to delete this feedback?')) return;

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:3001/api/feedback/${feedbackId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.ok) {
        fetchFeedbacks();
        fetchStats();
      }
    } catch (error) {
      console.error('Error deleting feedback:', error);
    }
  };

  const getSentimentIcon = (sentiment) => {
    return sentiment === 'positive' ? (
      <AiOutlineCheckCircle className="text-green-500" size={20} />
    ) : (
      <AiOutlineCloseCircle className="text-red-500" size={20} />
    );
  };

  const getSentimentColor = (sentiment) => {
    return sentiment === 'positive' ? 'text-green-600' : 'text-red-600';
  };

  const getSentimentBg = (sentiment) => {
    return sentiment === 'positive' ? 'bg-green-50' : 'bg-red-50';
  };

  const filteredFeedbacks = feedbacks.filter(feedback => {
    if (filter === 'all') return true;
    return feedback.sentiment === filter;
  });

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-[#004581] flex items-center gap-2">
          <AiOutlineMessage />
          Feedback Management
        </h3>
        <div className="flex gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#018ABD]"
          >
            <option value="all">All Feedback</option>
            <option value="positive">Positive</option>
            <option value="negative">Negative</option>
          </select>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{stats.overall.total}</div>
          <div className="text-sm text-blue-600">Total Feedback</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{stats.overall.positive}</div>
          <div className="text-sm text-green-600">Positive</div>
        </div>
        <div className="bg-red-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-red-600">{stats.overall.negative}</div>
          <div className="text-sm text-red-600">Negative</div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-purple-600">
            {stats.overall.total > 0 ? ((stats.overall.positive / stats.overall.total) * 100).toFixed(1) : 0}%
          </div>
          <div className="text-sm text-purple-600">Satisfaction Rate</div>
        </div>
      </div>

      {/* Feedback List */}
      {loading ? (
        <div className="text-center py-8">
          <div className="w-8 h-8 border-4 border-[#018ABD] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading feedback...</p>
        </div>
      ) : filteredFeedbacks.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No feedback found for the selected filter.
        </div>
      ) : (
        <div className="space-y-4">
          {filteredFeedbacks.map((feedback) => (
            <motion.div
              key={feedback._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 rounded-lg border ${getSentimentBg(feedback.sentiment)}`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  {getSentimentIcon(feedback.sentiment)}
                  <span className={`font-medium ${getSentimentColor(feedback.sentiment)}`}>
                    {feedback.sentiment.charAt(0).toUpperCase() + feedback.sentiment.slice(1)}
                  </span>
                  <span className="text-sm text-gray-500">
                    ({(feedback.confidence * 100).toFixed(0)}% confidence)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setSelectedFeedback(feedback);
                      setShowModal(true);
                    }}
                    className="text-gray-500 hover:text-[#018ABD] transition-colors"
                    title="View Details"
                  >
                    <AiOutlineEye size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(feedback._id)}
                    className="text-gray-500 hover:text-red-500 transition-colors"
                    title="Delete Feedback"
                  >
                    <AiOutlineDelete size={18} />
                  </button>
                </div>
              </div>
              
              <div className="mb-3">
                <p className="text-gray-700 line-clamp-2">{feedback.feedback}</p>
              </div>
              
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>
                  By: {feedback.user?.firstName} {feedback.user?.lastName} ({feedback.user?.email})
                </span>
                <span>{new Date(feedback.createdAt).toLocaleDateString()}</span>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Previous
            </button>
            <span className="px-3 py-2 text-gray-600">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Feedback Detail Modal */}
      {showModal && selectedFeedback && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-[#004581]">Feedback Details</h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <AiOutlineCloseCircle size={24} />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  {getSentimentIcon(selectedFeedback.sentiment)}
                  <span className={`font-medium text-lg ${getSentimentColor(selectedFeedback.sentiment)}`}>
                    {selectedFeedback.sentiment.charAt(0).toUpperCase() + selectedFeedback.sentiment.slice(1)} Sentiment
                  </span>
                  <span className="text-sm text-gray-500">
                    ({(selectedFeedback.confidence * 100).toFixed(0)}% confidence)
                  </span>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Feedback Text</label>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-gray-800 whitespace-pre-wrap">{selectedFeedback.feedback}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">User</label>
                    <p className="text-gray-800">
                      {selectedFeedback.user?.firstName} {selectedFeedback.user?.lastName}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <p className="text-gray-800">{selectedFeedback.user?.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Submitted</label>
                    <p className="text-gray-800">
                      {new Date(selectedFeedback.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ID</label>
                    <p className="text-gray-800 text-sm font-mono">{selectedFeedback._id}</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AdminFeedbackManagement;
