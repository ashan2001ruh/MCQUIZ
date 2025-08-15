import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AiOutlineClose, AiOutlineMenu } from 'react-icons/ai';
import { motion } from 'framer-motion';
import UserGreeting from './UserGreeting';

const Navbar = ({ homeRef, featuresRef, pricingRef, aboutUsRef }) => {
  const [user, setUser] = useState(null);
  const [nav, setNav] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleNav = () => setNav(!nav);
  const handleLoginClick = () => navigate('/login');
  
  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('authToken');
    setUser(null);
    navigate('/login');
  };

  const scrollToSection = (ref) => {
    if (ref?.current) ref.current.scrollIntoView({ behavior: 'smooth' });
    setNav(false);
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
      className="flex items-center h-20 max-w-[1240px] mx-auto px-8 bg-transparent text-[#004581]"
      variants={navbarVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Logo */}
      <h1 className="text-2xl md:text-3xl font-sans font-bold text-[#004581]">MCQuiz</h1>

      {/* Desktop Navigation */}
      <div className="flex-1 flex justify-center">
        <ul className="hidden md:flex space-x-6 md:space-x-8 font-semibold text-lg md:text-base items-center">
          <li className="hover:text-[#018ABD] cursor-pointer" onClick={() => scrollToSection(homeRef)}>Home</li>
          <li className="hover:text-[#018ABD] cursor-pointer" onClick={() => scrollToSection(featuresRef)}>Features</li>
          <li className="hover:text-[#018ABD] cursor-pointer" onClick={() => scrollToSection(pricingRef)}>Pricing</li>
          <li className="hover:text-[#018ABD] cursor-pointer" onClick={() => scrollToSection(aboutUsRef)}>About Us</li>
        </ul>

        {/* Hamburger Menu */}
        <div onClick={handleNav} className="block md:hidden">
          {nav ? <AiOutlineClose size={20} /> : <AiOutlineMenu size={20} />}
        </div>


        {/* Mobile Menu Toggle */}
        <div onClick={handleNav} className="block md:hidden">
          {nav ? <AiOutlineClose size={20} /> : <AiOutlineMenu size={20} />}
        </div>
      </div>

      {/* User Actions (Right Side) */}
      <div className="hidden md:flex items-center justify-end flex-1 ml-4">
        {user ? (
          <UserGreeting 
            username={user.firstName} 
            onLogout={handleLogout}
          />
        ) : (
          <motion.button
            onClick={handleLoginClick}
            className="bg-[#018ABD] text-white font-semibold px-6 py-2 rounded-2xl text-sm hover:bg-[#005fa3] transition duration-200"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            LOG IN
          </motion.button>
        )}
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
        <li className="p-4 border-b border-blue-900 hover:bg-[#018ABD] hover:text-white transition duration-300 cursor-pointer" 
            onClick={() => scrollToSection(homeRef)}>Home</li>
        <li className="p-4 border-b border-blue-900 hover:bg-[#018ABD] hover:text-white transition duration-300 cursor-pointer" 
            onClick={() => scrollToSection(featuresRef)}>Features</li>
        <li className="p-4 border-b border-blue-900 hover:bg-[#018ABD] hover:text-white transition duration-300 cursor-pointer" 
            onClick={() => scrollToSection(pricingRef)}>Pricing</li>
        <li className="p-4 hover:bg-[#018ABD] hover:text-white transition duration-300 cursor-pointer" 
            onClick={() => scrollToSection(aboutUsRef)}>About Us</li>
      </motion.ul>
    </motion.div>
  );
};

export default Navbar;