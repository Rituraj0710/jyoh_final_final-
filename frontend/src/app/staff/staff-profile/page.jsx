"use client"
import { useGetStaffQuery } from "@/lib/services/auth";
import { useState, useEffect } from "react";

const StaffProfile = () => {
  const [user, setUser] = useState({});
  const {data, isSuccess} = useGetStaffQuery();
  useEffect(() => {
    if (data && isSuccess) {
      setUser(data.user);
    } else if (typeof window !== 'undefined'){
      const name = localStorage.getItem('user_name');
      const email = localStorage.getItem('user_email');
      const id = localStorage.getItem('user_id');
      const role = localStorage.getItem('role');
      const phone = localStorage.getItem('user_phone');
      const department = localStorage.getItem('user_department');
      const employeeId = localStorage.getItem('user_employeeId');
      setUser({ name, email, _id: id, role, phone, department, employeeId });
    }
  }, [data, isSuccess])
  
  const getRoleDescription = (role) => {
    const roleDescriptions = {
      staff1: 'Form Review & Stamp Calculation',
      staff2: 'Trustee Details Validation', 
      staff3: 'Land/Plot Details Verification',
      staff4: 'Approval & Review'
    };
    return roleDescriptions[role] || 'Staff Member';
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-6">Staff Profile</h2>
        <div className="mb-4">
          <label className="block font-medium mb-2">
            Name: {user.name}
          </label>
        </div>
        <div className="mb-4">
          <label className="block font-medium mb-2">
            Employee ID: {user.employeeId}
          </label>
        </div>
        <div className="mb-4">
          <label className="block font-medium mb-2">
            Department: {user.department}
          </label>
        </div>
        <div className="mb-4">
          <label className="block font-medium mb-2">
            Phone: {user.phone}
          </label>
        </div>
        <div className="mb-4">
          <label className="block font-medium mb-2">
            Email: {user.email}
          </label>
        </div>
        <div className="mb-4">
          <label className="block font-medium mb-2">
            Role: {user.role} - {getRoleDescription(user.role)}
          </label>
        </div>
        <div className="mb-4">
          <label className="block font-medium mb-2">
            ID: {user._id}
          </label>
        </div>
      </div>
    </div>
  )
}

export default StaffProfile;
