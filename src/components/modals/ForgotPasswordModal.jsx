import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AiOutlineClose, AiOutlineMail, AiOutlineLock, AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';

const ForgotPasswordModal = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(1); // 1: email, 2: OTP, 3: new password
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleRequestOTP = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch('http://localhost:3001/api/password-reset/request-reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message);
        setStep(2);
      } else {
        setError(data.message || 'Failed to send OTP');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (!otp) {
      setError('Please enter the OTP');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:3001/api/password-reset/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message);
        setStep(3);
      } else {
        setError(data.message || 'Invalid OTP');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:3001/api/password-reset/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, newPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message);
        setTimeout(() => {
          onClose();
          // Reset form
          setStep(1);
          setEmail('');
          setOtp('');
          setNewPassword('');
          setConfirmPassword('');
          setMessage('');
          setError('');
        }, 2000);
      } else {
        setError(data.message || 'Failed to reset password');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
    // Reset form
    setStep(1);
    setEmail('');
    setOtp('');
    setNewPassword('');
    setConfirmPassword('');
    setMessage('');
    setError('');
  };

  const resendOTP = async () => {
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch('http://localhost:3001/api/password-reset/request-reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('New OTP sent successfully!');
        setOtp('');
      } else {
        setError(data.message || 'Failed to resend OTP');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <h2 className="text-2xl font-bold text-[#004581]">Forgot Password</h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <AiOutlineClose size={24} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {step === 1 && (
              <form onSubmit={handleRequestOTP}>
                <div className="mb-6">
                  <p className="text-gray-600 mb-4">
                    Enter your email address and we'll send you a verification code to reset your password.
                  </p>
                  <div className="relative">
                    <AiOutlineMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#018ABD] focus:outline-none transition-colors"
                      required
                    />
                  </div>
                </div>

                {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#018ABD] hover:bg-[#004581] text-white font-semibold py-3 px-6 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Sending...' : 'Send OTP'}
                </button>
              </form>
            )}

            {step === 2 && (
              <form onSubmit={handleVerifyOTP}>
                <div className="mb-6">
                  <p className="text-gray-600 mb-4">
                    We've sent a 6-digit verification code to <strong>{email}</strong>
                  </p>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Enter 6-digit OTP"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#018ABD] focus:outline-none transition-colors text-center text-lg tracking-widest"
                      maxLength={6}
                      required
                    />
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    Didn't receive the code?{' '}
                    <button
                      type="button"
                      onClick={resendOTP}
                      disabled={loading}
                      className="text-[#018ABD] hover:underline disabled:opacity-50"
                    >
                      Resend
                    </button>
                  </p>
                </div>

                {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
                {message && <p className="text-green-500 text-sm mb-4">{message}</p>}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#018ABD] hover:bg-[#004581] text-white font-semibold py-3 px-6 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Verifying...' : 'Verify OTP'}
                </button>
              </form>
            )}

            {step === 3 && (
              <form onSubmit={handleResetPassword}>
                <div className="mb-6">
                  <p className="text-gray-600 mb-4">
                    Create a new password for your account
                  </p>
                  
                  <div className="mb-4">
                    <div className="relative">
                      <AiOutlineLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="New password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full pl-10 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:border-[#018ABD] focus:outline-none transition-colors"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <AiOutlineEyeInvisible size={20} /> : <AiOutlineEye size={20} />}
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Password must be at least 8 characters long</p>
                  </div>

                  <div className="relative">
                    <AiOutlineLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Confirm new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-10 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:border-[#018ABD] focus:outline-none transition-colors"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <AiOutlineEyeInvisible size={20} /> : <AiOutlineEye size={20} />}
                    </button>
                  </div>
                </div>

                {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
                {message && <p className="text-green-500 text-sm mb-4">{message}</p>}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#018ABD] hover:bg-[#004581] text-white font-semibold py-3 px-6 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Resetting...' : 'Reset Password'}
                </button>
              </form>
            )}

            {/* Step indicator */}
            <div className="flex justify-center mt-6">
              <div className="flex space-x-2">
                {[1, 2, 3].map((stepNumber) => (
                  <div
                    key={stepNumber}
                    className={`w-3 h-3 rounded-full ${
                      stepNumber === step
                        ? 'bg-[#018ABD]'
                        : stepNumber < step
                        ? 'bg-green-500'
                        : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ForgotPasswordModal; 