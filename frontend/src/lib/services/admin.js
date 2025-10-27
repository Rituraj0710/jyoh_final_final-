export const getApiBaseUrl = () => process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4001';

export const adminFetch = async (path, options = {}) => {
  const base = getApiBaseUrl();
  const url = `${base}${path.startsWith('/') ? path : `/${path}`}`;
  const headers = new Headers(options.headers || {});
  
  // Set default Content-Type for POST requests
  if (['POST','PUT','PATCH'].includes((options.method || 'GET').toUpperCase()) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  
  if (typeof window !== 'undefined'){
    const token = localStorage.getItem('access_token');
    console.log('🔍 AdminFetch Debug:', {
      path,
      url,
      hasToken: !!token,
      tokenPreview: token ? token.substring(0, 20) + '...' : 'none',
      method: options.method
    });
    if (token) headers.set('authorization', `Bearer ${token}`);
  }
  
  console.log('🔍 Making request to:', url);
  console.log('🔍 Request headers:', Object.fromEntries(headers.entries()));
  
  const res = await fetch(url, { ...options, headers, credentials: 'include' });
  const data = await res.json().catch(() => ({}));
  
  console.log('🔍 Response status:', res.status);
  console.log('🔍 Response data:', data);
  
  if (!res.ok || (data && data.success === false)){
    const message = data?.message || `Request failed: ${res.status}`;
    console.error('❌ AdminFetch Error:', {
      status: res.status,
      ok: res.ok,
      dataSuccess: data?.success,
      message
    });
    const error = new Error(message);
    error.status = res.status;
    error.data = data;
    throw error;
  }
  return data;
};


