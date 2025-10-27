"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage(){
  const router = useRouter();
  const [tab, setTab] = useState('admin');
  const [email, setEmail] = useState("id-admin@gmail.com");
  const [password, setPassword] = useState("admin1234");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Ensure we're on the client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Don't render until we're on the client side
  if (!isClient) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="w-full max-w-md bg-white shadow-xl rounded-2xl p-6">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError("");
      const base = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4001";
      const url = `${base}/api/auth/login`;
      
      console.log('Environment check:', {
        NODE_ENV: process.env.NODE_ENV,
        NEXT_PUBLIC_API_BASE: process.env.NEXT_PUBLIC_API_BASE,
        base,
        url
      });
      console.log('Login attempt:', { email, password, url, base });

      console.log('Making request to:', url);
      console.log('Request body:', { email: (email || '').trim().toLowerCase(), password: '***' });
      
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: (email || '').trim().toLowerCase(), password })
      });
      
      console.log('Response status:', res.status);
      console.log('Response headers:', Object.fromEntries(res.headers.entries()));
      // Safely parse response (fallback to text) to avoid empty object logs
      const rawText = await res.text();
      console.log('Raw response text:', rawText);
      
      let data;
      try {
        data = rawText ? JSON.parse(rawText) : {};
        console.log('Parsed data:', data);
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        data = { success: false, message: 'Invalid JSON in response', raw: rawText };
      }
      // Log a snapshot to avoid lazy-evaluated DevTools objects
      console.log('Login response:', {
        status: res.status,
        ok: res.ok,
        headers: Object.fromEntries(res.headers.entries()),
        snapshot: JSON.parse(JSON.stringify(data ?? {}))
      });
      
      if(!res.ok || !data?.success){
        const errorPayload = {
          status: res.status,
          statusText: res.statusText,
          message: data?.message || 'Login failed',
          url,
          requestBody: { email, password: '***' },
          response: data
        };
        console.error('Login failed:', JSON.parse(JSON.stringify(errorPayload)));
        throw new Error(errorPayload.message + (res.status ? ` (HTTP ${res.status})` : ''));
      }
      
      // Store authentication data in localStorage for SPA auth (only on client side)
      if (isClient && typeof window !== 'undefined') {
        if (data.data?.token){
          localStorage.setItem('access_token', data.data.token);
          console.log('Token stored:', data.data.token.substring(0, 20) + '...');
        }
        if (data.data?.user){
          localStorage.setItem('user_id', data.data.user.id);
          localStorage.setItem('user_email', data.data.user.email);
          localStorage.setItem('user_name', data.data.user.name);
          localStorage.setItem('user_role', data.data.user.role);
          localStorage.setItem('user_department', data.data.user.department || '');
          localStorage.setItem('user_employeeId', data.data.user.employeeId || '');
          console.log('User data stored:', {
            id: data.data.user.id,
            email: data.data.user.email,
            name: data.data.user.name,
            role: data.data.user.role,
            department: data.data.user.department,
            employeeId: data.data.user.employeeId
          });
        }
        localStorage.setItem('role', data.data?.user?.role || (tab === 'admin' ? 'admin' : 'staff1'));
        localStorage.setItem('is_auth', 'true');
        
        console.log('Login successful, redirecting...');
        console.log('Stored data:', {
          token: localStorage.getItem('access_token'),
          role: localStorage.getItem('role'),
          isAuth: localStorage.getItem('is_auth')
        });
      }
      setSuccess(true);
      setError("");
      
      // Force a page reload to ensure all components re-initialize with new auth state
      if (isClient && typeof window !== 'undefined') {
        setTimeout(() => {
          const userRole = data.data?.user?.role;
          console.log('Redirecting user with role:', userRole);
          
          if (userRole === 'admin') {
            console.log('Redirecting to admin dashboard...');
            window.location.href = '/admin/dashboard';
          } else if (userRole === 'staff1') {
            console.log('Redirecting to staff1 dashboard...');
            window.location.href = '/staff1/dashboard';
          } else if (userRole === 'staff2') {
            console.log('Redirecting to staff2 dashboard...');
            window.location.href = '/staff2/dashboard';
          } else if (userRole === 'staff3') {
            console.log('Redirecting to staff3 dashboard...');
            window.location.href = '/staff3/dashboard';
          } else if (userRole === 'staff4') {
            console.log('Redirecting to staff4 dashboard...');
            window.location.href = '/staff4/dashboard';
          } else if (userRole === 'staff5') {
            console.log('Redirecting to staff5 dashboard...');
            window.location.href = '/staff5/dashboard';
          } else {
            console.log('Unknown role, redirecting based on tab...');
            if (tab === 'admin') {
              window.location.href = '/admin/dashboard';
            } else {
              window.location.href = '/staff1/dashboard';
            }
          }
        }, 1000);
      }
    } catch (e){
      console.error('Login error caught:', e);
      setError(e.message || 'Login failed. Please check your credentials and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <div className="w-full max-w-md bg-white shadow-xl rounded-2xl p-6">
        <div className="flex mb-6 border-b">
          <button onClick={()=>setTab('admin')} className={`flex-1 py-2 text-center ${tab==='admin' ? 'border-b-2 border-amber-500 font-semibold' : 'text-slate-500'}`}>Admin Login</button>
          <button onClick={()=>setTab('staff')} className={`flex-1 py-2 text-center ${tab==='staff' ? 'border-b-2 border-amber-500 font-semibold' : 'text-slate-500'}`}>Staff Login</button>
        </div>
        <form onSubmit={onSubmit} className="space-y-3">
          {error && <div className="text-red-600 text-sm">{error}</div>}
          {success && <div className="text-green-600 text-sm">Login successful! Redirecting...</div>}
          <input value={email} onChange={e=>setEmail(e.target.value)} required type="email" placeholder="Email" className="w-full border rounded px-3 py-2" />
          <input value={password} onChange={e=>setPassword(e.target.value)} required type="password" placeholder="Password" className="w-full border rounded px-3 py-2" />
          <button disabled={loading || success} className="w-full px-3 py-2 bg-slate-900 text-white rounded">{loading ? "Signing in..." : success ? "Redirecting..." : "Sign in"}</button>
        </form>
        <p className="text-xs text-slate-500 mt-4">Staff accounts are created by Admin. No signup available here.</p>
      </div>
    </div>
  );
}


