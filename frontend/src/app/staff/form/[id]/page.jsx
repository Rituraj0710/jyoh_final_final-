'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { AuthProvider } from '../../../../contexts/AuthContext';
import FormViewer from '../../../../components/RBAC/FormViewer';

export default function FormViewerPage() {
  const params = useParams();
  const formId = params.id;

  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FormViewer formId={formId} />
        </div>
      </div>
    </AuthProvider>
  );
}
