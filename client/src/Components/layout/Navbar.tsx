import React, { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { FaRegHeart, FaUserCircle } from "react-icons/fa";
import {toast} from 'sonner'
import useAuthStore from "../../Store/authStore"; 
import Button from "../ui/Button";

export default function Navbar() {
  const navigate = useNavigate();

  // Pull state & actions from Zustand store
  const isAuthenticated = useAuthStore((state : any) => state.isAuthenticated);
  const logout = useAuthStore((state: any) => state.logout);
  const roles = useAuthStore((state: any) => state.roles);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  const isAdmin = roles?.includes("admin");

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showProfileDropdown && !(event.target as HTMLElement).closest(".profile-dropdown")) {
        setShowProfileDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showProfileDropdown]);

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    navigate("/");
  };

  return (
    <header className="shadow sticky top-0 z-50 bg-white">
      <nav className="border-gray-200 px-6 py-3">
        <div className="flex justify-between items-center mx-auto max-w-screen-xl">
          {/* Text Logo */}
          <Link to="/" className="text-2xl font-semibold text-orange-700 hover:text-orange-800">
            RMS
          </Link>

          {/* Right Side Icons */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
               
                <div className="relative profile-dropdown">
                  <button
                    onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                    className="flex items-center text-lg hover:text-orange-700"
                  >
                    <FaUserCircle />
                  </button>
                  {showProfileDropdown && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 border border-gray-100 z-50">
                      <Link
                        to="/profile"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setShowProfileDropdown(false)}
                      >
                        View Profile
                      </Link>
                      {isAdmin && (
                        <Link
                          to="/admin"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setShowProfileDropdown(false)}
                        >
                          Admin Dashboard
                        </Link>
                      )}
                      <button
                        onClick={() => {
                          handleLogout();
                          setShowProfileDropdown(false);
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <Button
                        onClick={() => {
                          navigate('/login');
                        }}
                        size="sm"
                        variant="outline"
                        type="button"
                      >
                        Login
                      </Button>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}
