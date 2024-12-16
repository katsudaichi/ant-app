import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, User } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export function UserMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 focus:outline-none"
      >
        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
          <User className="w-5 h-5 text-indigo-600" />
        </div>
        <span className="hidden md:inline-block font-medium">{user?.name}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
          <div className="py-1">
            <button
              onClick={handleLogout}
              className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}