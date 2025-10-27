"use client";
import React from "react";
import { adminFetch } from "@/lib/services/admin";
import { useAdminList } from "@/hooks/useAdminList";

export default function AdminFormsPage(){
  const { items, loading, error, page, setPage, limit, setLimit, search, setSearch, sort, setSort, reload } = useAdminList('/api/admin/forms', { limit: 10, sort: 'createdAt:desc' });

  const updateStatus = async (id, status) => {
    try{
      await adminFetch(`/api/admin/forms/${id}/status`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) });
      const data = await adminFetch('/api/admin/forms');
      setItems(data.forms||[]);
    }catch(e){ alert(e.message); }
  };

  return (
    <div className="space-y-4">
      <div className="bg-white border rounded p-3">
        <div className="font-medium">Forms / Applications</div>
        <p className="text-sm text-gray-500">Approve, reject or edit forms. Track staff verification progress.</p>
      </div>
      <div className="bg-white border rounded">
        <div className="p-3 flex items-center justify-between gap-2 border-b">
          <div className="font-medium">All Forms</div>
          <div className="flex items-center gap-2">
            <input placeholder="Search forms..." value={search} onChange={e=>setSearch(e.target.value)} className="border rounded px-2 py-1 w-48" />
            <select value={sort} onChange={e=>setSort(e.target.value)} className="border rounded px-2 py-1">
              <option value="createdAt:desc">Newest</option>
              <option value="createdAt:asc">Oldest</option>
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
                <th className="text-left p-2">Type</th>
                <th className="text-left p-2">Submitted By</th>
                <th className="text-left p-2">Status</th>
                <th className="text-left p-2">Verification Stage</th>
                <th className="text-left p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map(f => (
                <tr key={f._id} className="border-t">
                  <td className="p-2">{f.type}</td>
                  <td className="p-2">{f.submittedBy?.email}</td>
                  <td className="p-2">{f.status}</td>
                  <td className="p-2">{f.verificationStage || '-'}</td>
                  <td className="p-2 space-x-2">
                    <button onClick={()=>updateStatus(f._id, 'approved')} className="px-2 py-1 rounded bg-green-600 text-white text-xs">Approve</button>
                    <button onClick={()=>updateStatus(f._id, 'rejected')} className="px-2 py-1 rounded bg-red-600 text-white text-xs">Reject</button>
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


