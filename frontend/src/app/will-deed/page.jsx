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
      // alert(`Error fetching stats: ${error.message}`);
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
    <div className="min-h-screen bg-gray-50 w-full px-4 sm:px-6 lg:px-8 py-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">अंतिम वसीयतनामा (Will Deed) — Generator</h1>
              <p className="text-sm text-gray-600 mt-1">
                Preview में legal Hindi draft बनेगा — allocation mapping, rules, conditions और watermark included.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
              {/* Total Documents Card */}
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
              {/* Draft Card */}
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
              {/* Submitted Card */}
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
              {/* Approved Card */}
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
              {/* Rejected Card */}
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
          <div className="grid gap-4">
          {willDeeds.map((deed) => (
            <div key={deed._id} className="p-4 bg-white shadow rounded">
              <p><strong>Testator:</strong> {deed.testator.fullName}</p>
              <p><strong>Status:</strong> {deed.meta.status}</p>
              <div className="flex gap-2 mt-2">
                <button
                  className="bg-blue-500 text-white px-3 py-1 rounded"
                  onClick={() => viewWillDeed(deed._id)}
                >
                  View
                </button>
                <select
                  className="border rounded px-2 py-1"
                  onChange={(e) => updateStatus(deed._id, e.target.value)}
                  defaultValue={deed.meta.status}
                >
                  <option value="draft">Draft</option>
                  <option value="submitted">Submitted</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
                <button
                  className="bg-red-500 text-white px-3 py-1 rounded"
                  onClick={() => deleteWillDeed(deed._id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-4">
          <button
            className="bg-gray-500 text-white px-4 py-2 rounded disabled:opacity-50"
            disabled={currentPage === 1}
            onClick={() => fetchWillDeeds(currentPage - 1)}
          >
            Previous
          </button>
          <span>Page {currentPage} of {totalPages}</span>
          <button
            className="bg-gray-500 text-white px-4 py-2 rounded disabled:opacity-50"
            disabled={currentPage === totalPages}
            onClick={() => fetchWillDeeds(currentPage + 1)}
          >
            Next
          </button>
        </div>
      </div>

      {/* Selected Will Deed Details */}
      {selectedWillDeed && (
        <div className="mb-6 p-4 bg-gray-100 rounded">
          <h2 className="text-lg font-semibold">Will Deed Details</h2>
          <p><strong>Testator:</strong> {selectedWillDeed.testator.fullName}</p>
          <p><strong>Status:</strong> {selectedWillDeed.meta.status}</p>
          <p><strong>Beneficiaries:</strong> {selectedWillDeed.beneficiaries.map(b => b.name).join(", ")}</p>
          <p><strong>Executors:</strong> {selectedWillDeed.executors.map(e => e.name).join(", ")}</p>
          <p><strong>Witnesses:</strong> {selectedWillDeed.witnesses.map(w => w.name).join(", ")}</p>
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded mt-2"
            onClick={() => setSelectedWillDeed(null)}
          >
            Close
          </button>
        </div>
      )}

        {/* Form Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">1) वसीयतकर्ता (Testator)</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">नाम</label>
              <div className="flex gap-2">
                <select id="testatorPrefix" className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <option>श्री</option>
                  <option>श्रीमती</option>
                  <option>कुमारी</option>
                  <option>अन्य</option>
                </select>
                <input
                  type="text"
                  id="testatorName"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="पूरा नाम"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">श्री पिता/पति का नाम</label>
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
            <div className="sm:col-span-2 lg:col-span-3 xl:col-span-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">पता</label>
              <textarea id="testatorAddress" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" rows="3"></textarea>
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
              <input type="text" id="testatorIdNo" className="border rounded px-2 py-1 w-full" />
            </div>
            <div>
              <label className="block text-sm font-medium">Identity Upload</label>
              <input
                type="file"
                id="testatorIdUpload"
                className="border rounded px-2 py-1 w-full"
                accept=".pdf,.jpg,.jpeg,.png"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Passport Photo</label>
              <div className="flex gap-2">
                <input
                  type="file"
                  id="testatorPhoto"
                  className="border rounded px-2 py-1"
                  accept="image/*"
                  onChange={(e) => window.previewImage(e.target, "testatorPreview")}
                />
                <img id="testatorPreview" className="w-16 h-16 object-cover rounded" alt="" />
              </div>
            </div>
          </div>
        </div>

        <div className="section mt-6">
          <h2 className="text-lg font-semibold">2) लाभार्थी (Beneficiaries)</h2>
          <div id="beneficiaries"></div>
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded mt-2"
            onClick={() => window.addBeneficiary()}
          >
            + लाभार्थी जोड़ें
          </button>
        </div>

        <div className="section mt-6">
          <h2 className="text-lg font-semibold">3) निष्पादक (Executors)</h2>
          <div id="executors"></div>
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded mt-2"
            onClick={() => window.addExecutor()}
          >
            + निष्पादक जोड़ें
          </button>
        </div>

        <div className="section mt-6">
          <h2 className="text-lg font-semibold">4) गवाह (Witnesses)</h2>
          <div id="witnesses"></div>
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded mt-2"
            onClick={() => window.addWitness()}
          >
            + गवाह जोड़ें
          </button>
        </div>

        <div className="section mt-6">
          <h2 className="text-lg font-semibold">5) संपत्ति विवरण (Property Details)</h2>
          <label className="block text-sm font-medium">संपत्ति का प्रकार चुनें</label>
          <select
            id="propertyType"
            className="border rounded px-2 py-1"
            onChange={() => window.onPropertyTypeChange()}
          >
            <option value="">-- चुनें --</option>
            <option value="immovable">अचल संपत्ति</option>
            <option value="movable">चल संपत्ति</option>
            <option value="both">दोनों</option>
          </select>

          <div id="immovableArea" className="mt-4 hidden">
            <h3 className="text-md font-semibold">अचल संपत्ति (Immovable)</h3>
            <div id="immovableList"></div>
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded mt-2"
              onClick={() => window.addImmovable()}
            >
              + अचल संपत्ति जोड़ें
            </button>
          </div>

          <div id="movableArea" className="mt-4 hidden">
            <h3 className="text-md font-semibold">चल संपत्ति (Movable)</h3>
            <div id="movableList"></div>
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded mt-2"
              onClick={() => window.addMovable()}
            >
              + चल संपत्ति जोड़ें
            </button>
          </div>
        </div>

        <div className="section mt-6">
          <h2 className="text-lg font-semibold">6) नियम एवं घोषणाएँ (Rules & Regulations)</h2>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              id="selectAllRules"
              onChange={(e) => window.toggleAllRules(e.target)}
            />
            Select All
          </label>
          <div id="rulesList" className="mt-2"></div>
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded mt-2"
            onClick={() => window.addCustomRule()}
          >
            + Add More Rule
          </button>
          <hr className="my-4" />
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              id="enableConditions"
              onChange={(e) => window.toggleConditions(e.target)}
            />
            Add Conditions
          </label>
          <div id="conditionsArea" className="mt-2 hidden">
            <div id="conditionsList"></div>
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded mt-2"
              onClick={() => window.addCondition()}
            >
              + Add Condition
            </button>
          </div>
        </div>

        <div className="section mt-6">
          <h3 className="text-md font-semibold">7) Draft By</h3>
          <label className="block text-sm font-medium">
            Prepared By:
            <select id="draftBy" className="border rounded px-2 py-1 mt-1">
              <option>Jyoh Services Pvt. Ltd.</option>
              <option>Self</option>
              <option>Other Advocate</option>
            </select>
          </label>
          <p className="text-sm text-gray-600 mt-1">
            यह ड्राफ्टर नाम ड्राफ्ट में दिखाई देगा।
          </p>
        </div>

        <p className="text-sm text-gray-600 mt-4">
          नोट: फोटो/ID अपलोड केवल preview/metadata हेतु — सर्वर पर भेजने के लिए backend आवश्यक है।
        </p>
      </div>

      <div id="previewWrap" className="preview-wrap hidden">
        <div className="flex justify-end gap-2 mb-4">
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded"
            onClick={() => {
              document.getElementById("previewWrap").className = "preview-wrap hidden";
              document.getElementById("formCard").className = "card bg-white p-6 rounded shadow";
            }}
          >
            ✏️ Edit
          </button>
          <button className="bg-blue-500 text-white px-4 py-2 rounded" onClick={() => window.saveDraft()}>
            💾 Save
          </button>
          <button className="bg-blue-500 text-white px-4 py-2 rounded" onClick={() => window.print()}>
            🖨️ Print
          </button>
        </div>
        <div className="preview-page bg-white p-6 rounded shadow relative">
          <div className="watermark-layer" id="wmLayer"></div>
          <div className="preview-body" id="previewBody"></div>
        </div>
        </div>
      </div>
    </div>
  );
}