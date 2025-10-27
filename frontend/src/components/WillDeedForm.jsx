"use client";
import { useEffect, useState } from "react";
import "./willdeed.css";
import "./willdeed.js";
import LanguageSelectorDropdown from "../../components/LanguageSelectorDropdown";
import ClientOnly from "../../components/ClientOnly";
import { useTranslation } from "react-i18next";

export default function WillDeed() {
  const { t } = useTranslation();
  const [willDeeds, setWillDeeds] = useState([]);
  const [stats, setStats] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedWillDeed, setSelectedWillDeed] = useState(null);

  useEffect(() => {
    window.initWillDeed();
    fetchWillDeeds();
    fetchStats();
  }, []);

  const fetchWillDeeds = async (page = 1, status = "") => {
    try {
      const query = new URLSearchParams({ page, limit: "10", status }).toString();
      const headers = {};
      if (typeof window !== 'undefined'){
        const token = localStorage.getItem('access_token');
        if (token) headers['Authorization'] = `Bearer ${token}`;
      }
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/will-deed?${query}`, {
        method: "GET",
        headers
      });
      if (!res.ok) throw new Error("Failed to fetch will deeds");
      const { data, totalPages, currentPage } = await res.json();
      setWillDeeds(data.willDeeds);
      setTotalPages(totalPages);
      setCurrentPage(currentPage);
    } catch (error) {
      console.error("Fetch will deeds error:", error);
      alert(`Error fetching will deeds: ${error.message}`);
    }
  };

  const fetchStats = async () => {
    try {
      const headers = {};
      if (typeof window !== 'undefined'){
        const token = localStorage.getItem('access_token');
        if (token) headers['Authorization'] = `Bearer ${token}`;
      }
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/will-deed/stats`, {
        method: "GET",
        headers
      });
      if (!res.ok) throw new Error("Failed to fetch stats");
      const { data } = await res.json();
      setStats(data.stats);
    } catch (error) {
      console.error("Fetch stats error:", error);
    }
  };

  const viewWillDeed = async (id) => {
    try {
      const headers = {};
      if (typeof window !== 'undefined'){
        const token = localStorage.getItem('access_token');
        if (token) headers['Authorization'] = `Bearer ${token}`;
      }
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/will-deed/${id}`, {
        method: "GET",
        headers
      });
      if (!res.ok) throw new Error("Failed to fetch will deed");
      const { data } = await res.json();
      setSelectedWillDeed(data.willDeed);
    } catch (error) {
      console.error("View will deed error:", error);
      alert(`Error viewing will deed: ${error.message}`);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      const headers = { "Content-Type": "application/json" };
      if (typeof window !== 'undefined'){
        const token = localStorage.getItem('access_token');
        if (token) headers['Authorization'] = `Bearer ${token}`;
      }
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/will-deed/${id}/status`, {
        method: "PUT",
        headers,
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      const { message } = await res.json();
      alert(message);
      fetchWillDeeds(currentPage);
    } catch (error) {
      console.error("Update status error:", error);
      alert(`Error updating status: ${error.message}`);
    }
  };

  const deleteWillDeed = async (id) => {
    if (!confirm("Are you sure you want to delete this will deed?")) return;
    try {
      const headers = {};
      if (typeof window !== 'undefined'){
        const token = localStorage.getItem('access_token');
        if (token) headers['Authorization'] = `Bearer ${token}`;
      }
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/will-deed/${id}`, {
        method: "DELETE",
        headers
      });
      if (!res.ok) throw new Error("Failed to delete will deed");
      const { message } = await res.json();
      alert(message);
      fetchWillDeeds(currentPage);
    } catch (error) {
      console.error("Delete will deed error:", error);
      alert(`Error deleting will deed: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 w-full">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-2xl lg:text-3xl font-bold text-blue-600 mb-2">
                अंतिम वसीयतनामा (Will Deed) — Generator
              </h1>
              <p className="text-sm text-gray-600">
                Preview में legal Hindi draft बनेगा — allocation mapping, rules, conditions और watermark included.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <ClientOnly fallback={
                <div className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm">
                  <span className="text-lg">🌐</span>
                  <span className="hidden sm:inline">Loading...</span>
                </div>
              }>
                <LanguageSelectorDropdown />
              </ClientOnly>
              <button 
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                onClick={() => window.saveDraft()}
              >
                💾 Save Draft
              </button>
              <button 
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                onClick={() => window.generatePreview()}
              >
                🔍 Preview
              </button>
              <button 
                className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                onClick={() => window.submitForm()}
              >
                ✅ Submit
              </button>
            </div>
          </div>
        </div>

        {/* Statistics Display */}
        {stats && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Will Deed Statistics</h2>
              <div className="text-sm text-gray-500">
                Last updated: {new Date().toLocaleDateString()}
              </div>
            </div>
            
            {/* Main Statistics Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-bold text-blue-700">{stats.total}</div>
                    <div className="text-sm font-medium text-blue-600">Total Documents</div>
                  </div>
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-4 border border-yellow-200">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-bold text-yellow-700">{stats.draft}</div>
                    <div className="text-sm font-medium text-yellow-600">Draft</div>
                  </div>
                  <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 border border-orange-200">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-bold text-orange-700">{stats.submitted}</div>
                    <div className="text-sm font-medium text-orange-600">Submitted</div>
                  </div>
                  <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-bold text-green-700">{stats.approved}</div>
                    <div className="text-sm font-medium text-green-600">Approved</div>
                  </div>
                  <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-4 border border-red-200">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-bold text-red-700">{stats.rejected}</div>
                    <div className="text-sm font-medium text-red-600">Rejected</div>
                  </div>
                  <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Completion Rate</span>
                <span className="text-sm font-bold text-gray-900">
                  {stats.total > 0 ? Math.round(((stats.approved + stats.submitted) / stats.total) * 100) : 0}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${stats.total > 0 ? ((stats.approved + stats.submitted) / stats.total) * 100 : 0}%` 
                  }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Pending: {stats.draft + stats.rejected}</span>
                <span>Completed: {stats.approved + stats.submitted}</span>
              </div>
            </div>
          </div>
        )}

        {/* Will Deeds List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Will Deeds</h2>
          <div className="space-y-3">
            {willDeeds.map((deed) => (
              <div key={deed._id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">
                      <span className="text-gray-600">Testator:</span> {deed.testator.fullName}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="text-gray-500">Status:</span> 
                      <span className={`ml-1 px-2 py-1 rounded-full text-xs font-medium ${
                        deed.meta.status === 'approved' ? 'bg-green-100 text-green-800' :
                        deed.meta.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        deed.meta.status === 'submitted' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {deed.meta.status}
                      </span>
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm transition-colors"
                      onClick={() => viewWillDeed(deed._id)}
                    >
                      View
                    </button>
                    <select
                      className="border border-gray-300 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      onChange={(e) => updateStatus(deed._id, e.target.value)}
                      defaultValue={deed.meta.status}
                    >
                      <option value="draft">Draft</option>
                      <option value="submitted">Submitted</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                    </select>
                    <button
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm transition-colors"
                      onClick={() => deleteWillDeed(deed._id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Pagination */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-6 pt-4 border-t border-gray-200">
            <button
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              disabled={currentPage === 1}
              onClick={() => fetchWillDeeds(currentPage - 1)}
            >
              Previous
            </button>
            <span className="text-sm text-gray-600 text-center">
              Page {currentPage} of {totalPages}
            </span>
            <button
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              disabled={currentPage === totalPages}
              onClick={() => fetchWillDeeds(currentPage + 1)}
            >
              Next
            </button>
          </div>
        </div>

        {/* Selected Will Deed Details */}
        {selectedWillDeed && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Will Deed Details</h2>
              <button
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded text-sm transition-colors"
                onClick={() => setSelectedWillDeed(null)}
              >
                Close
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600"><strong>Testator:</strong> {selectedWillDeed.testator.fullName}</p>
                <p className="text-sm text-gray-600"><strong>Status:</strong> {selectedWillDeed.meta.status}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600"><strong>Beneficiaries:</strong> {selectedWillDeed.beneficiaries.map(b => b.name).join(", ")}</p>
                <p className="text-sm text-gray-600"><strong>Executors:</strong> {selectedWillDeed.executors.map(e => e.name).join(", ")}</p>
                <p className="text-sm text-gray-600"><strong>Witnesses:</strong> {selectedWillDeed.witnesses.map(w => w.name).join(", ")}</p>
              </div>
            </div>
          </div>
        )}

        {/* Main Form */}
        <div id="formCard" className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          {/* Testator Section */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
              1) वसीयतकर्ता (Testator)
            </h2>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                <div className="sm:col-span-2 lg:col-span-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">नाम</label>
                  <div className="flex gap-2">
                    <select id="testatorPrefix" className="flex-shrink-0 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                      <option>श्री</option>
                      <option>श्रीमती</option>
                      <option>कुमारी</option>
                      <option>अन्य</option>
                    </select>
                    <input
                      type="text"
                      id="testatorName"
                      className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="पूरा नाम"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">पिता/पति का नाम</label>
                  <input
                    type="text"
                    id="testatorFH"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="पिता/पति का नाम"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">मोबाइल नंबर</label>
                  <input
                    type="tel"
                    id="testatorMobile"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="10 अंक"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Identity Type</label>
                  <select id="testatorIdType" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option>आधार कार्ड</option>
                    <option>पैन कार्ड</option>
                    <option>वोटर आईडी</option>
                    <option>पासपोर्ट</option>
                    <option>ड्राइविंग लाइसेंस</option>
                    <option>अन्य</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Identity No.</label>
                  <input 
                    type="text" 
                    id="testatorIdNo" 
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Identity Upload</label>
                  <input
                    type="file"
                    id="testatorIdUpload"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    accept=".pdf,.jpg,.jpeg,.png"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Passport Photo</label>
                  <div className="flex gap-3 items-end">
                    <input
                      type="file"
                      id="testatorPhoto"
                      className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      accept="image/*"
                      onChange={(e) => window.previewImage(e.target, "testatorPreview")}
                    />
                    <img id="testatorPreview" className="w-16 h-16 object-cover rounded-lg border border-gray-300" alt="" />
                  </div>
                </div>
                <div className="sm:col-span-2 lg:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">पता</label>
                  <textarea 
                    id="testatorAddress" 
                    rows="2"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  ></textarea>
                </div>
              </div>
            </div>
          </div>

          {/* Beneficiaries Section */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">2) लाभार्थी (Beneficiaries)</h2>
              <button
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                onClick={() => window.addBeneficiary()}
              >
                + लाभार्थी जोड़ें
              </button>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div id="beneficiaries" className="space-y-3"></div>
            </div>
          </div>

          {/* Executors Section */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">3) निष्पादक (Executors)</h2>
              <button
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                onClick={() => window.addExecutor()}
              >
                + निष्पादक जोड़ें
              </button>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div id="executors" className="space-y-3"></div>
            </div>
          </div>

          {/* Witnesses Section */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">4) गवाह (Witnesses)</h2>
              <button
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                onClick={() => window.addWitness()}
              >
                + गवाह जोड़ें
              </button>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div id="witnesses" className="space-y-3"></div>
            </div>
          </div>

          {/* Property Details Section */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
              5) संपत्ति विवरण (Property Details)
            </h2>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">संपत्ति का प्रकार चुनें</label>
                  <select
                    id="propertyType"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    onChange={() => window.onPropertyTypeChange()}
                  >
                    <option value="">-- चुनें --</option>
                    <option value="immovable">अचल संपत्ति</option>
                    <option value="movable">चल संपत्ति</option>
                    <option value="both">दोनों</option>
                  </select>
                </div>
              </div>

              <div id="immovableArea" className="hidden">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 pb-2 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">अचल संपत्ति (Immovable)</h3>
                  <button
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors w-full sm:w-auto"
                    onClick={() => window.addImmovable()}
                  >
                    + अचल संपत्ति जोड़ें
                  </button>
                </div>
                <div id="immovableList" className="space-y-3"></div>
              </div>

              <div id="movableArea" className="hidden">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 pb-2 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">चल संपत्ति (Movable)</h3>
                  <button
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors w-full sm:w-auto"
                    onClick={() => window.addMovable()}
                  >
                    + चल संपत्ति जोड़ें
                  </button>
                </div>
                <div id="movableList" className="space-y-3"></div>
              </div>
            </div>
          </div>

          {/* Rules & Regulations Section */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
              6) नियम एवं घोषणाएँ (Rules & Regulations)
            </h2>
            
            {/* Controls Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-4">
              <div className="sm:col-span-2 lg:col-span-1">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <input
                    type="checkbox"
                    id="selectAllRules"
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    onChange={(e) => window.toggleAllRules(e.target)}
                  />
                  Select All Rules
                </label>
              </div>
              <div className="sm:col-span-2 lg:col-span-1">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <input
                    type="checkbox"
                    id="enableConditions"
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    onChange={(e) => window.toggleConditions(e.target)}
                  />
                  Add Conditions
                </label>
              </div>
            </div>

            {/* Rules and Conditions Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Rules Section */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Standard Rules</h3>
                  <button
                    className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
                    onClick={() => window.addCustomRule()}
                  >
                    + Add Rule
                  </button>
                </div>
                <div id="rulesList" className="space-y-2">
                  {/* Default rules will be populated by JavaScript */}
                  <div className="flex items-start gap-3 p-3 bg-white rounded border border-gray-200">
                    <input type="checkbox" className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                    <div className="text-sm text-gray-700">
                      <span className="font-medium">यह वसीयत मानसिक रूप से स्वस्थ अवस्था में, स्वतंत्र इच्छा और बिना किसी दबाव के बनाई गई है।</span>
                      <div className="text-xs text-gray-500 mt-1">(This will has been made in a mentally sound state, with free will and without any pressure.)</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-white rounded border border-gray-200">
                    <input type="checkbox" className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                    <div className="text-sm text-gray-700">
                      <span className="font-medium">यह मेरी अंतिम वसीयत है; इससे पूर्व की सभी वसीयतें/कोडिसिल निरस्त मानी जाएँगी।</span>
                      <div className="text-xs text-gray-500 mt-1">(This is my last will; all previous wills/codicils will be considered null and void.)</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-white rounded border border-gray-200">
                    <input type="checkbox" className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                    <div className="text-sm text-gray-700">
                      <span className="font-medium">इस वसीयत में वर्णित संपत्तियों का विवरण मेरी जानकारी के अनुसार सही है।</span>
                      <div className="text-xs text-gray-500 mt-1">(The details of the properties described in this will are correct to my knowledge.)</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-white rounded border border-gray-200">
                    <input type="checkbox" className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                    <div className="text-sm text-gray-700">
                      <span className="font-medium">गवाहों ने मेरी उपस्थिति में और एक-दूसरे की उपस्थिति में इस वसीयत पर हस्ताक्षर किए हैं।</span>
                      <div className="text-xs text-gray-500 mt-1">(Witnesses have signed this will in my presence and in each other's presence.)</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-white rounded border border-gray-200">
                    <input type="checkbox" className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                    <div className="text-sm text-gray-700">
                      <span className="font-medium">नियुक्त निष्पादक वसीयत के अनुसार संपत्ति के वितरण का पालन करेंगे।</span>
                      <div className="text-xs text-gray-500 mt-1">(The appointed executor will follow the distribution of property according to the will.)</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Conditions Section */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Custom Conditions</h3>
                  <button
                    className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
                    onClick={() => window.addCondition()}
                  >
                    + Add Condition
                  </button>
                </div>
                <div id="conditionsArea" className="hidden">
                  <div id="conditionsList" className="space-y-2">
                    <div className="text-sm text-gray-500 italic">
                      No custom conditions added yet. Click "Add Condition" to create one.
                    </div>
                  </div>
                </div>
                <div id="conditionsAreaVisible" className="space-y-2">
                  <div className="text-sm text-gray-500 italic">
                    Enable "Add Conditions" checkbox to add custom conditions.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Draft By Section */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4 pb-2 border-b border-gray-200">
              7) Draft By
            </h3>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prepared By:
                  </label>
                  <select id="draftBy" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option>Jyoh Services Pvt. Ltd.</option>
                    <option>Self</option>
                    <option>Other Advocate</option>
                  </select>
                  <p className="text-sm text-gray-600 mt-2">
                    यह ड्राफ्टर नाम ड्राफ्ट में दिखाई देगा।
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>नोट:</strong> फोटो/ID अपलोड केवल preview/metadata हेतु — सर्वर पर भेजने के लिए backend आवश्यक है।
            </p>
          </div>
        </div>

        {/* Preview Section */}
        <div id="previewWrap" className="preview-wrap hidden">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex flex-wrap justify-end gap-2 mb-6">
              <button
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                onClick={() => {
                  document.getElementById("previewWrap").className = "preview-wrap hidden";
                  document.getElementById("formCard").className = "bg-white rounded-lg shadow-sm border border-gray-200 p-6";
                }}
              >
                ✏️ Edit
              </button>
              <button 
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                onClick={() => window.saveDraft()}
              >
                💾 Save
              </button>
              <button 
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                onClick={() => window.print()}
              >
                🖨️ Print
              </button>
            </div>
            <div className="preview-page bg-white p-6 rounded-lg border border-gray-200 relative">
              <div className="watermark-layer" id="wmLayer"></div>
              <div className="preview-body" id="previewBody"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
