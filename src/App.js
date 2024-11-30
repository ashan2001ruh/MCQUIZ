import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Form from './components/LoginPage/loginform';



function App() {
  const location = useLocation(); 

  return (
    <div>
      {/* Show Navbar only when NOT on the login page */}
      {location.pathname !== '/login' && <Navbar />}

      <Routes>
        {/* Login Page */}
        <Route
          path="/login"
          element={
            <div className="flex w-full h-screen">
              {/* Left side*/}
              <div className="w-full lg:w-1/2 flex justify-center items-center lg:block hidden">
                <img 
                  src="https://static.vecteezy.com/system/resources/previews/017/275/931/non_2x/two-step-security-concept-character-uses-two-step-verification-to-protect-personal-data-user-authorization-login-authentication-and-information-protection-flat-cartoon-illustration-vector.jpg"  
                  alt="Illustration of online registration and login on a smartphone app"
                  className="w-full h-full object-cover " 
                />
              </div>

              {/* Right side: Form */}
              <div className="w-full flex items-center justify-center lg:w-1/2 ">
                <div className="w-full max-w-none"><Form /></div>
              </div>
          </div>

          }
        />
      </Routes>
    </div>
  );
}

export default function AppWithRouter() {
  return (
    <Router>
      <App />
    </Router>
  );
}