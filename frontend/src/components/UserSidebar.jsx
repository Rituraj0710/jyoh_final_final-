"use client"
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLogoutUserMutation } from "@/lib/services/auth";
import { useState, useEffect } from "react";

const UserSidebar = () =>{
  const [logoutUser] = useLogoutUserMutation();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
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
        localStorage.removeItem('user_name');
        localStorage.removeItem('user_email');
        localStorage.removeItem('user_id');
      }
      
      // Try to call logout API, but don't fail if it doesn't work
      try {
        const response = await logoutUser();
        if(response.data && response.data.status === 'success'){
          router.push('/user/login');
        }
      } catch (apiError) {
        console.log('Logout API error:', apiError);
        // Still redirect even if API fails
        router.push('/user/login');
      }
    } catch (error) {
      console.log('Logout error:', error);
      // Fallback: just redirect
      router.push('/user/login');
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
  return (
    <div className="bg-purple-800 text-white h-screen p-4">
      <div className="mb-6">
        <Link href="/"><h2 className="text-lg font-bold text-center">Home</h2></Link>
      </div>
      <nav>
        <ul>
          <li className="mb-4"><Link href="/user/profile" className="hover:text-indigo-400 transition duration-300 ease-in-out">Profile</Link></li>
          <li className="mb-4"><Link href="/user/change-password" className="hover:text-indigo-400 transition duration-300 ease-in-out">Change Password</Link></li>
          <li><button onClick={handleLogout} className="hover:text-indigo-400 transition duration-300 ease-in-out">Logout</button></li>
        </ul>
      </nav>
    </div>
  )
}

export default UserSidebar;