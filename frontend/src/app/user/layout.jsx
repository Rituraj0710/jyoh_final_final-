"use client"
import { usePathname } from "next/navigation";
import FooterPage from "@/components/Footer";
import UserSidebar from "@/components/UserSidebar";
import { useEffect, useState } from "react";

const UserLayout = ({children}) => {
  const pathname = usePathname();
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // Don't show sidebar on login, signup, register, verify-email, verify-otp, or user selection pages
  if (pathname === '/user/login' || pathname === '/user/signup' || pathname === '/user/register' || pathname === '/user/verify-email' || pathname === '/user/verify-otp' || pathname === '/user') {
    return (
      <>
        {children}
        <FooterPage />
      </>
    );
  }

  // Don't render sidebar until client-side hydration is complete
  if (!isClient) {
    return (
      <>
        <div className="grid grid-cols-12">
          <div className="col-span-2 h-screen bg-gray-200"></div>
          <div className="col-span-10 bg-gray-100 h-screen">{children}</div>
        </div>
        <FooterPage />
      </>
    );
  }

  return (
   <>
    <div className="grid grid-cols-12">
      <div className="col-span-2 h-screen">
        <UserSidebar />
      </div>
      <div className="col-span-10 bg-gray-100 h-screen">{children}</div>
      
    </div>
    <FooterPage />
   </>
  )
}

export default UserLayout;