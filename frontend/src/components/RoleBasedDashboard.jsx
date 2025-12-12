"use client";
import React from 'react';
import { useAuth } from '@/contexts/EnhancedAuthContext';
import { getDashboardPath, getRoleDisplayName } from '@/utils/roleRedirect';
import EnhancedProtectedRoute from './EnhancedProtectedRoute';

// Admin Dashboard Wrapper
export const AdminDashboardWrapper = ({ children }) => (
  <EnhancedProtectedRoute allowedRoles={['admin']}>
    {children}
  </EnhancedProtectedRoute>
);

// Staff1 Dashboard Wrapper
export const Staff1DashboardWrapper = ({ children }) => (
  <EnhancedProtectedRoute allowedRoles={['staff1', 'admin']}>
    {children}
  </EnhancedProtectedRoute>
);

// Staff2 Dashboard Wrapper
export const Staff2DashboardWrapper = ({ children }) => (
  <EnhancedProtectedRoute allowedRoles={['staff2', 'admin']}>
    {children}
  </EnhancedProtectedRoute>
);

// Staff3 Dashboard Wrapper
export const Staff3DashboardWrapper = ({ children }) => (
  <EnhancedProtectedRoute allowedRoles={['staff3', 'admin']}>
    {children}
  </EnhancedProtectedRoute>
);

// Staff4 Dashboard Wrapper
export const Staff4DashboardWrapper = ({ children }) => (
  <EnhancedProtectedRoute allowedRoles={['staff4', 'admin']}>
    {children}
  </EnhancedProtectedRoute>
);

// Generic Staff Dashboard Wrapper (any staff role)
export const StaffDashboardWrapper = ({ children }) => (
  <EnhancedProtectedRoute allowedRoles={['staff1', 'staff2', 'staff3', 'staff4', 'admin']}>
    {children}
  </EnhancedProtectedRoute>
);

// Role-based redirect component
export const RoleBasedRedirect = () => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Determining your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <h2 className="text-lg font-semibold mb-2">Not Authenticated</h2>
            <p>Please log in to access your dashboard.</p>
          </div>
        </div>
      </div>
    );
  }

  const dashboardPath = getDashboardPath(user.role);
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded">
          <h2 className="text-lg font-semibold mb-2">Redirecting...</h2>
          <p>Taking you to your {getRoleDisplayName(user.role)} dashboard.</p>
        </div>
      </div>
    </div>
  );
};
