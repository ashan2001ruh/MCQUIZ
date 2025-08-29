import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AiOutlineMenu, AiOutlineClose } from "react-icons/ai";
import { motion, AnimatePresence } from "framer-motion";
import UserGreeting from "./UserGreeting";

const Navbar = ({ homeRef, featuresRef, pricingRef, aboutUsRef }) => {
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("authToken");
    setUser(null);
    navigate("/login");
  };

  const handleLoginClick = () => navigate("/login");

  const scrollToSection = (ref) => {
    if (ref?.current) ref.current.scrollIntoView({ behavior: "smooth" });
    setMenuOpen(false);
  };

  return (
    <div className="w-full bg-transparent text-[#004581] relative z-50">
      <div className="max-w-[1240px] mx-auto flex justify-between items-center px-6 md:px-6 py-7">
        
        {/* Left: Logo + Brand + Nav */}
        <div className="flex items-center">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-[#014482] to-[#018ABD] rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-3xl text-white font-bold">Q</span>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-[#014482] to-[red] bg-clip-text text-transparent leading-none">
              MCQuiz
            </h1>
          </div>

          {/* Desktop Nav - Added margin-left for spacing */}
          <ul className="hidden md:flex space-x-6 font-medium text-base ml-12">
            <li className="hover:text-[#018ABD] cursor-pointer" onClick={() => scrollToSection(homeRef)}>Home</li>
            <li className="hover:text-[#018ABD] cursor-pointer" onClick={() => scrollToSection(featuresRef)}>Features</li>
            <li className="hover:text-[#018ABD] cursor-pointer" onClick={() => scrollToSection(pricingRef)}>Pricing</li>
            <li className="hover:text-[#018ABD] cursor-pointer" onClick={() => scrollToSection(aboutUsRef)}>About Us</li>
          </ul>
        </div>

        {/* Right: Greeting / Login */}
        <div className="hidden md:flex items-center">
          {user ? (
            <UserGreeting username={user.firstName} onLogout={handleLogout} />
          ) : (
            <button
              onClick={handleLoginClick}
              className="bg-[#018ABD] text-white font-medium px-5 py-2 rounded-xl text-sm hover:bg-[#005fa3] transition"
            >
              LOG IN
            </button>
          )}
        </div>

        {/* Mobile Hamburger */}
        <div className="md:hidden absolute top-6 right-6">
          <button onClick={() => setMenuOpen((prev) => !prev)} className="text-2xl">
            {menuOpen ? <AiOutlineClose /> : <AiOutlineMenu />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-16 right-4 w-64 bg-white shadow-lg rounded-xl border border-gray-200 p-4 flex flex-col space-y-3"
          >
            {user ? (
              <div className="border-b pb-2 mb-2">
                <p className="font-medium text-[#004581] mb-2">
                  Hi, {user.firstName}! 👋
                </p>
                <div className="flex flex-col space-y-2">
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      navigate("/user-dashboard");
                    }}
                    className="text-left px-3 py-2 rounded-lg hover:bg-[#f1f5f9] text-sm font-medium text-[#004581]"
                  >
                    Dashboard
                  </button>
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      handleLogout();
                    }}
                    className="text-left px-3 py-2 rounded-lg hover:bg-[#f1f5f9] text-sm font-medium text-[#004581]"
                  >
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={handleLoginClick}
                className="bg-[#018ABD] text-white font-semibold px-4 py-2 rounded-lg hover:bg-[#005fa3] transition"
              >
                LOG IN
              </button>
            )}

            {/* Nav links */}
            <ul className="flex flex-col space-y-2 text-sm font-medium">
              <li className="hover:text-[#018ABD] cursor-pointer" onClick={() => scrollToSection(homeRef)}>Home</li>
              <li className="hover:text-[#018ABD] cursor-pointer" onClick={() => scrollToSection(featuresRef)}>Features</li>
              <li className="hover:text-[#018ABD] cursor-pointer" onClick={() => scrollToSection(pricingRef)}>Pricing</li>
              <li className="hover:text-[#018ABD] cursor-pointer" onClick={() => scrollToSection(aboutUsRef)}>About Us</li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Navbar;