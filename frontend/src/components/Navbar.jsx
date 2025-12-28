import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <nav className="bg-[#0B1F4B] text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
            
            {/* Left section */}
            <div className="flex items-center space-x-8">
            <Link
                to="/"
                className="text-2xl font-bold tracking-wide hover:text-[#4FC3F7] transition"
            >
                GeTime
            </Link>

            {token && (
                <div className="flex space-x-2">
                <Link
                    to="/campuses"
                    className="
                    px-3 py-2 rounded-md font-medium
                    hover:bg-[#4FC3F7]/20
                    hover:text-[#4FC3F7]
                    transition
                    "
                >
                    Campuses
                </Link>

                <Link
                    to="/teachers"
                    className="
                    px-3 py-2 rounded-md font-medium
                    hover:bg-[#4FC3F7]/20
                    hover:text-[#4FC3F7]
                    transition
                    "
                >
                    Teachers
                </Link>
                </div>
            )}
            </div>

            {/* Right section */}
            {token && (
            <button
                onClick={handleLogout}
                className="
                bg-[#D50032]
                px-4
                py-2
                rounded-md
                font-medium
                transition
                hover:bg-[#B00028]
                "
            >
                Logout
            </button>
            )}
        </div>
    </nav>

  );
}
