import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Typewriter } from 'react-simple-typewriter';
import onlineTestImage from '../Assets/Online test-amico.png';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

const Hero = () => {
  const navigate = useNavigate(); // Initialize the navigate function
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleRegisterClick = () => {
    navigate('/signup'); // Navigate to the /signup route
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/'); // Redirect to home page
  };

  return (
    <div className="text-[#004581] py-16">
      <div className="max-w-[1240px] mx-auto flex flex-col md:flex-row items-center px-6 gap-8">
        {/* Left Section: Text */}
        <motion.div
          className="text-left flex-1"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, ease: 'easeInOut' }}
        >
          {/* Headline */}
          <motion.h1
            className="text-4xl md:text-6xl font-bold leading-relaxed"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Ace Your Exams with Adaptive MCQ Practice
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            className="mt-4 text-lg md:text-xl leading-relaxed"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Achieve top results with custom MCQs, real-time progress tracking,
            and tailored study plans for Sri Lanka’s most important exams such as,
          </motion.p>

          {/* Animated Text */}
          <motion.div
            className="text-[#018ABD] font-semibold text-xl md:text-2xl mt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <Typewriter
              words={['O/Ls', 'A/Ls', 'Grade 5 Scholarships']}
              loop={5}
              cursor
              cursorStyle="|"
              typeSpeed={100}
              deleteSpeed={70}
              delaySpeed={1000}
            />
          </motion.div>

          {/* Button */}
          {!user ? (
            <motion.button
              className="bg-[#018ABD] text-white font-semibold py-3 px-6 mt-6 rounded-full hover:bg-[#004581] transition duration-300"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              onClick={handleRegisterClick}
            >
              REGISTER
            </motion.button>
          ) : (
            <motion.button
              className="bg-[#018ABD] text-white font-semibold py-3 px-6 mt-6 rounded-full hover:bg-[#004581] transition duration-300"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              onClick={handleLogout}
            >
              LOGOUT
            </motion.button>
          )}
        </motion.div>

        {/* Right Section: Image */}
        <motion.div
          className="hidden md:block flex-1 flex justify-end"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, ease: 'easeInOut' }}
        >
          <img
            src={onlineTestImage}
            alt="Illustration"
            className="w-auto h-auto max-w-[500px] object-contain pt-0 ml-auto"
          />
        </motion.div>
      </div>
    </div>
  );
};

export default Hero;