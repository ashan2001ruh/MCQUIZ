import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AiOutlineClose, AiOutlineMenu } from 'react-icons/ai';
import { motion } from 'framer-motion';


const Navbar = ({ homeRef, featuresRef, pricingRef, aboutUsRef }) => {
  const [user, setUser] = useState(null);
  const [nav, setNav] = useState(false);
  const navigate = useNavigate(); // Initialize the navigate function

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleNav = () => {
    setNav(!nav);
  };

  const handleLoginClick = () => {
    navigate('/login'); // Navigate to the /login page
  };

  const scrollToSection = (ref) => {
    if (ref && ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth' });
    }
    setNav(false); // Close the mobile menu after clicking a link
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

      <div className="flex-1 flex justify-center">
        {/* Navigation Menu */}
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
          <li className="p-4 border-b border-blue-900 hover:bg-[#018ABD] hover:text-white transition duration-300 cursor-pointer" onClick={() => scrollToSection(homeRef)}>Home</li>
          <li className="p-4 border-b border-blue-900 hover:bg-[#018ABD] hover:text-white transition duration-300 cursor-pointer" onClick={() => scrollToSection(featuresRef)}>Features</li>
          <li className="p-4 border-b border-blue-900 hover:bg-[#018ABD] hover:text-white transition duration-300 cursor-pointer" onClick={() => scrollToSection(pricingRef)}>Pricing</li>
          <li className="p-4 hover:bg-[#018ABD] hover:text-white transition duration-300 cursor-pointer" onClick={() => scrollToSection(aboutUsRef)}>About Us</li>
        </motion.ul>
      </div>

      {/* Hi FirstName on the right */}
      {user && user.firstName && (
        <div className="hidden md:flex items-center font-semibold text-[#004581] text-base ml-4">
          Hi {user.firstName}!
        </div>
      )}
    </motion.div>
  );
};

export default Navbar;
