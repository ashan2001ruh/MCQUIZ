import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: ''
  });

  useEffect(() => {
    fetchUserProfile();
    
    // Check for payment status in URL params
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get('payment');
    const orderId = urlParams.get('order_id');
    
    if (paymentStatus === 'success') {
      setSuccess('🎉 Payment successful! Your subscription has been updated. You now have access to premium features.');
      // Immediately refresh user profile to get updated subscription
      fetchUserProfile();
      
      // If we have order ID, verify payment status with backend
      if (orderId) {
        verifyPaymentStatus(orderId);
      }
      
      setTimeout(() => {
        setSuccess(null);
      }, 8000);
      // Remove the parameters from URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (paymentStatus === 'cancelled') {
      setError('❌ Payment was cancelled. Your subscription was not updated. Please try again if you wish to upgrade.');
      setTimeout(() => setError(null), 8000);
      // Remove the parameters from URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (paymentStatus === 'failed') {
      setError('❌ Payment failed. Your subscription was not updated. Please check your payment details and try again.');
      setTimeout(() => setError(null), 8000);
      // Remove the parameters from URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // Debug effect to log profile picture state changes
  useEffect(() => {
    if (user?.profilePicture) {
      console.log('Profile picture state updated:', {
        userProfilePicture: user.profilePicture,
        previewUrl: previewUrl,
        constructedUrl: user.profilePicture.startsWith('http') ? user.profilePicture : `http://localhost:3001/uploads/profile-pictures/${user.profilePicture}`
      });
    }
  }, [user?.profilePicture, previewUrl]);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await axios.get('http://localhost:3001/api/user/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });

      const userData = response.data.user;
      setUser(userData);
      
      // Update localStorage with fresh user data
      localStorage.setItem('user', JSON.stringify(userData));
      
      setFormData({
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        email: userData.email || ''
      });
      
      if (userData.profilePicture && userData.profilePicture.trim() !== '') {
        const fullProfilePictureUrl = getProfilePictureUrl(userData.profilePicture);
        setPreviewUrl(fullProfilePictureUrl);
      } else {
        setPreviewUrl(null);
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError('Failed to load profile data: ' + (err.response?.data?.message || err.message));
      setLoading(false);
    }
  };

  const getAuthHeader = () => {
    const token = localStorage.getItem('authToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // Helper function to construct full profile picture URL
  const getProfilePictureUrl = (profilePicture) => {
    if (!profilePicture || profilePicture.trim() === '') {
      return null;
    }
    
    if (profilePicture.startsWith('http')) {
      return profilePicture;
    } else if (profilePicture.startsWith('/uploads')) {
      return `http://localhost:3001${profilePicture}`;
    } else {
      return `http://localhost:3001/uploads/profile-pictures/${profilePicture}`;
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
      
      await uploadProfilePicture(file);
    }
  };

  const uploadProfilePicture = async (file = selectedFile) => {
    if (!file) return;

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('profilePicture', file);

      const response = await axios.post('http://localhost:3001/api/user/upload-profile-picture', formData, {
        headers: {
          ...getAuthHeader(),
          'Content-Type': 'multipart/form-data'
        }
      });

      setSuccess('Profile picture updated successfully!');
      setSelectedFile(null);
      
      const profilePictureUrl = response.data.profilePicture;
      
      console.log('Backend returned profile picture URL:', profilePictureUrl);
      
      // Use helper function to construct full URL
      const fullProfilePictureUrl = getProfilePictureUrl(profilePictureUrl);
      
      console.log('Constructed full URL:', fullProfilePictureUrl);
      
      // Update user state with the new profile picture URL (keep the original path from backend)
      setUser(prev => ({
        ...prev, 
        profilePicture: profilePictureUrl
      }));
      
      // Update preview URL for the main profile picture display (use full URL)
      setPreviewUrl(fullProfilePictureUrl);
      
      // Update localStorage to persist the change
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        userData.profilePicture = profilePictureUrl;
        localStorage.setItem('user', JSON.stringify(userData));
      }
      
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Upload error:', err);
      setError('Failed to upload profile picture: ' + (err.response?.data?.message || err.message));
      setTimeout(() => setError(null), 3000);
    } finally {
      setUploading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleUpdateProfile = async () => {
    try {
      const response = await axios.put('http://localhost:3001/api/user/update-profile', formData, {
        headers: getAuthHeader()
      });

      setUser(response.data.user);
      setIsEditing(false);
      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
      setTimeout(() => setError(null), 3000);
    }
  };

  const [passwordStep, setPasswordStep] = useState(1); // 1: request OTP, 2: verify OTP, 3: reset password

  const handlePasswordChangeRequest = async () => {
    try {
      console.log('Requesting OTP for email:', user.email);
      
      const response = await axios.post('http://localhost:3001/api/password-reset/request-reset', {
        email: user.email
      });

      console.log('OTP request response:', response.data);

      setPasswordStep(2);
      setSuccess('OTP sent to your email!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('OTP request error:', err.response?.data || err);
      setError(err.response?.data?.message || 'Failed to send OTP');
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp || otp.trim() === '') {
      setError('Please enter the verification code');
      setTimeout(() => setError(null), 3000);
      return;
    }

    try {
      console.log('Verifying OTP for email:', user.email);
      
      const response = await axios.post('http://localhost:3001/api/password-reset/verify-otp', {
        email: user.email,
        otp: otp.trim()
      });

      console.log('OTP verification response:', response.data);

      setPasswordStep(3);
      setSuccess('OTP verified successfully! Now enter your new password.');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('OTP verification error:', err.response?.data || err);
      setError(err.response?.data?.message || 'Invalid OTP');
      setTimeout(() => setError(null), 3000);
    }
  };

  const resendOTP = async () => {
    try {
      console.log('Resending OTP for email:', user.email);
      
      const response = await axios.post('http://localhost:3001/api/password-reset/request-reset', {
        email: user.email
      });

      console.log('OTP resend response:', response.data);

      setSuccess('New OTP sent successfully!');
      setOtp('');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('OTP resend error:', err.response?.data || err);
      setError(err.response?.data?.message || 'Failed to resend OTP');
      setTimeout(() => setError(null), 3000);
    }
  };

  const handlePasswordReset = async () => {
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      setTimeout(() => setError(null), 3000);
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      setTimeout(() => setError(null), 3000);
      return;
    }

    try {
      console.log('Resetting password for email:', user.email);
      
      const response = await axios.post('http://localhost:3001/api/password-reset/reset-password', {
        email: user.email,
        newPassword: newPassword
      });

      console.log('Password reset response:', response.data);

      setSuccess('Password changed successfully!');
      setIsChangingPassword(false);
      setPasswordStep(1);
      setOtp('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Password reset error:', err.response?.data || err);
      setError(err.response?.data?.message || 'Failed to change password');
      setTimeout(() => setError(null), 3000);
    }
  };

  const deleteProfilePicture = async () => {
    try {
      const response = await axios.delete('http://localhost:3001/api/user/delete-profile-picture', {
        headers: getAuthHeader()
      });

      setSuccess('Profile picture deleted successfully!');
      
      // Clear profile picture from state
      setUser(prev => ({
        ...prev, 
        profilePicture: null
      }));
      
      setPreviewUrl(null);
      
      // Update localStorage
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        userData.profilePicture = null;
        localStorage.setItem('user', JSON.stringify(userData));
      }
      
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete profile picture');
      setTimeout(() => setSuccess(null), 3000);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleChoosePlan = async (planName, amount) => {
    if (!user) {
      setError('Please login to select a plan');
      return;
    }

    if (user.subscriptionLevel === planName) {
      setError('You already have this plan');
      return;
    }

    setPaymentLoading(true);
    setError(null);

    try {
      const response = await axios.post(
        'http://localhost:3001/api/payment/initialize',
        {
          planType: planName,
          amount: parseInt(amount)
        },
        {
          headers: getAuthHeader()
        }
      );

      if (response.data.success) {
        // Create PayHere form and submit
        const paymentData = response.data.paymentData;
        
        // Create a form to submit to PayHere
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = 'https://sandbox.payhere.lk/pay/checkout'; // Sandbox URL for testing
        
        // Add all payment data as hidden fields
        Object.keys(paymentData).forEach(key => {
          const input = document.createElement('input');
          input.type = 'hidden';
          input.name = key;
          input.value = paymentData[key];
          form.appendChild(input);
        });
        
        // Submit the form
        document.body.appendChild(form);
        form.submit();
        document.body.removeChild(form);
      }
    } catch (err) {
      console.error('Payment initialization error:', err);
      setError('Failed to initialize payment. Please try again.');
      setTimeout(() => setError(null), 3000);
    } finally {
      setPaymentLoading(false);
    }
  };

  const verifyPaymentStatus = async (orderId) => {
    try {
      const response = await axios.get(
        `http://localhost:3001/api/payment/status/${orderId}`,
        {
          headers: getAuthHeader()
        }
      );

      console.log('Payment verification response:', response.data);
      
      if (response.data.status === 'success') {
        setSuccess('✅ Payment verified successfully! Your subscription is now active.');
      } else if (response.data.status === 'pending') {
        setSuccess('⏳ Payment is being processed. Your subscription will be activated shortly.');
      }
    } catch (err) {
      console.error('Payment verification error:', err);
      // Don't show error for verification, as the main success message is already shown
    }
  };

  const handleSyncSubscription = async () => {
    setPaymentLoading(true);
    setError(null);

    try {
      const response = await axios.post(
        'http://localhost:3001/api/payment/update-subscription',
        {},
        {
          headers: getAuthHeader()
        }
      );

      if (response.data.message) {
        setSuccess('Subscription status synchronized successfully!');
        // Refresh user profile to get updated data
        await fetchUserProfile();
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err) {
      console.error('Sync subscription error:', err);
      setError(err.response?.data?.message || 'Failed to sync subscription status.');
      setTimeout(() => setError(null), 3000);
    } finally {
      setPaymentLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#018ABD] mx-auto mb-6"></div>
          <p className="text-gray-700 text-lg font-medium">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blue-50 flex flex-col">
      {/* Simplified Header */}
      <header className="bg-white shadow-lg border-b border-gray-200">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo and Brand */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-[#014482] to-[#018ABD] rounded-xl flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform duration-200">
                  <span className="text-3xl text-white font-bold">Q</span>
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-[#014482] to-[#018ABD] bg-clip-text text-transparent">
                    MCQuiz
                  </h1>
                  <p className="text-sm text-gray-600 -mt-1 font-medium">Learning Platform</p>
                </div>
              </div>
            </div>

            {/* User Greeting */}
            <div className="flex items-center space-x-4">
              <span className="text-gray-700 font-medium">
                Welcome, {user?.firstName || 'User'}! 👋
              </span>
              <div className="flex items-center space-x-2">
                {user?.profilePicture && user.profilePicture.trim() !== '' ? (
                  <img
                    src={getProfilePictureUrl(user.profilePicture)}
                    alt="Profile"
                    className="w-10 h-10 rounded-full object-cover border-2 border-[#018ABD]"
                    onError={(e) => {
                      console.error('Header image failed to load:', e.target.src);
                      console.log('User profile picture:', user.profilePicture);
                    }}
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
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Success/Error Messages */}
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-6">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              {success}
            </div>
          </div>
        )}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          </div>
        )}

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            <span className="text-[#014482]">User </span>
            <span className="text-[#018ABD]">Profile</span>
          </h1>
          <p className="text-gray-600 mt-2">Manage your account settings and preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Section - User Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
              {/* Profile Picture */}
              <div className="text-center mb-6">
                <div className="relative inline-block">
                  {(previewUrl || (user?.profilePicture && user.profilePicture.trim() !== '')) ? (
                    <img
                      src={previewUrl || getProfilePictureUrl(user.profilePicture)}
                      alt="Profile"
                      className="w-32 h-32 rounded-full object-cover border-4 border-[#018ABD] shadow-lg"
                      onError={(e) => {
                        console.error('Main profile image failed to load:', e.target.src);
                        console.log('Preview URL:', previewUrl);
                        console.log('User profile picture:', user.profilePicture);
                      }}
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-full border-4 border-dashed border-[#018ABD] bg-gray-50 flex items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors">
                      <svg className="w-16 h-16 text-[#018ABD]" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                      </svg>
                    </div>
                  )}
                  
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    disabled={uploading}
                  />
                  
                  <div className="absolute bottom-2 right-2 bg-white p-2 rounded-full shadow-lg">
                    <svg className="w-4 h-4 text-[#018ABD]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </div>
                </div>
                
                {uploading && (
                  <div className="mt-4">
                    <div className="flex items-center justify-center text-[#018ABD]">
                      <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-[#018ABD] mr-2"></div>
                      <span>Uploading...</span>
                    </div>
                  </div>
                )}

                {/* Profile Picture Actions */}
                {(previewUrl || (user?.profilePicture && user.profilePicture.trim() !== '')) && (
                  <div className="mt-4 flex justify-center space-x-3">
                    <button
                      onClick={() => document.querySelector('input[type="file"]').click()}
                      className="bg-[#018ABD] text-white px-4 py-2 rounded-lg hover:bg-[#014482] transition-colors text-sm flex items-center"
                      disabled={uploading}
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Change
                    </button>
                    <button
                      onClick={deleteProfilePicture}
                      className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors text-sm flex items-center"
                      disabled={uploading}
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete
                    </button>
                  </div>
                )}
              </div>

              {/* User Name */}
              <h2 className="text-2xl font-bold text-gray-800 text-center mb-4">
                {user?.firstName} {user?.lastName}
              </h2>

              {/* User Info */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center text-gray-600 p-3 bg-gray-50 rounded-lg">
                  <svg className="w-5 h-5 mr-3 text-[#018ABD]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className="truncate">{user?.email}</span>
                </div>
                
                <div className="flex items-center text-gray-600 p-3 bg-gray-50 rounded-lg">
                  <svg className="w-5 h-5 mr-3 text-[#018ABD]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>MCQuiz Member</span>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="bg-gradient-to-r from-[#014482] to-[#018ABD] p-4 rounded-lg text-white">
                <h3 className="font-semibold mb-2">Account Status</h3>
                <div className="flex items-center justify-between mb-3">
                  <span>Active</span>
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                </div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm">Current Plan:</span>
                  <div className="flex items-center">
                    <span className="text-sm font-semibold">{user?.subscriptionLevel || 'Basic'}</span>
                    {(user?.subscriptionLevel !== 'Basic' && user?.subscriptionLevel !== 'basic' && user?.subscriptionLevel) && (
                      <span className="ml-2 text-xs bg-yellow-500 px-2 py-1 rounded-full">PRO</span>
                    )}
                  </div>
                </div>
                {(user?.subscriptionLevel === 'Basic' || user?.subscriptionLevel === 'basic' || !user?.subscriptionLevel) ? (
                  <button
                    onClick={() => {
                      navigate('/');
                      setTimeout(() => {
                        const pricingSection = document.getElementById('pricing-section');
                        if (pricingSection) {
                          pricingSection.scrollIntoView({ behavior: 'smooth' });
                        }
                      }, 100);
                    }}
                    className="w-full bg-yellow-500 text-white py-2 rounded-lg font-medium hover:bg-yellow-600 transition-colors text-sm flex items-center justify-center"
                  >
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    Upgrade Plan
                  </button>
                ) : (
                  <div className="w-full bg-green-600 text-white py-2 rounded-lg font-medium text-center text-sm flex items-center justify-center">
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Premium Active
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Section - Profile Edit Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                <span className="text-[#014482]">Profile </span>
                <span className="text-[#018ABD]">Settings</span>
              </h2>

              {/* User Information Section */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-[#014482] mb-4">Personal Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#018ABD] focus:border-transparent disabled:bg-gray-50 transition-colors"
                      placeholder="Enter your first name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#018ABD] focus:border-transparent disabled:bg-gray-50 transition-colors"
                      placeholder="Enter your last name"
                    />
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#018ABD] focus:border-transparent disabled:bg-gray-50 transition-colors"
                    placeholder="Enter your email address"
                  />
                </div>

                <div className="flex space-x-3">
                  {!isEditing ? (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="bg-[#018ABD] text-white px-6 py-3 rounded-lg hover:bg-[#014482] transition-colors flex items-center"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Edit Profile
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={handleUpdateProfile}
                        className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center"
                      >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Save Changes
                      </button>
                      <button
                        onClick={() => {
                          setIsEditing(false);
                          fetchUserProfile();
                        }}
                        className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors flex items-center"
                      >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Cancel
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Password Section */}
              <div>
                <h3 className="text-lg font-semibold text-[#014482] mb-4">Security Settings</h3>
                
                {!isChangingPassword ? (
                  <button
                    onClick={() => setIsChangingPassword(true)}
                    className="bg-[#018ABD] text-white px-6 py-3 rounded-lg hover:bg-[#014482] transition-colors flex items-center"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    Change Password
                  </button>
                ) : (
                  <div className="space-y-6 bg-gray-50 p-6 rounded-lg">
                    {/* Step 1: Request OTP */}
                    {passwordStep === 1 && (
                      <div className="text-center">
                        <p className="text-gray-600 mb-6">
                          For security reasons, we'll send an OTP to your registered email address to verify your identity.
                        </p>
                        <button
                          onClick={handlePasswordChangeRequest}
                          className="bg-[#018ABD] text-white px-6 py-3 rounded-lg hover:bg-[#014482] transition-colors flex items-center mx-auto"
                        >
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          Send Verification OTP
                        </button>
                      </div>
                    )}

                    {/* Step 2: Verify OTP */}
                    {passwordStep === 2 && (
                      <div className="space-y-4">
                        <div className="text-center mb-4">
                          <p className="text-gray-600">
                            We've sent a 6-digit verification code to <strong>{user?.email}</strong>
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Verification Code</label>
                          <input
                            type="text"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                            placeholder="Enter the 6-digit code sent to your email"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#018ABD] focus:border-transparent text-center text-lg tracking-widest"
                            maxLength={6}
                          />
                          <p className="text-sm text-gray-500 mt-2">
                            Didn't receive the code?{' '}
                            <button
                              type="button"
                              onClick={resendOTP}
                              className="text-[#018ABD] hover:underline"
                            >
                              Resend
                            </button>
                          </p>
                        </div>
                        <div className="flex space-x-3 pt-2">
                          <button
                            onClick={handleVerifyOTP}
                            className="bg-[#018ABD] text-white px-6 py-3 rounded-lg hover:bg-[#014482] transition-colors flex-1 flex items-center justify-center"
                          >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Verify OTP
                          </button>
                          <button
                            onClick={() => {
                              setIsChangingPassword(false);
                              setPasswordStep(1);
                              setOtp('');
                              setNewPassword('');
                              setConfirmPassword('');
                            }}
                            className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors flex-1 flex items-center justify-center"
                          >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Step 3: Reset Password */}
                    {passwordStep === 3 && (
                      <div className="space-y-4">
                        <div className="text-center mb-4">
                          <p className="text-gray-600">
                            OTP verified successfully! Now create a new password for your account.
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                          <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Enter your new password (min. 8 characters)"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#018ABD] focus:border-transparent"
                          />
                          <p className="text-xs text-gray-500 mt-1">Password must be at least 8 characters long</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                          <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm your new password"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#018ABD] focus:border-transparent"
                          />
                        </div>
                        <div className="flex space-x-3 pt-2">
                          <button
                            onClick={handlePasswordReset}
                            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors flex-1 flex items-center justify-center"
                          >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Update Password
                          </button>
                          <button
                            onClick={() => {
                              setIsChangingPassword(false);
                              setPasswordStep(1);
                              setOtp('');
                              setNewPassword('');
                              setConfirmPassword('');
                            }}
                            className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors flex-1 flex items-center justify-center"
                          >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Step Indicator */}
                    {isChangingPassword && (
                      <div className="flex justify-center mt-4">
                        <div className="flex space-x-2">
                           {[1, 2, 3].map((stepNumber) => (
                             <div
                               key={stepNumber}
                               className={`w-3 h-3 rounded-full ${
                                 stepNumber === passwordStep
                                   ? 'bg-[#018ABD]'
                                   : stepNumber < passwordStep
                                   ? 'bg-green-500'
                                   : 'bg-gray-300'
                               }`}
                             />
                           ))}
                         </div>
                       </div>
                     )}
                   </div>
                )}
              </div>

              {/* Subscription Plans Section */}
              <div className="mt-8">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-[#014482]">Subscription Plans</h3>
                  <button
                    onClick={handleSyncSubscription}
                    disabled={paymentLoading}
                    className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors text-sm flex items-center"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Sync Status
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    {
                      name: 'School Pro',
                      price: 'Rs. 1,500',
                      period: 'per year',
                      features: [
                        'Grade 5 Scholarship preparation',
                        'Immediate feedback on answers',
                        'Full timed practice tests',
                        'Progress tracking'
                      ],
                      buttonColor: 'bg-blue-600 hover:bg-blue-700'
                    },
                    {
                      name: 'O/L Pro',
                      price: 'Rs. 2,000',
                      period: 'per year',
                      features: [
                        'O/L subject-based MCQs',
                        'Instant feedback system',
                        'Subject-specific timed tests',
                        'Detailed analytics'
                      ],
                      buttonColor: 'bg-green-600 hover:bg-green-700'
                    },
                    {
                      name: 'A/L Pro',
                      price: 'Rs. 2,500',
                      period: 'per year',
                      features: [
                        'A/L categorized MCQs',
                        'Real-time answer feedback',
                        'Exam simulation mode',
                        'Performance insights'
                      ],
                      buttonColor: 'bg-purple-600 hover:bg-purple-700'
                    }
                  ].map((plan, index) => (
                    <div key={index} className="bg-gray-50 p-5 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                      <div className="text-center mb-4">
                        <h4 className="text-lg font-semibold text-gray-800 mb-2">{plan.name}</h4>
                        <div className="text-2xl font-bold text-[#018ABD] mb-1">{plan.price}</div>
                        <div className="text-sm text-gray-600">{plan.period}</div>
                      </div>
                      <ul className="text-sm text-gray-600 mb-4 space-y-2">
                        {plan.features.map((feature, i) => (
                          <li key={i} className="flex items-start">
                            <svg className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                      <button
                        onClick={() => handleChoosePlan(plan.name, plan.price.replace(/[^\d]/g, ''))}
                        disabled={user?.subscriptionLevel === plan.name || paymentLoading}
                        className={`w-full py-2 px-4 rounded-lg text-white font-medium transition-colors ${
                          user?.subscriptionLevel === plan.name || paymentLoading
                            ? 'bg-gray-400 cursor-not-allowed'
                            : `${plan.buttonColor}`
                        }`}
                      >
                        {paymentLoading ? 'Processing...' : user?.subscriptionLevel === plan.name ? 'Current Plan' : 'Choose Plan'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default UserProfile;