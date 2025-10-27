"use client";
import { useCallback, useEffect, useMemo, useState } from 'react';
import { adminFetch } from '@/lib/services/admin';

const buildQuery = (params) => {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === '') return;
    searchParams.set(k, String(v));
  });
  const qs = searchParams.toString();
  return qs ? `?${qs}` : '';
};

export function useAdminList(endpoint, initial = {}){
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(initial.page || 1);
  const [limit, setLimit] = useState(initial.limit || 10);
  const [search, setSearch] = useState(initial.search || '');
  const [sort, setSort] = useState(initial.sort || 'createdAt:desc');
  const [filters, setFilters] = useState(initial.filters || {});

  const query = useMemo(() => ({ page, limit, search, sort, ...filters }), [page, limit, search, sort, filters]);

  const load = useCallback(async () => {
    try{
      setLoading(true);
      setError('');
      const qs = buildQuery(query);
      const data = await adminFetch(`${endpoint}${qs}`);
      setItems(data.items || data.users || data.agents || data.forms || []);
      setTotal(data.total || 0);
    }catch(e){
      setError(e.message || 'Failed to load');
    }finally{
      setLoading(false);
    }
  }, [endpoint, query]);

  useEffect(() => { load(); }, [load]);

  // simple debounce for search
  const updateSearch = useCallback((val) => {
    setPage(1);
    setSearch(val);
  }, []);

  return {
    items, total, loading, error,
    page, setPage,
    limit, setLimit,
    search, setSearch: updateSearch,
    sort, setSort,
    filters, setFilters,
    reload: load,
  };
}


