import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

const UserGreeting = ({ username, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex items-center gap-4 relative" ref={menuRef}>
      <span className="font-medium text-[#004581] text-lg">Hi, {username}! 👋</span>

      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="flex items-center gap-2 text-[#004581] hover:text-[#018ABD] transition-all duration-300 font-medium px-2 py-1 rounded-full"
          aria-haspopup="menu"
          aria-expanded={isOpen}
          title="User menu"
        >
          <span className="text-2xl">👤</span>
          <svg
            className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : "rotate-0"}`}
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 011.06.02L10 11.06l3.71-3.83a.75.75 0 111.08 1.04l-4.25 4.4a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z"
              clipRule="evenodd"
            />
          </svg>
        </button>

        {isOpen && (
          <div
            role="menu"
            className="absolute right-0 mt-2 w-44 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50"
          >
            <div className="py-1">
              <Link
                to="/user-dashboard"
                onClick={() => setIsOpen(false)}
                className="block px-4 py-2 text-sm text-[#004581] hover:bg-[#DEE8F1] hover:text-[#018ABD]"
                role="menuitem"
              >
                Dashboard
              </Link>
              <button
                onClick={() => {
                  setIsOpen(false);
                  onLogout();
                }}
                className="w-full text-left block px-4 py-2 text-sm text-[#004581] hover:bg-[#DEE8F1] hover:text-[#018ABD]"
                role="menuitem"
              >
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserGreeting;
