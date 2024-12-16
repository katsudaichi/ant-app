import React from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { UserMenu } from './UserMenu';

export function Layout() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated());
  const location = useLocation();
  const isProjectPage = location.pathname.includes('/projects/');

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className={`min-h-screen bg-gray-50 ${isProjectPage ? 'h-screen overflow-hidden' : ''}`}>
      {!isProjectPage && <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Relation Map</h1>
          <UserMenu />
        </div>
      </header>}
      <main className={isProjectPage ? 'h-full' : ''}>
        <div className={isProjectPage ? 'h-full' : 'max-w-7xl mx-auto py-6 sm:px-6 lg:px-8'}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}