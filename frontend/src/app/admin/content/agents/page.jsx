"use client";
import React from "react";
import { adminFetch } from "@/lib/services/admin";
import { useAdminList } from "@/hooks/useAdminList";

export default function AdminAgentsPage(){
  const { items, loading, error, page, setPage, limit, setLimit, search, setSearch, sort, setSort, reload } = useAdminList('/api/admin/agents', { limit: 10, sort: 'createdAt:desc' });

  return (
    <div className="space-y-4">
      <div className="bg-white border rounded p-3">
        <div className="font-medium">Manage Agents</div>
        <p className="text-sm text-gray-500">Read-only with activate/deactivate and password reset actions.</p>
      </div>
      <div className="bg-white border rounded">
        <div className="p-3 flex items-center justify-between gap-2 border-b">
          <div className="font-medium">Agents</div>
          <div className="flex items-center gap-2">
            <input placeholder="Search agents..." value={search} onChange={e=>setSearch(e.target.value)} className="border rounded px-2 py-1 w-48" />
            <select value={sort} onChange={e=>setSort(e.target.value)} className="border rounded px-2 py-1">
              <option value="createdAt:desc">Newest</option>
              <option value="createdAt:asc">Oldest</option>
              <option value="name:asc">Name A-Z</option>
              <option value="name:desc">Name Z-A</option>
            </select>
            <select value={limit} onChange={e=>setLimit(Number(e.target.value))} className="border rounded px-2 py-1">
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
            <button onClick={reload} className="px-3 py-1.5 bg-gray-900 text-white rounded">Refresh</button>
          </div>
        </div>
        {loading && <div className="p-3">Loading...</div>}
        {error && <div className="p-3 text-red-600">{error}</div>}
        {!loading && !error && (
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-2">Name</th>
                <th className="text-left p-2">Email</th>
                <th className="text-left p-2">Status</th>
                <th className="text-left p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map(a => (
                <tr key={a._id} className="border-t">
                  <td className="p-2">{a.name}</td>
                  <td className="p-2">{a.email}</td>
                  <td className="p-2">{a.isActive ? 'Active' : 'Inactive'}</td>
                  <td className="p-2 space-x-2">
                    <button onClick={async()=>{ if(confirm(`${a.isActive?'Deactivate':'Activate'} this agent?`)){ try{ await adminFetch(`/api/admin/agents/${a._id}/${a.isActive?'deactivate':'activate'}`, { method: 'PATCH' }); reload(); }catch(e){ alert(e.message); } } }} className="px-2 py-1 rounded bg-amber-600 text-white text-xs">{a.isActive? 'Deactivate':'Activate'}</button>
                    <button onClick={async()=>{ const ok = prompt('Type RESET to confirm password reset'); if(ok==='RESET'){ try{ await adminFetch(`/api/admin/agents/${a._id}/reset-password`, { method: 'POST' }); alert('Password reset email sent'); }catch(e){ alert(e.message); } } }} className="px-2 py-1 rounded bg-blue-600 text-white text-xs">Reset Password</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <div className="p-3 flex items-center justify-end gap-2 border-t">
          <button onClick={()=> setPage(Math.max(1, page-1))} className="px-2 py-1 border rounded">Prev</button>
          <span className="text-sm">Page {page}</span>
          <button onClick={()=> setPage(page+1)} className="px-2 py-1 border rounded">Next</button>
        </div>
      </div>
    </div>
  );
}


