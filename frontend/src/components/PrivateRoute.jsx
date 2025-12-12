"use client"
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Loading from './Loading';

const PrivateRoute = ({ children, allowedRoles = [], redirectTo = '/user/login' }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = () => {
      try {
        const token = localStorage.getItem('access_token');
        const role = localStorage.getItem('role');
        const isAuth = localStorage.getItem('is_auth');

        if (!token || !isAuth || isAuth !== 'true') {
          setIsAuthenticated(false);
          setIsLoading(false);
          return;
        }

                // Check if role is allowed
        if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
          // Redirect to appropriate login based on role
          if (['staff1', 'staff2', 'staff3', 'staff4', 'admin'].includes(role)) {
            router.push('/staff/login');
          } else if (role === 'user1') {
            router.push('/user/login');
          } else if (role === 'user2') {
            router.push('/agent/login');
          } else {
            router.push('/user/login');
          }
          setIsLoading(false);
          return;
        }

        setIsAuthenticated(true);
        setUserRole(role);
        setIsLoading(false);
      } catch (error) {
        console.error('Auth check error:', error);
        setIsAuthenticated(false);
        setIsLoading(false);
      }
    };

    checkAuth();

    // Listen for storage changes (logout from another tab)
    const handleStorageChange = (e) => {
      if (e.key === 'is_auth' || e.key === 'access_token' || e.key === 'role') {
        checkAuth();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [allowedRoles, router]);

  useEffect(() => {
    if (isAuthenticated === false && !isLoading) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, isLoading, router, redirectTo]);

  if (isLoading || isAuthenticated === null) {
    return <Loading />;
  }

  if (!isAuthenticated) {
    return null; // Will redirect
  }

  return children;
};

export default PrivateRoute;
