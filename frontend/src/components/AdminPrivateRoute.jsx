"use client"
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const AdminPrivateRoute = ({ children, allowedRoles = ['admin'], redirectTo = '/admin/login' }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = () => {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
        const role = typeof window !== 'undefined' ? localStorage.getItem('role') : null;
        const isAuth = typeof window !== 'undefined' ? localStorage.getItem('is_auth') : null;

        console.log('AdminPrivateRoute - Auth check:', { 
          token: token ? token.substring(0, 20) + '...' : null, 
          role, 
          isAuth,
          allowedRoles,
          allLocalStorage: typeof window !== 'undefined' ? {
            access_token: localStorage.getItem('access_token') ? 'exists' : 'missing',
            role: localStorage.getItem('role'),
            is_auth: localStorage.getItem('is_auth'),
            user_id: localStorage.getItem('user_id'),
            user_email: localStorage.getItem('user_email'),
            user_name: localStorage.getItem('user_name'),
            user_role: localStorage.getItem('user_role')
          } : 'server-side'
        });

        if (!token || !isAuth || isAuth !== 'true') {
          console.log('AdminPrivateRoute - Not authenticated, redirecting to login');
          console.log('AdminPrivateRoute - Missing:', { token: !token, isAuth: !isAuth, isAuthValue: isAuth });
          setIsAuthenticated(false);
          setIsLoading(false);
          return;
        }

        if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
          console.log('AdminPrivateRoute - Role not allowed:', role, 'allowed:', allowedRoles);
          
          // Block ALL staff users from admin panel - redirect to their dashboard
          const staffRoles = ['staff1', 'staff2', 'staff3', 'staff4', 'staff5'];
          if (staffRoles.includes(role)) {
            console.log('AdminPrivateRoute - BLOCKING staff access to admin panel, redirecting to staff dashboard');
            router.push('/staff1/dashboard');
            return;
          }
          
          setIsAuthenticated(false);
          setIsLoading(false);
          router.push(redirectTo);
          return;
        }

        console.log('AdminPrivateRoute - Authenticated successfully with role:', role);
        setIsAuthenticated(true);
        setIsLoading(false);
      } catch (error) {
        console.error('AdminPrivateRoute - Auth check error:', error);
        setIsAuthenticated(false);
        setIsLoading(false);
      }
    };

    checkAuth();
    const onStorage = (e) => {
      if (e.key === 'is_auth' || e.key === 'access_token' || e.key === 'role') {
        console.log('AdminPrivateRoute - Storage change detected:', e.key);
        checkAuth();
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [allowedRoles, router, redirectTo]);

  useEffect(() => {
    if (isAuthenticated === false && !isLoading) {
      console.log('AdminPrivateRoute - Redirecting to login page');
      router.push(redirectTo);
    }
  }, [isAuthenticated, isLoading, router, redirectTo]);

  if (isLoading || isAuthenticated === null) return null;
  if (!isAuthenticated) return null;
  return children;
};

export default AdminPrivateRoute;


