import React from 'react';
import { motion } from 'framer-motion';
import aboutUsImage from '../Assets/aboutus.png'; // Replace with your image path
import { FaPhone, FaEnvelope, FaGlobe } from 'react-icons/fa'; // Import icons from react-icons

const AboutUs = () => {
  return (
    <div className="bg-[#DDE8F0] py-16 overflow-hidden"> {/* Outer background color */}
      <div className="max-w-[1240px] mx-auto px-6">
        {/* About Us Title */}
        <motion.h2
          className="text-4xl md:text-5xl font-bold text-center mb-2" 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <span className="text-[#004581]">About</span>{' '}
          <span className="text-[#018ABD]">Us</span>
        </motion.h2>

        {/* About Us Section */}
        <div className="flex flex-col md:flex-row items-center gap-6">
          {/* Left Side: Text */}
          <motion.div
            className="flex-1"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, ease: 'easeInOut' }}
          >
            <p className="text-lg text-[#004581] leading-relaxed tracking-wide"> {/* Increased line and letter spacing */}
              MCQuiz is an unrivalled, powerful and updated question bank of thousands of questions to help you ace your MCQ papers in Grade 5 Scholarship, O/L and A/L exams.
            </p>
          </motion.div>

          {/* Right Side: Image */}
          <motion.div
            className="hidden md:block flex-1 justify-end"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, ease: 'easeInOut' }}
          >
            <img
              src={aboutUsImage} // Replace with your image path
              alt="About Us Illustration"
              className="w-auto h-auto max-w-[500px] object-contain pt-0 ml-auto"
            />
          </motion.div>
        </div>

        {/* Footer Section */}
        <motion.div
          className="mt-8 bg-[#97CBDC] p-8 rounded-lg" // Reduced margin-top
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-16">
            {/* Contact Us */}
            <div>
              <h3 className="text-xl font-bold text-[#004581] mb-4">Contact us</h3>
              <div className="flex items-center gap-2 mb-3">
                <FaPhone className="text-[#004581]" /> {/* Phone icon */}
                <p className="text-lg text-[#004581]">+9477898898</p>
              </div>
              <div className="flex items-center gap-2 mb-3">
                <FaEnvelope className="text-[#004581]" /> {/* Email icon */}
                <p className="text-lg text-[#004581]">mcquiz@gmail.com</p>
              </div>
              <div className="flex items-center gap-2">
                <FaGlobe className="text-[#004581]" /> {/* Website icon */}
                <p className="text-lg text-[#004581]">www.mcquiz.com</p>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-xl font-bold text-[#004581] mb-4">Quick Links</h3>
              <ul className="text-lg text-[#004581]">
                <li className="mb-2"><a href="/">Home</a></li>
                <li className="mb-2"><a href="/features">Features</a></li>
                <li className="mb-2"><a href="/pricing">Pricing</a></li>
                <li className="mb-2"><a href="/about">About us</a></li>
                <li className="mb-2"><a href="/faq">FAQ</a></li>
                <li className="mb-2"><a href="/privacy-policy">Privacy Policy</a></li>
                <li className="mb-2"><a href="/terms-of-use">Terms of Use</a></li>
              </ul>
            </div>

            {/* Members */}
            <div>
              <h3 className="text-xl font-bold text-[#004581] mb-4">Members</h3>
              <ul className="text-lg text-[#004581]">
                <li className="mb-2"><a href="/my-account">My Account</a></li>
                <li className="mb-2"><a href="/subscription">Subscription</a></li>
              </ul>
            </div>

            {/* Information */}
            <div>
              <h3 className="text-xl font-bold text-[#004581] mb-4">Information</h3>
              <ul className="text-lg text-[#004581]">
                <li className="mb-2"><a href="/privacy-policy">Privacy Policy</a></li>
                <li className="mb-2"><a href="/terms-of-use">Terms of Use</a></li>
              </ul>
            </div>
          </div>
          <hr className="my-6 border-[#666]" /> {/* Added horizontal line */}

                {/* Copyright Text */}
            <div className="text-center text-[#666]">
            <p>&copy; {new Date().getFullYear()} MCQuiz. All rights reserved.</p>
            </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AboutUs;