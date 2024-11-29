import React from 'react'
import {AiOutlineClose, AiOutlineMenu} from 'react-icons/ai'

const Navbar = () => {
  const [nav, setNav] = React.useState(false)

  const handleNav = () => {
    setNav(!nav)
  }

  return (
    <div className="flex justify-between items-center h-20 max-w-[1240px] mx-auto px-8 text-[#004581]">
      {/* Logo */}
      <h1 className="text-2xl md:text-3xl flex space-x-6 md:space-x-8 font=sans font-bold text-[#004581]">MCQuiz</h1>
      <div className="flex items-center space-x-6 md:space-x-8">
      {/* Navigation Menu */}
      <ul className="hidden md:flex space-x-6 md:space-x-8 font-semibold text-lg md:text-base">
        <li className="hover:text-[#018ABD] cursor-pointer">Home</li>
        <li className="hover:text-[#018ABD] cursor-pointer">Features</li>
        <li className="hover:text-[#018ABD] cursor-pointer">Pricing</li>
        <li className="hover:text-[#018ABD] cursor-pointer">About Us</li>
      </ul>
      <div onClick={handleNav} className='block md:hidden cursor-pointer z-50'>
          {!nav ? <AiOutlineMenu size={20}/> : <AiOutlineClose size={20} />}
      </div>
      <div className={`fixed left-0 top-0 w-[60%] h-full border-r border-blue-900 bg-[#DDE8F0]/50 backdrop-blur-lg ease-in-out duration-500 transform ${
          nav ? 'left-0' : '-left-[100%]'
        }`}>
      <h1 className="w-full text-3xl font-bold text-[#004581] m-4">MCQuiz</h1>

        <ul className=' font-semibold p-4'>
          <li className='p-4 border-b border-blue-900 '>Home</li>
          <li className='p-4 border-b border-blue-900 '>Features</li>
          <li className='p-4 border-b border-blue-900 '>Pricing</li>
          <li className='p-4'>About Us</li>
        </ul>
      </div>

      </div>
      
    </div>
  );
};

export default Navbar
