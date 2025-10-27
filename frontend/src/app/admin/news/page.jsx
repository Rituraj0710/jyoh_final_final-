"use client";
import React from "react";

export default function NewsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M2 5a2 2 0 012-2h8a2 2 0 012 2v10a2 2 0 002 2H4a2 2 0 01-2-2V5zm3 1h6v4H5V6zm6 6H5v2h6v-2z" clipRule="evenodd" />
            <path d="M15 8h1a1 1 0 011 1v8a1 1 0 01-1 1h-1a1 1 0 01-1-1V9a1 1 0 011-1z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">News/Notification</h1>
      </div>
      
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <p className="text-gray-600">News and notification management functionality will be implemented here.</p>
      </div>
    </div>
  );
}
