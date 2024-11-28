import React from 'react'

const navbar = () => {
  return (
    <div className="flex justify-between items-center h-20 max-w-[1240px] mx-auto px-8 text-[#004581]">
      {/* Logo */}
      <h1 className="text-2xl md:text-3xl flex space-x-6 md:space-x-8 font=sans font-bold text-[#004581]">MCQuiz</h1>
      <div className="flex items-center space-x-6 md:space-x-8">
      {/* Navigation Menu */}
      <ul className="flex space-x-6 md:space-x-8 font-semibold text-lg md:text-base">
        <li className="hover:text-[#018ABD] cursor-pointer">Home</li>
        <li className="hover:text-[#018ABD] cursor-pointer">Features</li>
        <li className="hover:text-[#018ABD] cursor-pointer">Pricing</li>
        <li className="hover:text-[#018ABD] cursor-pointer">About Us</li>
      </ul>

      {/* Login Button */}
      <button className="hidden md:block bg-[#018ABD] text-white font-semibold px-6 py-2 rounded-2xl text-sm hover:bg-[#005fa3] transition duration-200">
        LOG IN
      </button>
      </div>
    </div>
  )
}

export default navbar
