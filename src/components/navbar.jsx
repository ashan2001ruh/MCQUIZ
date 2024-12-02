import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'; 
import {AiOutlineClose, AiOutlineMenu} from 'react-icons/ai'

const Navbar = () => {
  const [nav, setNav] = useState(false);
  const navigate = useNavigate();// Initialize the navigate function
  const handleNav = () => {
    setNav(!nav);
  }
  const handleLoginClick = () => {
    navigate('/login'); // Navigate to the /login page
  };




  return (
    <div className="flex justify-between items-center h-20 max-w-[1240px] mx-auto px-8 text-[#004581]">
      {/* Logo */}
      <h1 className="text-2xl md:text-3xl flex space-x-6 md:space-x-8 font-sans font-bold text-[#004581]">MCQuiz</h1>
      <div className="flex items-center space-x-6 md:space-x-8">
      {/* Navigation Menu */}
      <ul className="hidden md:flex space-x-6 md:space-x-8 font-semibold text-lg md:text-base">
        <li className="hover:text-[#018ABD] cursor-pointer">Home</li>
        <li className="hover:text-[#018ABD] cursor-pointer">Features</li>
        <li className="hover:text-[#018ABD] cursor-pointer">Pricing</li>
        <li className="hover:text-[#018ABD] cursor-pointer">About Us</li>
      </ul>


      <div onClick={handleNav} className='block md:hidden'>
          {nav ? <AiOutlineClose size={20}/> : <AiOutlineMenu size={20} />}
      </div>
      <ul className={nav ? 'fixed left-0 top-0 w-[50%] h-full border-r  border-blue-900 bg-[#DDE8F0]/50 backdrop-blur-lg ease-in-out duration-500 ' : 'ease-in-out duration-500 fixed left-[-100%]'}>
        
      <h1 className="w-full text-3xl font-bold text-[#004581] m-4">MCQuiz</h1>

        
          <li className='p-4 border-b border-blue-900 '>Home</li>
          <li className='p-4 border-b border-blue-900 '>Features</li>
          <li className='p-4 border-b border-blue-900 '>Pricing</li>
          <li className='p-4'>About Us</li>
        </ul>
      </div>



      {/* Login Button */}
      <button  onClick={handleLoginClick} className="hidden md:block bg-[#018ABD] text-white font-semibold px-6 py-2 rounded-2xl text-sm hover:bg-[#005fa3] transition duration-200">
        LOG IN
      </button>

      </div>

      
    </div>
  );
};

export default Navbar
