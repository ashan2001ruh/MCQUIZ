//signupform.jsx

import React from 'react';
import { Link } from 'react-router-dom';


export default function Signup() {
  return (
    <div className="bg-white px-6 py-10 border-2 border-gray-200 w-full">
      <h1 className="text-4xl font-sans font-bold text-[#004581]">Create Account</h1>
      <p className="font-sans font-medium text-medium text-gray-500 mt-1">
        Already have an account?{' '}
        <Link to="/login" className="text-[#018ABD] hover:underline">
          Login
        </Link>
      </p>
      <div className="mt-8">
        <div className="flex gap-2">
          <div className="flex-1">
            <label className="text-lg font-medium text-[#004581]">First Name</label>
            <input
              type="text"
              className="w-full border-2 border-gray-100 rounded-xl p-4 mt-1 bg-transparent"
              placeholder="First name"
            />
          </div>
          <div className="flex-1">
            <label className="text-lg font-medium text-[#004581]">Last Name</label>
            <input
              type="text"
              className="w-full border-2 border-gray-100 rounded-xl p-4 mt-1 bg-transparent"
              placeholder="Last name"
            />
          </div>
        </div>

        <div className="mt-3">
          <label className="text-lg font-medium text-[#004581]">Email</label>
          <input
            type="email"
            className="w-full border-2 border-gray-100 rounded-xl p-4 mt-1 bg-transparent"
            placeholder="Email"
          />
        </div>
        <div className="mt-3">
          <label className="text-lg font-medium text-[#004581]">Password</label>
          <input
            type="password"
            className="w-full border-2 border-gray-100 rounded-xl p-4 mt-1 bg-transparent"
            placeholder="Password"
          />
        </div>
        <div className="mt-3">
          <label className="text-lg font-medium text-[#004581]">Confirm Password</label>
          <input
            type="password"
            className="w-full border-2 border-gray-100 rounded-xl p-4 mt-1 bg-transparent"
            placeholder="Confirm password"
          />
        </div>
        <div className="mt-6 flex flex-col gap-y-2">
          <button
            className="group active:scale-[.98] active:duration-75 hover:scale-[1.01] ease-in-out transition-all py-3 rounded-xl text-white text-lg font-bold"
            style={{ backgroundColor: "#018ABD" }}
            onMouseEnter={(e) => (e.target.style.backgroundColor = "#004581")}
            onMouseLeave={(e) => (e.target.style.backgroundColor = "#018ABD")}
          >
            Create Account
          </button>

          <button className="flex rounded-xl py-3 border-2 border-gray-100 items-center justify-center gap-2 active:scale-[.98] active:duration-75 hover:scale-[1.01] ease-in-out transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 533.5 544.3" width="24" height="24">
              <path fill="#4285F4" d="M533.5 278.4c0-17.9-1.6-35.1-4.6-51.8H272v97.9h146.9c-6.3 34.2-25.6 63.3-54.6 82.7v68.5h88.4c51.5-47.3 80.8-117.2 80.8-197.3z"/>
              <path fill="#34A853" d="M272 544.3c73.5 0 135-24.5 180-66.5l-88.4-68.5c-24.7 16.5-56.5 26.4-91.6 26.4-70.5 0-130.3-47.6-151.8-111.7H28.4v69.8c44.9 88.4 137.8 150.5 243.6 150.5z" />
              <path fill="#FBBC05" d="M120.2 320.1c-10.2-30.3-10.2-62.5 0-92.8V157.5H28.4c-44.9 88.4-44.9 193.2 0 281.6l91.8-69z"/>
              <path fill="#EA4335" d="M272 107.7c38.8-.6 75.6 13.5 103.8 39.3l77.8-77.8C411.8 24.5 351.3 0 272 0 165.2 0 72.4 62.1 28.4 150.5l91.8 69c21.5-64.1 81.3-111.7 151.8-111.8z"/>
            </svg>
            Sign up with Google
          </button>
        </div>
      </div>
    </div>
  );
}
