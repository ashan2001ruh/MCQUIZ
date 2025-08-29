import React, { useState, useEffect } from 'react';
import { FaCrown, FaClock, FaTimes, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';

const SubscriptionStatus = () => {
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSubscriptionStatus();
  }, []);

  const fetchSubscriptionStatus = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      const response = await fetch('/api/payment/subscription-status', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setSubscriptionStatus(data);
      }
    } catch (err) {
      console.error('Error fetching subscription status:', err);
      setError('Failed to load subscription status');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getPlanColor = (plan) => {
    switch (plan) {
      case 'Basic': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'School Pro': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'O/L Pro': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'A/L Pro': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-8 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (error || !subscriptionStatus) {
    return null; // Don't show anything if there's an error or no data
  }

  const { currentLevel, pendingSubscription, recentRejection } = subscriptionStatus;

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
      <div className="flex items-center mb-4">
        <FaCrown className="w-5 h-5 text-[#018ABD] mr-2" />
        <h3 className="text-lg font-semibold text-gray-800">Subscription Status</h3>
      </div>

      {/* Current Subscription Level */}
      <div className="mb-4">
        <p className="text-sm text-gray-600 mb-2">Current Plan</p>
        <span className={`inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium border ${getPlanColor(currentLevel)}`}>
          <FaCrown className="w-3 h-3 mr-1" />
          {currentLevel}
        </span>
      </div>

      {/* Pending Subscription Request */}
      {pendingSubscription && (
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center mb-2">
            <FaClock className="w-4 h-4 text-yellow-600 mr-2" />
            <h4 className="font-medium text-yellow-800">
              {pendingSubscription.status === 'paid' ? 'Payment Complete - Awaiting Approval' : 'Pending Upgrade'}
            </h4>
          </div>
          <p className="text-sm text-yellow-700 mb-2">
            {pendingSubscription.status === 'paid' 
              ? `Your payment for ${pendingSubscription.planType} has been processed successfully. Your upgrade is now awaiting admin approval.`
              : `Your upgrade request to ${pendingSubscription.planType} is awaiting admin approval.`
            }
          </p>
          <p className="text-xs text-yellow-600">
            {pendingSubscription.status === 'paid' ? 'Payment completed' : 'Requested'} on {formatDate(pendingSubscription.createdAt)}
          </p>
        </div>
      )}

      {/* Recent Rejection */}
      {recentRejection && !pendingSubscription && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center mb-2">
            <FaTimes className="w-4 h-4 text-red-600 mr-2" />
            <h4 className="font-medium text-red-800">Request Rejected</h4>
          </div>
          <p className="text-sm text-red-700 mb-2">
            Your recent upgrade request to <strong>{recentRejection.planType}</strong> was not approved.
          </p>
          {recentRejection.rejectionReason && (
            <p className="text-xs text-red-600 mb-2">
              <strong>Reason:</strong> {recentRejection.rejectionReason}
            </p>
          )}
          <p className="text-xs text-red-600">
            Rejected on {formatDate(recentRejection.updatedAt)}
          </p>
        </div>
      )}

      {/* Success Message for Premium Users */}
      {currentLevel !== 'Basic' && currentLevel !== 'basic' && !pendingSubscription && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center mb-2">
            <FaCheckCircle className="w-4 h-4 text-green-600 mr-2" />
            <h4 className="font-medium text-green-800">Premium Access Active</h4>
          </div>
          <p className="text-sm text-green-700">
            You have full access to all premium features and content.
          </p>
        </div>
      )}

      {/* Information for Basic Users */}
      {(currentLevel === 'Basic' || currentLevel === 'basic') && !pendingSubscription && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center mb-2">
            <FaExclamationTriangle className="w-4 h-4 text-blue-600 mr-2" />
            <h4 className="font-medium text-blue-800">Upgrade Available</h4>
          </div>
          <p className="text-sm text-blue-700 mb-3">
            Upgrade to a premium plan to access advanced features and unlimited quizzes.
          </p>
          <button
            onClick={() => {
              // Navigate to pricing section
              const pricingSection = document.getElementById('pricing-section');
              if (pricingSection) {
                pricingSection.scrollIntoView({ behavior: 'smooth' });
              } else {
                // If not on homepage, navigate there first
                window.location.href = '/#pricing-section';
              }
            }}
            className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors"
          >
            View Plans
          </button>
        </div>
      )}
    </div>
  );
};

export default SubscriptionStatus;
