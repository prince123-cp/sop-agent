import { useEffect, useMemo, useState } from 'react';
import { getSopList, updateSop, deleteSop } from '../../api/sop.api';

const SopList = () => {
  const [sops, setSops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState('');
  const [editForm, setEditForm] = useState({ name: '', department: '', version: '' });
  const [actionLoading, setActionLoading] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All');

  const fetchSops = async () => {
    try {
      setError('');
      const data = await getSopList();
      const normalized = Array.isArray(data) ? data : [];
      normalized.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      setSops(normalized);
    } catch (err) {
      setError(err?.message || 'Failed to load SOPs');
      console.error('Error fetching SOPs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSops();
  }, []);

  const handleEditClick = (sop) => {
    setEditingId(sop._id);
    setEditForm({
      name: sop.name || '',
      department: sop.department || '',
      version: sop.version || '',
    });
    setError('');
  };

  const handleCancelEdit = () => {
    setEditingId('');
    setEditForm({ name: '', department: '', version: '' });
  };

  const handleSaveEdit = async (id) => {
    try {
      setActionLoading(`save-${id}`);
      setError('');
      await updateSop(id, {
        name: editForm.name.trim(),
        department: editForm.department.trim(),
        version: editForm.version.trim(),
      });
      handleCancelEdit();
      await fetchSops();
    } catch (err) {
      setError(err?.message || 'Failed to update SOP');
    } finally {
      setActionLoading('');
    }
  };

  const handleDelete = async (id, name) => {
    const ok = window.confirm(`Delete SOP "${name}"? Ye action undo nahi hoga.`);
    if (!ok) return;

    try {
      setActionLoading(`delete-${id}`);
      setError('');
      await deleteSop(id);
      if (editingId === id) {
        handleCancelEdit();
      }
      await fetchSops();
    } catch (err) {
      setError(err?.message || 'Failed to delete SOP');
    } finally {
      setActionLoading('');
    }
  };

  const departments = useMemo(() => {
    const uniq = new Set(sops.map((sop) => (sop.department || 'Unknown').trim()));
    return ['All', ...Array.from(uniq).sort((a, b) => a.localeCompare(b))];
  }, [sops]);

  const filteredSops = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return sops.filter((sop) => {
      const byDept = departmentFilter === 'All' || (sop.department || 'Unknown').trim() === departmentFilter;
      if (!byDept) return false;
      if (!q) return true;
      const hay = `${sop.name || ''} ${sop.department || ''} ${sop.version || ''}`.toLowerCase();
      return hay.includes(q);
    });
  }, [sops, searchTerm, departmentFilter]);

  const stats = useMemo(() => {
    const total = sops.length;
    const deptCount = new Set(sops.map((sop) => (sop.department || 'Unknown').trim())).size;
    const latest = sops[0];
    return { total, deptCount, latest };
  }, [sops]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="h-20 animate-pulse rounded-xl bg-slate-100" />
          <div className="h-20 animate-pulse rounded-xl bg-slate-100" />
          <div className="h-20 animate-pulse rounded-xl bg-slate-100" />
        </div>
        <div className="h-64 animate-pulse rounded-xl bg-slate-100" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Total SOPs</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{stats.total}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Departments</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{stats.deptCount}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Latest Upload</p>
          <p className="mt-2 text-sm font-semibold text-slate-900">{stats.latest?.name || 'N/A'}</p>
          <p className="mt-1 text-xs text-slate-500">
            {stats.latest?.createdAt ? new Date(stats.latest.createdAt).toLocaleString() : '-'}
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex w-full flex-col gap-3 sm:flex-row">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by SOP name, department, version..."
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none sm:max-w-[220px]"
            >
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>
          <button
            type="button"
            onClick={fetchSops}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Refresh
          </button>
        </div>

        {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}

        {sops.length === 0 ? (
          <p className="mt-4 rounded-lg bg-slate-50 p-4 text-sm text-slate-600">No SOPs uploaded yet.</p>
        ) : filteredSops.length === 0 ? (
          <p className="mt-4 rounded-lg bg-slate-50 p-4 text-sm text-slate-600">No SOP matched your filters.</p>
        ) : (
          <div className="mt-4 overflow-x-auto rounded-lg border border-slate-200">
            <table className="min-w-full bg-white">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">SOP Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Department</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Version</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Created</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSops.map((sop) => (
                  <tr key={sop._id} className="hover:bg-slate-50/60">
                    <td className="px-4 py-3 text-sm font-medium text-slate-900">
                      {editingId === sop._id ? (
                        <input
                          type="text"
                          value={editForm.name}
                          onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))}
                          className="w-full rounded border border-slate-300 px-2 py-1 focus:border-blue-500 focus:outline-none"
                        />
                      ) : (
                        sop.name
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">
                      {editingId === sop._id ? (
                        <input
                          type="text"
                          value={editForm.department}
                          onChange={(e) => setEditForm((prev) => ({ ...prev, department: e.target.value }))}
                          className="w-full rounded border border-slate-300 px-2 py-1 focus:border-blue-500 focus:outline-none"
                        />
                      ) : (
                        sop.department
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">
                      {editingId === sop._id ? (
                        <input
                          type="text"
                          value={editForm.version}
                          onChange={(e) => setEditForm((prev) => ({ ...prev, version: e.target.value }))}
                          className="w-full rounded border border-slate-300 px-2 py-1 focus:border-blue-500 focus:outline-none"
                        />
                      ) : (
                        sop.version
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-500">
                      {sop.createdAt ? new Date(sop.createdAt).toLocaleString() : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-500">
                      <div className="flex flex-wrap gap-2">
                        {editingId === sop._id ? (
                          <>
                            <button
                              onClick={() => handleSaveEdit(sop._id)}
                              disabled={actionLoading === `save-${sop._id}`}
                              className="rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
                            >
                              {actionLoading === `save-${sop._id}` ? 'Saving...' : 'Save'}
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => handleEditClick(sop)}
                              className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(sop._id, sop.name)}
                              disabled={actionLoading === `delete-${sop._id}`}
                              className="rounded-md bg-rose-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-rose-700 disabled:opacity-50"
                            >
                              {actionLoading === `delete-${sop._id}` ? 'Deleting...' : 'Delete'}
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default SopList;
