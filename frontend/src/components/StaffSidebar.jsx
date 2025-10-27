"use client"
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLogoutStaffMutation } from "@/lib/services/auth";
import { useState, useEffect } from "react";

const StaffSidebar = () =>{
  const [logoutStaff] = useLogoutStaffMutation();
  const router = useRouter();
  const [userRole, setUserRole] = useState('');
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
    if (typeof window !== 'undefined') {
      const role = localStorage.getItem('role');
      setUserRole(role);
    }
  }, []);

  const handleLogout = async () => {
    try {
      // Clear localStorage first
      if (typeof window !== 'undefined') {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('role');
        localStorage.removeItem('name');
        localStorage.removeItem('is_auth');
        localStorage.removeItem('user_phone');
      }
      
      // Try to call logout API, but don't fail if it doesn't work
      try {
        const response = await logoutStaff();
        if(response.data && response.data.status === 'success'){
          router.push('/staff/login');
        }
      } catch (apiError) {
        console.log('Logout API error:', apiError);
        // Still redirect even if API fails
        router.push('/staff/login');
      }
    } catch (error) {
      console.log('Logout error:', error);
      // Fallback: just redirect
      router.push('/staff/login');
    }
  }

  if (!isMounted) {
    return (
      <div className="bg-purple-800 text-white h-screen p-4">
        <div className="mb-6">
          <h2 className="text-lg font-bold text-center">Home</h2>
        </div>
        <nav>
          <ul>
            <li className="mb-4"><span className="text-gray-400">Loading...</span></li>
          </ul>
        </nav>
      </div>
    );
  }

  const getRoleDescription = (role) => {
    const roleDescriptions = {
      staff1: 'Form Review & Stamp Calculation',
      staff2: 'Trustee Details Validation', 
      staff3: 'Land/Plot Details Verification',
      staff4: 'Approval & Review',
      staff5: 'Final Approval & Lock'
    };
    return roleDescriptions[role] || 'Staff Member';
  };

  return (
    <div className="bg-purple-800 text-white h-screen p-4">
      <div className="mb-6">
        <Link href="/"><h2 className="text-lg font-bold text-center">Home</h2></Link>
      </div>
      
      {/* Role Information */}
      <div className="mb-6 p-3 bg-purple-700 rounded-lg">
        <h3 className="text-sm font-semibold mb-1">Your Role</h3>
        <p className="text-xs text-purple-200">{userRole?.toUpperCase()}</p>
        <p className="text-xs text-purple-300">{getRoleDescription(userRole)}</p>
      </div>

      <nav>
        <ul>
          <li className="mb-4"><Link href="/staff/staff-profile" className="hover:text-indigo-400 transition duration-300 ease-in-out">Profile</Link></li>
          <li className="mb-4"><Link href="/staff/staff-change-password" className="hover:text-indigo-400 transition duration-300 ease-in-out">Change Password</Link></li>
          <li className="mb-4"><Link href="/staff/dashboard" className="hover:text-indigo-400 transition duration-300 ease-in-out">Dashboard</Link></li>
          
          {/* Role-specific navigation */}
          {userRole === 'staff1' && (
            <li className="mb-4"><Link href="/staff/form/1" className="hover:text-indigo-400 transition duration-300 ease-in-out">Form Review</Link></li>
          )}
          {userRole === 'staff2' && (
            <li className="mb-4"><Link href="/staff/form/2" className="hover:text-indigo-400 transition duration-300 ease-in-out">Trustee Validation</Link></li>
          )}
          {userRole === 'staff3' && (
            <li className="mb-4"><Link href="/staff/form/3" className="hover:text-indigo-400 transition duration-300 ease-in-out">Land Verification</Link></li>
          )}
          {userRole === 'staff4' && (
            <li className="mb-4"><Link href="/staff/form/4" className="hover:text-indigo-400 transition duration-300 ease-in-out">Approval Review</Link></li>
          )}
          {userRole === 'staff5' && (
            <li className="mb-4"><Link href="/staff/form/5" className="hover:text-indigo-400 transition duration-300 ease-in-out">Final Approval</Link></li>
          )}
          
          <li><button onClick={handleLogout} className="hover:text-indigo-400 transition duration-300 ease-in-out">Logout</button></li>
        </ul>
      </nav>
    </div>
  )
}

export default StaffSidebar;
