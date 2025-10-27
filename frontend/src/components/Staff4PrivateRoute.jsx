"use client"
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

const Staff4PrivateRoute = ({ children, redirectTo = '/admin/login' }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { user, token, loading } = useAuth();

  useEffect(() => {
    const checkAuth = () => {
      try {
        console.log('Staff4PrivateRoute - Auth check:', { 
          user, 
          token: token ? 'exists' : 'missing', 
          loading,
          userRole: user?.role 
        });

        // If auth context is still loading, wait
        if (loading) {
          console.log('Staff4PrivateRoute - Auth context still loading...');
          return;
        }

        // Fallback: Check localStorage directly if AuthContext fails
        if (!token || !user) {
          console.log('Staff4PrivateRoute - No user/token from context, checking localStorage...');
          
          const storedToken = localStorage.getItem('access_token') || localStorage.getItem('authToken');
          const storedRole = localStorage.getItem('role') || localStorage.getItem('user_role');
          const isAuth = localStorage.getItem('is_auth');
          
          console.log('Staff4PrivateRoute - localStorage check:', {
            hasToken: !!storedToken,
            role: storedRole,
            isAuth
          });
          
          if (!storedToken || isAuth !== 'true') {
            console.log('Staff4PrivateRoute - Not authenticated, redirecting to login');
            setIsAuthenticated(false);
            setIsLoading(false);
            return;
          }
          
          // Check role from localStorage - Staff4 specific
          if (storedRole !== 'staff4') {
            console.log('Staff4PrivateRoute - Access denied, localStorage role:', storedRole);
            setIsAuthenticated(false);
            setIsLoading(false);
            return;
          }
          
          console.log('Staff4PrivateRoute - Authentication successful via localStorage');
          setIsAuthenticated(true);
          setIsLoading(false);
          return;
        }

        // Check if user has staff4 role specifically
        if (user.role !== 'staff4') {
          console.log('Staff4PrivateRoute - Access denied, user role:', user.role);
          setIsAuthenticated(false);
          setIsLoading(false);
          return;
        }

        console.log('Staff4PrivateRoute - Authentication successful for', user.role);
        setIsAuthenticated(true);
        setIsLoading(false);
      } catch (error) {
        console.error('Staff4PrivateRoute - Auth check error:', error);
        setIsAuthenticated(false);
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [user, token, loading]);

  useEffect(() => {
    if (isAuthenticated === false && !isLoading) {
      console.log('Staff4PrivateRoute - Redirecting to:', redirectTo);
      router.push(redirectTo);
    }
  }, [isAuthenticated, isLoading, router, redirectTo]);

  // Show loading spinner while checking authentication
  if (isLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verifying Staff4 access...</p>
        </div>
      </div>
    );
  }

  // Show access denied if not authenticated
  if (isAuthenticated === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <h2 className="text-lg font-semibold mb-2">Access Denied</h2>
            <p>You don't have permission to access this page.</p>
            <p className="text-sm mt-2">Staff4 access required.</p>
          </div>
        </div>
      </div>
    );
  }

  // Render children if authenticated
  return <>{children}</>;
};

export default Staff4PrivateRoute;
