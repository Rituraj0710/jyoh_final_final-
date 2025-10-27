"use client";
import React, { useState } from "react";
import { adminFetch } from "@/lib/services/admin";

export default function AdminSettingsPage(){
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({ siteName: "Document Client", enableOtp: true });

  const onSubmit = async (e) => {
    e.preventDefault();
    try{
      setSaving(true); setMessage("");
      await adminFetch('/api/admin/settings', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      setMessage('Settings saved.');
    }catch(e){ setMessage(e.message || 'Save failed'); }
    finally{ setSaving(false); }
  };

  return (
    <div className="max-w-xl bg-white border rounded p-4 space-y-3">
      <div className="font-medium">Settings</div>
      {message && <div className="text-sm {message.includes('failed')?'text-red-600':'text-green-700'}">{message}</div>}
      <form onSubmit={onSubmit} className="space-y-3">
        <div>
          <label className="block text-sm text-gray-700 mb-1">Site name</label>
          <input value={form.siteName} onChange={e=>setForm({...form, siteName:e.target.value})} className="w-full border rounded px-2 py-1" />
        </div>
        <div className="flex items-center space-x-2">
          <input id="otp" type="checkbox" checked={form.enableOtp} onChange={e=>setForm({...form, enableOtp:e.target.checked})} />
          <label htmlFor="otp" className="text-sm text-gray-700">Enable OTP for user/agent login</label>
        </div>
        <button disabled={saving} className="px-3 py-2 bg-gray-900 text-white rounded">{saving? 'Saving...':'Save'}</button>
      </form>
    </div>
  );
}


