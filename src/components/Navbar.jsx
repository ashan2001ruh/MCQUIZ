import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AiOutlineClose, AiOutlineMenu } from 'react-icons/ai';
import { motion } from 'framer-motion';

const Navbar = () => {
  const [nav, setNav] = useState(false);
  const navigate = useNavigate(); // Initialize the navigate function

  const handleNav = () => {
    setNav(!nav);
  };

  const handleLoginClick = () => {
    navigate('/login'); // Navigate to the /login page
  };

  // Animation variants
  const navbarVariants = {
    hidden: { y: -50, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.8, ease: 'easeInOut' } },
  };

  const mobileMenuVariants = {
    hidden: { x: '-100%' },
    visible: { x: 0, transition: { duration: 0.5, ease: 'easeInOut' } },
  };

  return (
    <motion.div
      className="flex justify-between items-center h-20 max-w-[1240px] mx-auto px-8 bg-transparent text-[#004581]"
      variants={navbarVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Logo */}
      <h1 className="text-2xl md:text-3xl font-sans font-bold text-[#004581]">MCQuiz</h1>

      <div className="flex items-center space-x-6 md:space-x-8">
        {/* Navigation Menu */}
        <ul className="hidden md:flex space-x-6 md:space-x-8 font-semibold text-lg md:text-base">
          <li className="hover:text-[#018ABD] cursor-pointer">Home</li>
          <li className="hover:text-[#018ABD] cursor-pointer">Features</li>
          <li className="hover:text-[#018ABD] cursor-pointer">Pricing</li>
          <li className="hover:text-[#018ABD] cursor-pointer">About Us</li>
        </ul>

        {/* Hamburger Menu */}
        <div onClick={handleNav} className="block md:hidden">
          {nav ? <AiOutlineClose size={20} /> : <AiOutlineMenu size={20} />}
        </div>

        {/* Mobile Menu */}
        <motion.ul
          className={`fixed top-0 left-0 w-[50%] h-full border-r border-blue-900 bg-[#DDE8F0] flex flex-col py-4 px-4 transform ${
            nav ? '' : 'hidden'
          }`}
          variants={mobileMenuVariants}
          initial="hidden"
          animate={nav ? 'visible' : 'hidden'}
        >
          <h1 className="w-full text-3xl font-bold text-[#004581] m-4">MCQuiz</h1>
          <li className="p-4 border-b border-blue-900">Home</li>
          <li className="p-4 border-b border-blue-900">Features</li>
          <li className="p-4 border-b border-blue-900">Pricing</li>
          <li className="p-4">About Us</li>
        </motion.ul>
      </div>

      {/* Login Button */}
      <motion.button
        onClick={handleLoginClick}
        className="hidden md:block bg-[#018ABD] text-white font-semibold px-6 py-2 rounded-2xl text-sm hover:bg-[#005fa3] transition duration-200"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.5 }}
      >
        LOG IN
      </motion.button>
    </motion.div>
  );
};

export default Navbar;
