import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AiOutlineMessage, AiOutlineCheckCircle, AiOutlineCloseCircle, AiOutlineDelete, AiOutlineEye, AiOutlineDownload, AiOutlineFilter, AiOutlineBarChart } from 'react-icons/ai';

const AdminFeedbackManagement = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [stats, setStats] = useState({
    overall: { positive: 0, negative: 0, total: 0 },
    recent: { positive: 0, negative: 0, total: 0 },
    confidence: { high: 0, medium: 0, low: 0 }
  });
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState('all'); // 'all', 'positive', 'negative'
  const [confidenceFilter, setConfidenceFilter] = useState('all'); // 'all', 'high', 'medium', 'low'
  const [dateRange, setDateRange] = useState('all'); // 'all', 'today', 'week', 'month'
  const [sortBy, setSortBy] = useState('createdAt'); // 'createdAt', 'confidence', 'sentiment'
  const [selectedItems, setSelectedItems] = useState([]);
  const [showBulkActions, setShowBulkActions] = useState(false);

  useEffect(() => {
    fetchFeedbacks();
    fetchStats();
  }, [currentPage, filter, confidenceFilter, dateRange, sortBy]);

  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      const queryParams = new URLSearchParams({
        page: currentPage,
        limit: 10,
        filter,
        confidence: confidenceFilter,
        dateRange,
        sortBy,
        sortOrder: 'desc'
      });

      const response = await fetch(

        
        `/api/feedback/all?${queryParams}`,

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
      const response = await fetch('/api/feedback/stats', {
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
      const response = await fetch(`/api/feedback/${feedbackId}`, {
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

  const handleBulkAction = async (action) => {
    if (selectedItems.length === 0) return;

    const confirmMessage = action === 'delete' 
      ? 'Are you sure you want to delete the selected feedback items?'
      : `Are you sure you want to ${action.replace('_', ' ')} the selected feedback items?`;

    if (!window.confirm(confirmMessage)) return;

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/feedback/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          feedbackIds: selectedItems,
          action,
          metadata: {}
        })
      });

      if (response.ok) {
        setSelectedItems([]);
        setShowBulkActions(false);
        fetchFeedbacks();
        fetchStats();
      }
    } catch (error) {
      console.error('Error performing bulk action:', error);
    }
  };

  const handleExport = async (format = 'json') => {
    try {
      const token = localStorage.getItem('authToken');
      const queryParams = new URLSearchParams({
        filter,
        dateRange,
        format
      });

      const response = await fetch(
        `/api/feedback/export?${queryParams}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.ok) {
        if (format === 'csv') {
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `feedback_export_${Date.now()}.csv`;
          a.click();
          window.URL.revokeObjectURL(url);
        } else {
          const data = await response.json();
          const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `feedback_export_${Date.now()}.json`;
          a.click();
          window.URL.revokeObjectURL(url);
        }
      }
    } catch (error) {
      console.error('Error exporting feedback:', error);
    }
  };

  const toggleSelectItem = (feedbackId) => {
    setSelectedItems(prev => 
      prev.includes(feedbackId) 
        ? prev.filter(id => id !== feedbackId)
        : [...prev, feedbackId]
    );
  };

  const selectAllItems = () => {
    if (selectedItems.length === feedbacks.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(feedbacks.map(f => f._id));
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

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getConfidenceBadge = (confidence) => {
    const level = confidence >= 0.8 ? 'High' : confidence >= 0.6 ? 'Medium' : 'Low';
    const colorClass = confidence >= 0.8 ? 'bg-green-100 text-green-800' : 
                      confidence >= 0.6 ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-red-100 text-red-800';
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colorClass}`}>
        {level} ({(confidence * 100).toFixed(0)}%)
      </span>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-[#004581] flex items-center gap-2">
          <AiOutlineMessage />
          Feedback Management
        </h3>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => handleExport('csv')}
            className="flex items-center gap-2 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            <AiOutlineDownload size={16} />
            Export CSV
          </button>
          <button
            onClick={() => handleExport('json')}
            className="flex items-center gap-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <AiOutlineDownload size={16} />
            Export JSON
          </button>
        </div>
      </div>

      {/* Enhanced Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Sentiment</label>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#018ABD]"
          >
            <option value="all">All Sentiment</option>
            <option value="positive">Positive</option>
            <option value="negative">Negative</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Confidence</label>
          <select
            value={confidenceFilter}
            onChange={(e) => setConfidenceFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#018ABD]"
          >
            <option value="all">All Confidence</option>
            <option value="high">High (80%+)</option>
            <option value="medium">Medium (60-79%)</option>
            <option value="low">Low (&lt;60%)</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#018ABD]"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#018ABD]"
          >
            <option value="createdAt">Date Created</option>
            <option value="confidence">Confidence Score</option>
            <option value="sentiment">Sentiment</option>
          </select>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
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
        <div className="bg-emerald-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-emerald-600">{stats.confidence?.high || 0}</div>
          <div className="text-sm text-emerald-600">High Confidence</div>
        </div>
        <div className="bg-orange-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-orange-600">{stats.confidence?.low || 0}</div>
          <div className="text-sm text-orange-600">Low Confidence</div>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedItems.length > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-blue-700">
              {selectedItems.length} item(s) selected
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => handleBulkAction('mark_reviewed')}
                className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-sm"
              >
                Mark as Reviewed
              </button>
              <button
                onClick={() => handleBulkAction('mark_addressed')}
                className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition-colors text-sm"
              >
                Mark as Addressed
              </button>
              <button
                onClick={() => handleBulkAction('delete')}
                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors text-sm"
              >
                Delete Selected
              </button>
              <button
                onClick={() => setSelectedItems([])}
                className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Feedback List Header */}
      {feedbacks.length > 0 && (
        <div className="flex items-center justify-between mb-4 p-3 bg-gray-100 rounded-lg">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={selectedItems.length === feedbacks.length && feedbacks.length > 0}
              onChange={selectAllItems}
              className="w-4 h-4 text-[#018ABD] rounded focus:ring-2 focus:ring-[#018ABD]"
            />
            <span className="text-sm font-medium text-gray-700">
              Select All ({feedbacks.length} items)
            </span>
          </div>
          <span className="text-sm text-gray-600">
            Showing {feedbacks.length} results
          </span>
        </div>
      )}

      {/* Feedback List */}
      {loading ? (
        <div className="text-center py-8">
          <div className="w-8 h-8 border-4 border-[#018ABD] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading feedback...</p>
        </div>
      ) : feedbacks.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No feedback found for the selected filters.
        </div>
      ) : (
        <div className="space-y-4">
          {feedbacks.map((feedback) => (
            <motion.div
              key={feedback._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 rounded-lg border ${getSentimentBg(feedback.sentiment)} ${
                selectedItems.includes(feedback._id) ? 'ring-2 ring-[#018ABD]' : ''
              }`}
            >
              <div className="flex items-start gap-3 mb-3">
                <input
                  type="checkbox"
                  checked={selectedItems.includes(feedback._id)}
                  onChange={() => toggleSelectItem(feedback._id)}
                  className="w-4 h-4 text-[#018ABD] rounded focus:ring-2 focus:ring-[#018ABD] mt-1"
                />
                
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3 flex-wrap">
                      {getSentimentIcon(feedback.sentiment)}
                      <span className={`font-medium ${getSentimentColor(feedback.sentiment)}`}>
                        {feedback.sentiment.charAt(0).toUpperCase() + feedback.sentiment.slice(1)}
                      </span>
                      {getConfidenceBadge(feedback.confidence)}
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
                    <p className="text-gray-700">{feedback.feedback}</p>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>
                      By: {feedback.user?.firstName} {feedback.user?.lastName} ({feedback.user?.email})
                    </span>
                    <span>{new Date(feedback.createdAt).toLocaleDateString()}</span>
                  </div>

                  {/* Status indicators */}
                  <div className="flex gap-2 mt-2">
                    {feedback.reviewed && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        Reviewed
                      </span>
                    )}
                    {feedback.addressed && (
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                        Addressed
                      </span>
                    )}
                  </div>
                </div>
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
                <div className="flex items-center gap-3 flex-wrap">
                  {getSentimentIcon(selectedFeedback.sentiment)}
                  <span className={`font-medium text-lg ${getSentimentColor(selectedFeedback.sentiment)}`}>
                    {selectedFeedback.sentiment.charAt(0).toUpperCase() + selectedFeedback.sentiment.slice(1)} Sentiment
                  </span>
                  {getConfidenceBadge(selectedFeedback.confidence)}
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
