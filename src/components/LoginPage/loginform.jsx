import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Axios from 'axios';

export default function Form() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      try {
        const adminResponse = await Axios.post('http://localhost:3001/api/admin/login', {
          email,
          password,
        });

        if (adminResponse.status === 200) {
          const { token, admin } = adminResponse.data;
          localStorage.setItem('authToken', token);
          localStorage.setItem('user', JSON.stringify({ ...admin, role: 'admin' }));
          setMessage('Admin login successful!');
          navigate('/dashboard');
          return;
        }
      } catch {}

      const userResponse = await Axios.post('http://localhost:3001/api/login', {
        email,
        password,
      });

      if (userResponse.status === 200) {
        const { token, user } = userResponse.data;
        localStorage.setItem('authToken', token);
        localStorage.setItem('user', JSON.stringify(user));
        setMessage('Login successful!');
        navigate('/');
      }
    } catch (error) {
      if (error.response) {
        setMessage(error.response.data.message || 'Login failed!');
      } else {
        setMessage('Network error. Please try again.');
      }
    }
  };

  const handleGoogleSignIn = () => {
    window.location.href = 'http://localhost:3001/auth/google';
  };

  return (
    <div className="bg-white px-10 py-20 border-2 border-gray-200 w-full">
      <h1 className="text-4xl font-sans font-bold text-[#004581]">Welcome Back</h1>
      <p className="font-sans font-medium text-lg text-gray-500 mt-4">
        Welcome Back! Please enter your details.
      </p>

      <form onSubmit={handleLogin}>
        <div className="mt-8">
          {/* Email */}
          <div>
            <label className="text-lg font-medium text-[#004581]">Email</label>
            <input
              type="email"
              className="w-full border-2 border-gray-100 rounded-xl p-4 mt-1 bg-transparent"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Password */}
          <div className="mt-4">
            <label className="text-lg font-medium text-[#004581]">Password</label>
            <div className="relative flex items-center">
              <input
                type={showPassword ? 'text' : 'password'}
                className="w-full border-2 border-gray-100 rounded-xl p-4 pr-10 mt-1 bg-transparent"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <span
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 cursor-pointer"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7M3 3l18 18" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7" />
                  </svg>
                )}
              </span>
            </div>
          </div>

          {/* Remember me */}
          <div className="mt-4 flex justify-between items-center">
            <div>
              <input type="checkbox" id="remember" />
              <label className="ml-2 font-medium text-base" htmlFor="remember">Remember me</label>
            </div>
            <button className="font-medium text-base text-[#018ABD]" type="button">Forgot Password</button>
          </div>

          {/* Buttons */}
          <div className="mt-8 flex flex-col gap-y-4">
            <button
              type="submit"
              className="group active:scale-[.98] active:duration-75 hover:scale-[1.01] ease-in-out transition-all py-3 rounded-xl text-white text-lg font-bold"
              style={{ backgroundColor: '#018ABD' }}
              onMouseEnter={(e) => (e.target.style.backgroundColor = '#004581')}
              onMouseLeave={(e) => (e.target.style.backgroundColor = '#018ABD')}
            >
              Sign in
            </button>
            <button
              type="button"
              className="flex rounded-xl py-3 border-2 border-gray-100 items-center justify-center gap-2 active:scale-[.98] active:duration-75 hover:scale-[1.01] ease-in-out transition-all"
              onClick={handleGoogleSignIn}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 533.5 544.3" width="24" height="24">
                <path fill="#4285F4" d="M533.5 278.4c..." />
              </svg>
              Sign in with Google
            </button>
          </div>

          {/* Sign Up */}
          <div className="mt-8 flex justify-center items-baseline">
            <p className="font-medium text-base">Don't have an account?</p>
            <Link to="/signup" className="text-base font-medium ml-2 text-[#018ABD] hover:underline">Sign Up</Link>
          </div>
        </div>
      </form>

      {message && <p className="mt-4 text-center text-red-500">{message}</p>}
    </div>
  );
}
