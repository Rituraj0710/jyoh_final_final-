"use client";
import React, { useEffect, useState } from "react";

export default function AdminLogsPage(){
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [logs, setLogs] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({ action: "", userRole: "" });

  const loadLogs = async (pageNum = 1, activeFilters = filters) => {
    try {
      setLoading(true);
      setError("");
      const base = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4001";
      const params = new URLSearchParams({ page: String(pageNum), limit: "20" });
      if(activeFilters.action) params.set("action", activeFilters.action);
      if(activeFilters.userRole) params.set("userRole", activeFilters.userRole);
      const res = await fetch(`${base}/api/admin/audit-logs?${params.toString()}`, { credentials: "include" });
      const data = await res.json();
      if(!res.ok || data.status !== "success"){
        throw new Error(data.message || "Failed to load logs");
      }
      setLogs(data.logs);
      setPage(data.pagination.page);
      setTotalPages(data.pagination.pages);
    } catch (e){
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadLogs(1, filters); }, []);

  return (
    <div className="space-y-4">
      <div className="flex gap-2 items-end">
        <div>
          <label className="text-sm text-gray-600">Action</label>
          <input value={filters.action} onChange={e => setFilters(f => ({...f, action: e.target.value}))} className="border rounded px-2 py-1 block" placeholder="e.g. staff_create" />
        </div>
        <div>
          <label className="text-sm text-gray-600">User Role</label>
          <select value={filters.userRole} onChange={e => setFilters(f => ({...f, userRole: e.target.value}))} className="border rounded px-2 py-1 block">
            <option value="">All</option>
            <option value="admin">admin</option>
            <option value="staff1">staff1</option>
            <option value="staff2">staff2</option>
            <option value="staff3">staff3</option>
            <option value="staff4">staff4</option>
            <option value="staff5">staff5</option>
          </select>
        </div>
        <button onClick={() => loadLogs(1, filters)} className="px-3 py-2 bg-gray-900 text-white rounded">Apply</button>
      </div>

      {loading && <div>Loading...</div>}
      {error && <div className="text-red-600">{error}</div>}

      <div className="bg-white border rounded">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-2">Time</th>
              <th className="text-left p-2">Action</th>
              <th className="text-left p-2">Resource</th>
              <th className="text-left p-2">By</th>
            </tr>
          </thead>
          <tbody>
            {logs.map(log => (
              <tr key={log._id} className="border-t">
                <td className="p-2">{new Date(log.timestamp).toLocaleString()}</td>
                <td className="p-2">{log.action}</td>
                <td className="p-2">{log.resource}</td>
                <td className="p-2">{log.userId?.name} ({log.userId?.role})</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex gap-2 items-center">
        <button disabled={page <= 1} onClick={() => loadLogs(page - 1)} className="px-3 py-1 border rounded disabled:opacity-50">Prev</button>
        <div className="text-sm text-gray-600">Page {page} of {totalPages}</div>
        <button disabled={page >= totalPages} onClick={() => loadLogs(page + 1)} className="px-3 py-1 border rounded disabled:opacity-50">Next</button>
      </div>
    </div>
  );
}


