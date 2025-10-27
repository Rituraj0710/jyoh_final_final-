"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
// Import role utilities
const getDashboardPath = (role) => {
  switch (role) {
    case 'admin':
      return '/admin/dashboard';
    case 'staff1':
      return '/staff1/dashboard';
    case 'staff2':
      return '/staff2/dashboard';
    case 'staff3':
      return '/staff3/dashboard';
    case 'staff4':
      return '/staff4/dashboard';
    case 'staff5':
      return '/staff5/dashboard';
    case 'user1':
      return '/user/dashboard';
    case 'user2':
      return '/agent'; // Redirect agents to agent home page
    default:
      return '/user/dashboard';
  }
};

const isValidRole = (role) => {
  const validRoles = ['admin', 'staff1', 'staff2', 'staff3', 'staff4', 'staff5', 'user1', 'user2'];
  return validRoles.includes(role);
};

const canAccessDashboard = (userRole, targetRole) => {
  if (userRole === 'admin') return true;
  if (userRole === targetRole) return true;
  return false;
};

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);
  const router = useRouter();

  // Validate user role
  const validateUserRole = (userData) => {
    if (!userData || !userData.role) {
      console.error('Invalid user data: missing role');
      return false;
    }

    if (!isValidRole(userData.role)) {
      console.error('Invalid user role:', userData.role);
      return false;
    }

    return true;
  };

  // Store user data securely
  const storeUserData = (userData, authToken) => {
    try {
      // Validate user data before storing
      if (!validateUserRole(userData)) {
        throw new Error('Invalid user data');
      }

      // Store in localStorage
      localStorage.setItem('access_token', authToken);
      localStorage.setItem('authToken', authToken);
      localStorage.setItem('is_auth', 'true');
      localStorage.setItem('user_id', userData.id);
      localStorage.setItem('user_name', userData.name);
      localStorage.setItem('user_email', userData.email);
      localStorage.setItem('user_role', userData.role);
      localStorage.setItem('role', userData.role);
      localStorage.setItem('user_department', userData.department || '');
      localStorage.setItem('user_employeeId', userData.employeeId || '');

      console.log('User data stored successfully:', {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        role: userData.role
      });

      return true;
    } catch (error) {
      console.error('Error storing user data:', error);
      return false;
    }
  };

  // Clear user data
  const clearUserData = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('authToken');
    localStorage.removeItem('is_auth');
    localStorage.removeItem('user_id');
    localStorage.removeItem('user_name');
    localStorage.removeItem('user_email');
    localStorage.removeItem('user_role');
    localStorage.removeItem('role');
    localStorage.removeItem('user_department');
    localStorage.removeItem('user_employeeId');
  };

  // Fetch user profile from API
  const fetchUserProfile = async (authToken) => {
    const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4001';
    
    const response = await fetch(`${API_BASE}/api/auth/profile`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user profile');
    }

    const data = await response.json();
    
    if (data.success && data.data) {
      const userData = data.data;
      
      if (validateUserRole(userData)) {
        setUser(userData);
        return userData;
      } else {
        throw new Error('Invalid user role received from server');
      }
    } else {
      throw new Error(data.message || 'Failed to fetch profile');
    }
  };

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const storedToken = localStorage.getItem('authToken') || localStorage.getItem('access_token');
        const isAuth = localStorage.getItem('is_auth');
        
        if (storedToken && isAuth === 'true') {
          setToken(storedToken);
          
          try {
            // Try to fetch fresh profile data
            await fetchUserProfile(storedToken);
          } catch (profileError) {
            console.log('Profile fetch failed, using stored user data:', profileError.message);
            
            // Fallback to stored user data
            const storedUser = {
              id: localStorage.getItem('user_id'),
              name: localStorage.getItem('user_name'),
              email: localStorage.getItem('user_email'),
              role: localStorage.getItem('user_role') || localStorage.getItem('role'),
              department: localStorage.getItem('user_department'),
              employeeId: localStorage.getItem('user_employeeId')
            };
            
            if (validateUserRole(storedUser)) {
              setUser(storedUser);
              console.log('Using stored user data:', storedUser);
            } else {
              console.error('Invalid stored user data, clearing...');
              clearUserData();
              setUser(null);
              setToken(null);
            }
          }
        } else {
          console.log('No valid authentication found');
          setUser(null);
          setToken(null);
        }
      } catch (error) {
        console.error('Auth check error:', error);
        clearUserData();
        setUser(null);
        setToken(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Login function with role validation
  const login = async (email, password) => {
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4001';
      
      const response = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (data.success && data.data) {
        const { token: authToken, user: userData } = data.data;
        
        // Validate user role
        if (!validateUserRole(userData)) {
          throw new Error('Invalid user role received from server');
        }

        // Store user data
        if (storeUserData(userData, authToken)) {
          setUser(userData);
          setToken(authToken);
          
          console.log(`Login successful for ${userData.role}, staying on current page`);
          
          return {
            success: true,
            user: userData,
            token: authToken,
            redirectPath: null // No auto-redirect, stay on current page
          };
        } else {
          throw new Error('Failed to store user data');
        }
      } else {
        throw new Error(data.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: error.message || 'Login failed'
      };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      // Call logout API if token exists
      if (token) {
        const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4001';
        
        try {
          await fetch(`${API_BASE}/api/auth/logout`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
        } catch (apiError) {
          console.log('Logout API call failed, but continuing with local logout:', apiError.message);
        }
      }
    } catch (error) {
      console.log('Logout error:', error);
    } finally {
      // Always clear local data
      clearUserData();
      setUser(null);
      setToken(null);
    }
  };

  // Check if user can access a specific role's dashboard
  const canAccessRole = (targetRole) => {
    if (!user || !user.role) return false;
    return canAccessDashboard(user.role, targetRole);
  };

  // Get auth headers for API calls
  const getAuthHeaders = () => {
    const authToken = token || localStorage.getItem('authToken') || localStorage.getItem('access_token');
    return {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json'
    };
  };

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    canAccessRole,
    getAuthHeaders,
    isAuthenticated: !!user && !!token
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
