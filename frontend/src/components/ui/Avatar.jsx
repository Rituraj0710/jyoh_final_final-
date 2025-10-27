import React, { useEffect, useState } from "react";
import { useGetUserQuery } from "@/lib/services/auth";

const Avatar = () => {
  const [user, setUser] = useState(null);
  const { data, isSuccess } = useGetUserQuery();

  useEffect(() => {
    if (data && isSuccess && data.data && data.data.user) {
      console.log('Avatar: Setting user data:', data.data.user);
      setUser(data.data.user);
    } else {
      console.log('Avatar: No user data available', { data, isSuccess });
    }
  }, [data, isSuccess]);

  // Show loading state or default avatar if user is not loaded
  if (!user) {
    return (
      <div className="flex items-center gap-4 p-2 bg-gray-100 rounded-lg shadow-md">
        <div className="mask mask-squircle w-10 h-10">
          <img
            src="https://img.freepik.com/premium-photo/graphic-designer-digital-avatar-generative-ai_934475-9292.jpg"
            alt="Default Avatar"
          />
        </div>
        <div className="text-gray-800 font-semibold text-lg">Guest</div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4 p-2 bg-gray-100 rounded-lg shadow-md">
      <div className="mask mask-squircle w-10 h-10">
        <img
          src={
            user?.profilePicture || 
            user?.avatar ||
            "https://img.freepik.com/premium-photo/graphic-designer-digital-avatar-generative-ai_934475-9292.jpg"
          }
          alt="User Avatar"
          onError={(e) => {
            e.target.src = "https://img.freepik.com/premium-photo/graphic-designer-digital-avatar-generative-ai_934475-9292.jpg";
          }}
        />
      </div>
      <div className="text-gray-800 font-semibold text-lg">{user?.name || user?.fullName || "Guest"}</div>
    </div>
  );
};

export default Avatar;
