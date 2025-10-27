"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { adminFetch } from "@/lib/services/admin";

export default function AdminFormsDataPage() {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    pages: 0
  });

  // Filters
  const [filters, setFilters] = useState({
    serviceType: "",
    status: "",
    assignedTo: "",
    search: ""
  });

  // Staff assignment modal
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedForm, setSelectedForm] = useState(null);
  const [staffList, setStaffList] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState("");

  // Approval modal
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [approvalData, setApprovalData] = useState({
    approved: true,
    reason: ""
  });

  // View mode (grid or list)
  const [viewMode, setViewMode] = useState("grid");

  // Load forms data
  const loadForms = async () => {
    try {
      setLoading(true);
      setError("");
      
      const queryParams = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...filters
      });

      const response = await adminFetch(`/api/forms/admin/forms?${queryParams}`);
      
      if (response.success) {
        setForms(response.data.forms);
        setPagination(response.data.pagination);
      } else {
        setError(response.message || "Failed to load forms");
      }
    } catch (err) {
      setError(err.message || "Error loading forms");
    } finally {
      setLoading(false);
    }
  };

  // Load staff list for assignment
  const loadStaffList = async () => {
    try {
      const response = await adminFetch('/api/admin/staff');
      if (response.success) {
        setStaffList(response.data.staff.filter(staff => staff.isActive));
      }
    } catch (err) {
      console.error('Error loading staff list:', err);
    }
  };

  useEffect(() => {
    loadForms();
    loadStaffList();
  }, [pagination.page, pagination.limit, filters]);

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page
  };

  // Handle staff assignment
  const handleAssignToStaff = async () => {
    if (!selectedForm || !selectedStaff) return;

    try {
      const response = await adminFetch(`/api/forms/admin/forms/${selectedForm._id}/assign`, {
        method: 'POST',
        body: JSON.stringify({ staffId: selectedStaff })
      });

      if (response.success) {
        alert('Form assigned to staff successfully!');
        setShowAssignModal(false);
        setSelectedForm(null);
        setSelectedStaff("");
        loadForms();
      } else {
        alert(response.message || 'Failed to assign form');
      }
    } catch (err) {
      alert(err.message || 'Error assigning form');
    }
  };

  // Handle form approval/rejection
  const handleApproveForm = async () => {
    if (!selectedForm) return;

    try {
      const response = await adminFetch(`/api/forms/admin/forms/${selectedForm._id}/approve`, {
        method: 'POST',
        body: JSON.stringify(approvalData)
      });

      if (response.success) {
        alert(approvalData.approved ? 'Form approved successfully!' : 'Form rejected successfully!');
        setShowApprovalModal(false);
        setSelectedForm(null);
        setApprovalData({ approved: true, reason: "" });
        loadForms();
      } else {
        alert(response.message || 'Failed to process form');
      }
    } catch (err) {
      alert(err.message || 'Error processing form');
    }
  };

  // Open assignment modal
  const openAssignModal = (form) => {
    setSelectedForm(form);
    setShowAssignModal(true);
  };

  // Open approval modal
  const openApprovalModal = (form, approved = true) => {
    setSelectedForm(form);
    setApprovalData({ approved, reason: "" });
    setShowApprovalModal(true);
  };

  // Get status badge color
  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'submitted': return 'bg-blue-100 text-blue-800';
      case 'verified': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'in-progress': return 'bg-purple-100 text-purple-800';
      case 'completed': return 'bg-emerald-100 text-emerald-800';
      case 'under_review': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get service type display name and icon
  const getServiceTypeInfo = (serviceType) => {
    const types = {
      'sale-deed': { name: 'Sale Deed', icon: '🏠', color: 'bg-blue-50 border-blue-200' },
      'will-deed': { name: 'Will Deed', icon: '📜', color: 'bg-green-50 border-green-200' },
      'trust-deed': { name: 'Trust Deed', icon: '🤝', color: 'bg-purple-50 border-purple-200' },
      'property-registration': { name: 'Property Registration', icon: '📋', color: 'bg-orange-50 border-orange-200' },
      'power-of-attorney': { name: 'Power of Attorney', icon: '⚖️', color: 'bg-red-50 border-red-200' },
      'adoption-deed': { name: 'Adoption Deed', icon: '👶', color: 'bg-pink-50 border-pink-200' },
      'contact-form': { name: 'Contact Form', icon: '📞', color: 'bg-gray-50 border-gray-200' }
    };
    return types[serviceType] || { name: serviceType, icon: '📄', color: 'bg-gray-50 border-gray-200' };
  };

  // Format date
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get progress percentage
  const getProgressPercentage = (form) => {
    if (form.progressPercentage) return form.progressPercentage;
    
    // Calculate based on status
    switch (form.status) {
      case 'draft': return 25;
      case 'submitted': return 50;
      case 'in-progress': return 75;
      case 'under_review': return 85;
      case 'completed': return 100;
      default: return 0;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Forms Data Management</h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage and monitor all submitted forms across all services
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-500">
              Total: {pagination.total} forms
            </div>
            <button
              onClick={loadForms}
              disabled={loading}
              className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors"
            >
              {loading ? 'Refreshing...' : 'Refresh'}
            </button>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-md ${viewMode === "grid" ? "bg-blue-100 text-blue-600" : "text-gray-400 hover:text-gray-600"}`}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-md ${viewMode === "list" ? "bg-blue-100 text-blue-600" : "text-gray-400 hover:text-gray-600"}`}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Service Type
            </label>
            <select
              value={filters.serviceType}
              onChange={(e) => handleFilterChange('serviceType', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="">All Services</option>
              <option value="sale-deed">Sale Deed</option>
              <option value="will-deed">Will Deed</option>
              <option value="trust-deed">Trust Deed</option>
              <option value="property-registration">Property Registration</option>
              <option value="power-of-attorney">Power of Attorney</option>
              <option value="adoption-deed">Adoption Deed</option>
              <option value="contact-form">Contact Form</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="">All Status</option>
              <option value="draft">Draft</option>
              <option value="submitted">Submitted</option>
              <option value="verified">Verified</option>
              <option value="rejected">Rejected</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Assigned To
            </label>
            <select
              value={filters.assignedTo}
              onChange={(e) => handleFilterChange('assignedTo', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="">All Staff</option>
              <option value="unassigned">Unassigned</option>
              {staffList.map(staff => (
                <option key={staff._id} value={staff._id}>
                  {staff.name} ({staff.role})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <input
              type="text"
              placeholder="Search by user email or form ID..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={() => setFilters({ serviceType: "", status: "", assignedTo: "", search: "" })}
              className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-sm"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Forms Display */}
      <div className="bg-white border rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">All Forms</h2>
            <div className="flex items-center space-x-2">
              <select
                value={pagination.limit}
                onChange={(e) => setPagination(prev => ({ ...prev, limit: parseInt(e.target.value), page: 1 }))}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm"
              >
                <option value={12}>12 per page</option>
                <option value={24}>24 per page</option>
                <option value={48}>48 per page</option>
              </select>
              <button
                onClick={loadForms}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
              >
                Refresh
              </button>
            </div>
          </div>
        </div>

        {loading && (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-sm text-gray-500">Loading forms...</p>
          </div>
        )}

        {error && (
          <div className="p-6 text-center">
            <div className="text-red-600 text-sm">{error}</div>
            <button
              onClick={loadForms}
              className="mt-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm"
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !error && (
          <>
            {viewMode === "grid" ? (
              // Grid View
              <div className="p-6">
                {forms.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-gray-400 text-4xl mb-4">📄</div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No forms found</h3>
                    <p className="text-gray-500">Try adjusting your filters or check back later.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {forms.map((form) => {
                      const serviceInfo = getServiceTypeInfo(form.serviceType);
                      const progress = getProgressPercentage(form);
                      
                      return (
                        <Link
                          key={form._id}
                          href={`/admin/forms-data/${form._id}`}
                          className="block"
                        >
                          <div className={`border-2 rounded-lg p-6 hover:shadow-lg transition-all duration-200 ${serviceInfo.color} hover:scale-105`}>
                            {/* Header */}
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex items-center space-x-2">
                                <span className="text-2xl">{serviceInfo.icon}</span>
                                <div>
                                  <h3 className="font-semibold text-gray-900 text-sm">
                                    {serviceInfo.name}
                                  </h3>
                                  <p className="text-xs text-gray-500 font-mono">
                                    {form._id.substring(0, 8)}...
                                  </p>
                                </div>
                              </div>
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(form.status)}`}>
                                {form.status}
                              </span>
                            </div>

                            {/* User Info */}
                            <div className="mb-4">
                              <div className="flex items-center space-x-2">
                                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                                  <span className="text-xs font-medium text-gray-600">
                                    {form.userId?.name ? form.userId.name.charAt(0).toUpperCase() : 'U'}
                                  </span>
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-gray-900">
                                    {form.userId?.name || 'Unknown User'}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {form.userId?.email || 'No email'}
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* Progress */}
                            <div className="mb-4">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs text-gray-600">Progress</span>
                                <span className="text-xs text-gray-600">{progress}%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                  style={{ width: `${progress}%` }}
                                ></div>
                              </div>
                            </div>

                            {/* Footer */}
                            <div className="flex items-center justify-between text-xs text-gray-500">
                              <span>Updated</span>
                              <span>{formatDate(form.lastActivityAt || form.updatedAt)}</span>
                            </div>

                            {/* Staff Assignment Info */}
                            {form.assignedTo && (
                              <div className="mt-3 pt-3 border-t border-gray-200">
                                <div className="flex items-center space-x-2">
                                  <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                                  </svg>
                                  <span className="text-blue-600 font-medium text-xs">
                                    Assigned to: {form.assignedTo?.name || 'Unknown Staff'}
                                  </span>
                                </div>
                              </div>
                            )}

                            {/* Admin Notes Indicator */}
                            {form.adminNotes && form.adminNotes.length > 0 && (
                              <div className="mt-3 pt-3 border-t border-gray-200">
                                <div className="flex items-center space-x-1">
                                  <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.725-1.36 3.49 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                  </svg>
                                  <span className="text-yellow-600 font-medium text-xs">
                                    {form.adminNotes.length} note{form.adminNotes.length > 1 ? 's' : ''}
                                  </span>
                                </div>
                              </div>
                            )}

                            {/* Action Buttons */}
                            <div className="mt-3 pt-3 border-t border-gray-200">
                              <div className="flex space-x-2">
                                {!form.assignedTo && form.status === 'submitted' && (
                                  <button
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      openAssignModal(form);
                                    }}
                                    className="flex-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 text-xs font-medium transition-colors"
                                  >
                                    Assign
                                  </button>
                                )}
                                {form.status === 'verified' && (
                                  <>
                                    <button
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        openApprovalModal(form, true);
                                      }}
                                      className="flex-1 px-3 py-1 bg-green-100 text-green-700 rounded-md hover:bg-green-200 text-xs font-medium transition-colors"
                                    >
                                      Approve
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        openApprovalModal(form, false);
                                      }}
                                      className="flex-1 px-3 py-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200 text-xs font-medium transition-colors"
                                    >
                                      Reject
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              // List View
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Form Details
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Assigned To
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Progress
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Last Updated
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {forms.map((form) => {
                      const serviceInfo = getServiceTypeInfo(form.serviceType);
                      const progress = getProgressPercentage(form);
                      
                      return (
                        <tr key={form._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-3">
                              <span className="text-2xl">{serviceInfo.icon}</span>
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {serviceInfo.name}
                                </div>
                                <div className="text-xs text-gray-500 font-mono">
                                  {form._id.substring(0, 12)}...
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-2">
                              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                                <span className="text-xs font-medium text-gray-600">
                                  {form.userId?.name ? form.userId.name.charAt(0).toUpperCase() : 'U'}
                                </span>
                              </div>
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {form.userId?.name || 'Unknown User'}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {form.userId?.email || 'No email'}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {form.assignedTo ? (
                              <div className="flex items-center space-x-2">
                                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                                  <span className="text-xs font-medium text-blue-600">
                                    {form.assignedTo.name ? form.assignedTo.name.charAt(0).toUpperCase() : 'S'}
                                  </span>
                                </div>
                                <div>
                                  <div className="text-sm font-medium text-gray-900">
                                    {form.assignedTo.name || 'Unknown Staff'}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {form.assignedTo.role || 'Staff'}
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <span className="text-sm text-gray-400 italic">Unassigned</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(form.status)}`}>
                              {form.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                                <div
                                  className="bg-blue-600 h-2 rounded-full"
                                  style={{ width: `${progress}%` }}
                                ></div>
                              </div>
                              <span className="text-xs text-gray-500">{progress}%</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(form.lastActivityAt || form.updatedAt)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center space-x-2">
                              <Link
                                href={`/admin/forms-data/${form._id}`}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                View
                              </Link>
                              {!form.assignedTo && form.status === 'submitted' && (
                                <button
                                  onClick={() => openAssignModal(form)}
                                  className="text-blue-600 hover:text-blue-900"
                                >
                                  Assign
                                </button>
                              )}
                              {form.status === 'verified' && (
                                <>
                                  <button
                                    onClick={() => openApprovalModal(form, true)}
                                    className="text-green-600 hover:text-green-900"
                                  >
                                    Approve
                                  </button>
                                  <button
                                    onClick={() => openApprovalModal(form, false)}
                                    className="text-red-600 hover:text-red-900"
                                  >
                                    Reject
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                {pagination.total} results
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                  disabled={pagination.page === 1}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-700">
                  Page {pagination.page} of {pagination.pages}
                </span>
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.pages, prev.page + 1) }))}
                  disabled={pagination.page === pagination.pages}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Staff Assignment Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Assign Form to Staff
              </h3>
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  Form: {selectedForm?.formTitle || 'Untitled Form'}
                </p>
                <p className="text-xs text-gray-500">
                  Service: {getServiceTypeInfo(selectedForm?.serviceType).name}
                </p>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Staff Member
                </label>
                <select
                  value={selectedStaff}
                  onChange={(e) => setSelectedStaff(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Choose a staff member...</option>
                  {staffList.map(staff => (
                    <option key={staff._id} value={staff._id}>
                      {staff.name} ({staff.role}) - {staff.department}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={handleAssignToStaff}
                  disabled={!selectedStaff}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                >
                  Assign Form
                </button>
                <button
                  onClick={() => {
                    setShowAssignModal(false);
                    setSelectedForm(null);
                    setSelectedStaff("");
                  }}
                  className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 text-sm font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Approval Modal */}
      {showApprovalModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {approvalData.approved ? 'Approve Form' : 'Reject Form'}
              </h3>
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  Form: {selectedForm?.formTitle || 'Untitled Form'}
                </p>
                <p className="text-xs text-gray-500">
                  Service: {getServiceTypeInfo(selectedForm?.serviceType).name}
                </p>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {approvalData.approved ? 'Approval Notes (Optional)' : 'Rejection Reason (Required)'}
                </label>
                <textarea
                  value={approvalData.reason}
                  onChange={(e) => setApprovalData(prev => ({ ...prev, reason: e.target.value }))}
                  placeholder={approvalData.approved ? 'Add any notes about the approval...' : 'Please provide a reason for rejection...'}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  required={!approvalData.approved}
                />
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={handleApproveForm}
                  disabled={!approvalData.approved && !approvalData.reason.trim()}
                  className={`flex-1 px-4 py-2 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium ${
                    approvalData.approved 
                      ? 'bg-green-600 hover:bg-green-700' 
                      : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  {approvalData.approved ? 'Approve Form' : 'Reject Form'}
                </button>
                <button
                  onClick={() => {
                    setShowApprovalModal(false);
                    setSelectedForm(null);
                    setApprovalData({ approved: true, reason: "" });
                  }}
                  className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 text-sm font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}