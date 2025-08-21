import React, { useRef } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Features from './components/Features';
import Pricing from './components/Pricing';
import Aboutus from './components/Aboutus';
import Dashboard from './components/Dashboard';
import Courses from './components/Courses';
import SubjectQuizzes from './components/SubjectQuizzes';
import QuizAttempts from './components/QuizAttempts';
import UserDashboard from './components/UserDashboard'
import QuizHistory from './components/QuizHistory'
import FeedbackStats from './components/FeedbackStats';

import Form from './components/LoginPage/loginform';
import Signup from './components/SignupPage/signupform';
import imageA from './Assets/ImageA.png';
import imageD from './Assets/ImageD.png';
import imageC from './Assets/ImageC.png';
import OAuthCallback from './components/LoginPage/OAuthCallback';

function App() {
  const homeRef = useRef(null);
  const featuresRef = useRef(null);
  const pricingRef = useRef(null);
  const aboutUsRef = useRef(null);

  return (
    <div>
      <Routes>
        {/* Home Page Route */}
        <Route
          path="/"
          element={
            <>
              <Navbar
                homeRef={homeRef}
                featuresRef={featuresRef}
                pricingRef={pricingRef}
                aboutUsRef={aboutUsRef}
              />
              <div ref={homeRef}>
                <Hero />
              </div>
              <div ref={featuresRef}>
                <Features />
              </div>
              <div ref={pricingRef}>
                <Pricing />
              </div>
              <FeedbackStats />
              <div ref={aboutUsRef}>
                <Aboutus
                  homeRef={homeRef}
                  featuresRef={featuresRef}
                  pricingRef={pricingRef}
                  aboutUsRef={aboutUsRef}
                />
              </div>
            </>
          }
        />
        {/* Admin Dashboard */}
        <Route path="/dashboard" element={<Dashboard />} />
        
        {/* User Dashboard */}
        <Route path="/user-dashboard" element={<UserDashboard />} />
        
        {/* Quiz History */}
        <Route path="/quiz-history" element={<QuizHistory />} />
        
        
        {/* Courses Route */}
        <Route path="/courses" element={<Courses />} />

        <Route path="/subject/:subjectId/quizzes" element={<SubjectQuizzes />} />

        <Route path="/quizzes/:quizId/attempt" element={<QuizAttempts />} />

        
        
        {/* Login Route */}
        <Route
          path="/login"
          element={
            <div className="flex w-full h-screen">
              <div className="w-full lg:w-1/2 flex justify-center items-center lg:block hidden">
                <img
                  src="https://static.vecteezy.com/system/resources/previews/017/275/931/non_2x/two-step-security-concept-character-uses-two-step-verification-to-protect-personal-data-user-authorization-login-authentication-and-information-protection-flat-cartoon-illustration-vector.jpg"
                  alt="Illustration of online registration and login on a smartphone app"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="w-full flex items-center justify-center lg:w-1/2">
                <div className="w-full max-w-none">
                  <Form />
                </div>
              </div>
            </div>
          }
        />
        
        {/* OAuth Callback Route */}
        <Route path="/oauth/callback" element={<OAuthCallback />} />
        
        {/* Signup Route */}
        <Route
          path="/signup"
          element={
            <div className="flex w-full h-screen">
              <div className="hidden lg:flex w-1/2 items-center justify-center">
                <div className="relative w-full h-full">
                  <div className="absolute inset-0">
                    <div className="h-full w-full overflow-hidden">
                      <div className="w-full h-full animate-slider">
                        <img
                          src={imageC}
                          alt="Slideshow 1"
                          className="w-full h-full object-cover flex-shrink-0"
                        />
                        <img
                          src={imageD}
                          alt="Slideshow 2"
                          className="w-full h-full object-cover flex-shrink-0"
                        />
                        <img
                          src={imageA}
                          alt="Slideshow 3"
                          className="w-full h-full object-cover flex-shrink-0"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="w-full lg:w-1/2 flex items-stretch">
                <div className="w-full max-w-none">
                  <Signup />
                </div>
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