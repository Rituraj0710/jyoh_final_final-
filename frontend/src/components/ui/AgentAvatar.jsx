import React, { useEffect, useState } from "react";
import { useGetStaffQuery } from "@/lib/services/auth";

const AgentAvatar = () => {
  const [user, setUser] = useState({});
  const { data, isSuccess } = useGetStaffQuery();

  useEffect(() => {
    if (data && isSuccess) {
      setUser(data.user);
    }
  }, [data, isSuccess]);

  return (
    <div className="flex items-center gap-4 p-2 bg-gray-100 rounded-lg shadow-md">
      <div className="mask mask-squircle w-10 h-10">
        <img
          src={
            user.profilePicture ||
            "https://img.freepik.com/premium-photo/graphic-designer-digital-avatar-generative-ai_934475-9292.jpg"
          }
          alt="User Avatar"
        />
      </div>
      <div className="text-gray-800 font-semibold text-lg">{user.name || "Guest"}</div>
    </div>
  );
};

export default AgentAvatar;
