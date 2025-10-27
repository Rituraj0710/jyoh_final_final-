"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/EnhancedAuthContext';
import { getDashboardPath, getRoleDisplayName } from '@/utils/roleRedirect';

const EnhancedProtectedRoute = ({ 
  children, 
  allowedRoles = [], 
  redirectTo = '/admin/login',
  requireExactRole = true 
}) => {
  const [isAuthorized, setIsAuthorized] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { user, token, loading, isAuthenticated } = useAuth();

  useEffect(() => {
    const checkAuthorization = () => {
      // If auth context is still loading, wait
      if (loading) {
        return;
      }

      // If not authenticated, deny access
      if (!isAuthenticated || !user || !token) {
        console.log('EnhancedProtectedRoute: Not authenticated');
        setIsAuthorized(false);
        setIsLoading(false);
        return;
      }

      // If no allowed roles specified, allow any authenticated user
      if (allowedRoles.length === 0) {
        console.log('EnhancedProtectedRoute: No role restrictions, allowing access');
        setIsAuthorized(true);
        setIsLoading(false);
        return;
      }

      // Check if user's role is in allowed roles
      const userRole = user.role;
      const hasPermission = allowedRoles.includes(userRole);

      if (hasPermission) {
        console.log(`EnhancedProtectedRoute: User ${userRole} has permission to access this route`);
        setIsAuthorized(true);
      } else {
        console.log(`EnhancedProtectedRoute: User ${userRole} does not have permission. Allowed roles: ${allowedRoles.join(', ')}`);
        setIsAuthorized(false);
      }

      setIsLoading(false);
    };

    checkAuthorization();
  }, [user, token, loading, isAuthenticated, allowedRoles]);

  useEffect(() => {
    if (isAuthorized === false && !isLoading) {
      console.log('EnhancedProtectedRoute: Redirecting unauthorized user to:', redirectTo);
      router.push(redirectTo);
    }
  }, [isAuthorized, isLoading, router, redirectTo]);

  // Show loading spinner while checking authorization
  if (isLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verifying access permissions...</p>
        </div>
      </div>
    );
  }

  // Show access denied if not authorized
  if (isAuthorized === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded max-w-md">
            <h2 className="text-lg font-semibold mb-2">Access Denied</h2>
            <p className="mb-2">You don't have permission to access this page.</p>
            {user && (
              <p className="text-sm">
                Your role: <strong>{getRoleDisplayName(user.role)}</strong>
              </p>
            )}
            {allowedRoles.length > 0 && (
              <p className="text-sm">
                Required roles: <strong>{allowedRoles.map(getRoleDisplayName).join(', ')}</strong>
              </p>
            )}
            <button
              onClick={() => {
                const dashboardPath = user ? getDashboardPath(user.role) : '/admin/login';
                router.push(dashboardPath);
              }}
              className="mt-3 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Go to Your Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Render children if authorized
  return <>{children}</>;
};

export default EnhancedProtectedRoute;
