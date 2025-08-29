import React, { useState, useEffect } from 'react';
import Axios from 'axios';
import { FaSearch, FaChevronLeft, FaChevronRight, FaCheck, FaTimes, FaUser, FaCrown, FaEye } from 'react-icons/fa';

const AdminSubscriptionManagement = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [subscriptions, setSubscriptions] = useState([]);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({});
  const [activeTab, setActiveTab] = useState('overview');
  
  // Pagination and filters
  const [subscriptionPagination, setSubscriptionPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });
  const [userPagination, setUserPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });
  
  const [subscriptionFilters, setSubscriptionFilters] = useState({
    status: ''
  });
  const [userFilters, setUserFilters] = useState({
    subscriptionLevel: '',
    search: ''
  });

  // Modals
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (activeTab === 'subscriptions') {
      fetchSubscriptions();
    } else if (activeTab === 'users') {
      fetchUsers();
    }
  }, [activeTab, subscriptionPagination.page, userPagination.page, subscriptionFilters, userFilters]);

  const fetchData = async () => {
    try {
      await Promise.all([
        fetchStats(),
        fetchSubscriptions(),
        fetchUsers()
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load subscription data');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await Axios.get('http://localhost:3001/api/admin/subscriptions/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const fetchSubscriptions = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const { status } = subscriptionFilters;
      
      let url = `http://localhost:3001/api/admin/subscriptions/all?page=${subscriptionPagination.page}&limit=${subscriptionPagination.limit}`;
      if (status) url += `&status=${status}`;
      
      const response = await Axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setSubscriptions(response.data.subscriptions);
      setSubscriptionPagination(prev => ({
        ...prev,
        ...response.data.pagination
      }));
    } catch (error) {
      console.error('Failed to fetch subscriptions:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const { subscriptionLevel, search } = userFilters;
      
      let url = `http://localhost:3001/api/admin/subscriptions/users?page=${userPagination.page}&limit=${userPagination.limit}`;
      if (subscriptionLevel) url += `&subscriptionLevel=${subscriptionLevel}`;
      if (search) url += `&search=${search}`;
      
      const response = await Axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setUsers(response.data.users);
      setUserPagination(prev => ({
        ...prev,
        ...response.data.pagination
      }));
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  const handleApproveSubscription = async () => {
    try {
      const token = localStorage.getItem('authToken');
      await Axios.put(
        `http://localhost:3001/api/admin/subscriptions/${selectedSubscription._id}/approve`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setShowApprovalModal(false);
      setSelectedSubscription(null);
      await fetchData();
    } catch (error) {
      console.error('Failed to approve subscription:', error);
      setError('Failed to approve subscription');
    }
  };

  const handleRejectSubscription = async () => {
    try {
      const token = localStorage.getItem('authToken');
      await Axios.put(
        `http://localhost:3001/api/admin/subscriptions/${selectedSubscription._id}/reject`,
        { reason: rejectionReason },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setShowRejectionModal(false);
      setSelectedSubscription(null);
      setRejectionReason('');
      await fetchData();
    } catch (error) {
      console.error('Failed to reject subscription:', error);
      setError('Failed to reject subscription');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'paid': return 'bg-blue-100 text-blue-800';
      case 'success': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'canceled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPlanColor = (plan) => {
    switch (plan) {
      case 'Basic': return 'bg-blue-100 text-blue-800';
      case 'School Pro': return 'bg-purple-100 text-purple-800';
      case 'O/L Pro': return 'bg-orange-100 text-orange-800';
      case 'A/L Pro': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#014482]"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-white">
        <h2 className="text-xl font-semibold text-[#014482]">Subscription Management</h2>
      </div>

      {error && (
        <div className="mx-6 mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Tab Navigation */}
      <div className="px-6 py-4 border-b border-gray-200">
        <nav className="flex space-x-4">
          {[
            { id: 'overview', label: 'Overview', icon: FaEye },
            { id: 'subscriptions', label: 'Subscription Requests', icon: FaCrown },
            { id: 'users', label: 'All Users', icon: FaUser }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-[#018ABD] text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <tab.icon className="w-4 h-4 mr-2" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <FaUser className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">Total Users</p>
                    <p className="text-2xl font-bold text-blue-600">{stats.totalUsers || 0}</p>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                    <FaCrown className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">Pending Requests</p>
                    <p className="text-2xl font-bold text-yellow-600">{stats.pendingRequests || 0}</p>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <FaCheck className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">Approved</p>
                    <p className="text-2xl font-bold text-green-600">{stats.acceptedRequests || 0}</p>
                  </div>
                </div>
              </div>

              <div className="bg-purple-50 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <FaCrown className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">Premium Users</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {stats.subscriptionLevels?.filter(level => level._id !== 'Basic' && level._id !== 'basic').reduce((sum, level) => sum + level.count, 0) || 0}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Subscription Level Distribution */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Subscription Level Distribution</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.subscriptionLevels?.map(level => (
                  <div key={level._id} className="bg-white rounded-lg p-4 border border-gray-200">
                    <h4 className={`font-medium px-2 py-1 rounded text-sm inline-block ${getPlanColor(level._id)}`}>
                      {level._id}
                    </h4>
                    <p className="text-2xl font-bold text-gray-800 mt-2">{level.count}</p>
                    <p className="text-sm text-gray-600">users</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Recent Subscription Activity</h3>
              <div className="space-y-3">
                {stats.recentActivity?.slice(0, 5).map(activity => (
                  <div key={activity._id} className="bg-white rounded-lg p-4 border border-gray-200">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">
                          {activity.userId?.firstName} {activity.userId?.lastName}
                        </p>
                        <p className="text-sm text-gray-600">{activity.userId?.email}</p>
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getPlanColor(activity.planType)}`}>
                          {activity.planType}
                        </span>
                        <span className={`block px-2 py-1 rounded text-xs font-medium mt-1 ${getStatusColor(activity.status)}`}>
                          {activity.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'subscriptions' && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="flex flex-wrap gap-4">
              <select
                value={subscriptionFilters.status}
                onChange={(e) => setSubscriptionFilters({ ...subscriptionFilters, status: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#018ABD]"
              >
                <option value="">All Status</option>
                <option value="pending">Pending Payment</option>
                <option value="paid">Paid - Awaiting Approval</option>
                <option value="success">Approved</option>
                <option value="failed">Rejected</option>
              </select>
            </div>

            {/* Subscriptions Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {subscriptions.map(subscription => (
                    <tr key={subscription._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <p className="font-medium text-gray-900">
                            {subscription.userId?.firstName} {subscription.userId?.lastName}
                          </p>
                          <p className="text-sm text-gray-500">{subscription.userId?.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded ${getPlanColor(subscription.planType)}`}>
                          {subscription.planType}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        LKR {subscription.amount?.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(subscription.status)}`}>
                          {subscription.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(subscription.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {(subscription.status === 'pending' || subscription.status === 'paid') && (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => {
                                setSelectedSubscription(subscription);
                                setShowApprovalModal(true);
                              }}
                              className="text-green-600 hover:text-green-900 flex items-center"
                            >
                              <FaCheck className="w-4 h-4 mr-1" />
                              Approve
                            </button>
                            <button
                              onClick={() => {
                                setSelectedSubscription(subscription);
                                setShowRejectionModal(true);
                              }}
                              className="text-red-600 hover:text-red-900 flex items-center"
                            >
                              <FaTimes className="w-4 h-4 mr-1" />
                              Reject
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {subscriptionPagination.pages > 1 && (
              <div className="flex justify-center">
                <div className="flex space-x-2">
                  <button
                    disabled={subscriptionPagination.page === 1}
                    onClick={() => setSubscriptionPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                    className={`px-3 py-1 rounded flex items-center ${
                      subscriptionPagination.page === 1 
                        ? 'bg-gray-100 text-gray-400' 
                        : 'bg-gray-200 hover:bg-gray-300'
                    }`}
                  >
                    <FaChevronLeft className="mr-1" size={8} /> Prev
                  </button>
                  <div className="px-4 py-1 bg-gray-100 flex items-center">
                    Page {subscriptionPagination.page} of {subscriptionPagination.pages}
                  </div>
                  <button
                    disabled={subscriptionPagination.page === subscriptionPagination.pages}
                    onClick={() => setSubscriptionPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                    className={`px-3 py-1 rounded flex items-center ${
                      subscriptionPagination.page === subscriptionPagination.pages 
                        ? 'bg-gray-100 text-gray-400' 
                        : 'bg-gray-200 hover:bg-gray-300'
                    }`}
                  >
                    Next <FaChevronRight className="ml-1" size={8} />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'users' && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="flex flex-wrap gap-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search users..."
                  value={userFilters.search}
                  onChange={(e) => setUserFilters({ ...userFilters, search: e.target.value })}
                  className="pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#018ABD]"
                />
                <FaSearch className="absolute left-2 top-3 text-gray-400" size={14} />
              </div>
              <select
                value={userFilters.subscriptionLevel}
                onChange={(e) => setUserFilters({ ...userFilters, subscriptionLevel: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#018ABD]"
              >
                <option value="">All Subscription Levels</option>
                <option value="Basic">Basic</option>
                <option value="School Pro">School Pro</option>
                <option value="O/L Pro">O/L Pro</option>
                <option value="A/L Pro">A/L Pro</option>
              </select>
            </div>

            {/* Users Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Plan</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pending Request</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Subscriptions</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map(user => (
                    <tr key={user._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <p className="font-medium text-gray-900">
                            {user.firstName} {user.lastName}
                          </p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded ${getPlanColor(user.subscriptionLevel)}`}>
                          {user.subscriptionLevel}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user.pendingSubscription ? (
                          <span className="px-2 py-1 text-xs font-medium rounded bg-yellow-100 text-yellow-800">
                            {user.pendingSubscription.planType}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-sm">None</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user.totalSubscriptions}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(user.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {userPagination.pages > 1 && (
              <div className="flex justify-center">
                <div className="flex space-x-2">
                  <button
                    disabled={userPagination.page === 1}
                    onClick={() => setUserPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                    className={`px-3 py-1 rounded flex items-center ${
                      userPagination.page === 1 
                        ? 'bg-gray-100 text-gray-400' 
                        : 'bg-gray-200 hover:bg-gray-300'
                    }`}
                  >
                    <FaChevronLeft className="mr-1" size={8} /> Prev
                  </button>
                  <div className="px-4 py-1 bg-gray-100 flex items-center">
                    Page {userPagination.page} of {userPagination.pages}
                  </div>
                  <button
                    disabled={userPagination.page === userPagination.pages}
                    onClick={() => setUserPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                    className={`px-3 py-1 rounded flex items-center ${
                      userPagination.page === userPagination.pages 
                        ? 'bg-gray-100 text-gray-400' 
                        : 'bg-gray-200 hover:bg-gray-300'
                    }`}
                  >
                    Next <FaChevronRight className="ml-1" size={8} />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Approval Modal */}
      {showApprovalModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Approve Subscription</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to approve the subscription request for{' '}
              <strong>{selectedSubscription?.userId?.firstName} {selectedSubscription?.userId?.lastName}</strong>{' '}
              to upgrade to <strong>{selectedSubscription?.planType}</strong>?
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowApprovalModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleApproveSubscription}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Approve
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Modal */}
      {showRejectionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Reject Subscription</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to reject the subscription request for{' '}
              <strong>{selectedSubscription?.userId?.firstName} {selectedSubscription?.userId?.lastName}</strong>?
            </p>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rejection Reason (Optional)
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#018ABD]"
                rows="3"
                placeholder="Enter reason for rejection..."
              />
            </div>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowRejectionModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectSubscription}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSubscriptionManagement;
