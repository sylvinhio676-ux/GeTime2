import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/useAuth";

export default function Navbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      navigate("/");
    }
  };

  return (
    <nav className="bg-primary text-primary-foreground shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        {/* Left section */}
        <div className="flex items-center space-x-8">
          <Link
            to="/"
            className="text-2xl font-bold tracking-wide hover:text-primary/70 transition"
          >
            GeTime
          </Link>

          {user && (
            <div className="flex space-x-2">
              <Link
                to="/campuses"
                className="
                  px-3 py-2 rounded-md font-medium
                  hover:bg-primary/20
                  hover:text-primary/70
                  transition
                "
              >
                Campuses
              </Link>

              <Link
                to="/teachers"
                className="
                  px-3 py-2 rounded-md font-medium
                  hover:bg-primary/20
                  hover:text-primary/70
                  transition
                "
              >
                Teachers
              </Link>
            </div>
          )}
        </div>

        {/* Right section */}
        {user && (
          <button
            onClick={handleLogout}
            className="
              bg-destructive
              px-4
              py-2
              rounded-md
              font-medium
              transition
              hover:bg-destructive/90
            "
          >
            Logout
          </button>
        )}
      </div>
    </nav>
  );
}
