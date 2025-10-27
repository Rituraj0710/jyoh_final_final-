"use client";
import React from "react";

export default function StaffPermissionPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm0 2h12v8H4V6z" clipRule="evenodd" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Staff Permission</h1>
      </div>
      
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <p className="text-gray-600">Staff permission management functionality will be implemented here.</p>
      </div>
    </div>
  );
}
