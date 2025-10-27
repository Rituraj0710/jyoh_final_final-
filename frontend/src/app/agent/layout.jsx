"use client"
import { usePathname } from "next/navigation";
import AgentSidebar from "@/components/AgentSidebar";
import FooterPage from "@/components/Footer";
import { useEffect, useState } from "react";

const AgentLayout = ({children}) => {
  const pathname = usePathname();
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // Don't show sidebar on login or register pages
  if (pathname === '/agent/login' || pathname === '/agent/register') {
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
        <AgentSidebar />
      </div>
      <div className="col-span-10 bg-gray-100 h-screen">{children}</div>
      
    </div>
    <FooterPage />
   </>
  )
}

export default AgentLayout;