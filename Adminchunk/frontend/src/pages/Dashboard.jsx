import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getSopList } from '../api/sop.api.js';

const formatDateTime = (value) => {
  if (!value) return 'N/A';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return 'N/A';
  return d.toLocaleString();
};

const Dashboard = () => {
  const [sops, setSops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getSopList();
        const normalized = Array.isArray(data) ? data : [];
        normalized.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        setSops(normalized);
      } catch (err) {
        setError(err?.message || 'Dashboard data load failed');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const insights = useMemo(() => {
    const total = sops.length;
    const departments = new Map();
    const versions = new Set();

    for (const sop of sops) {
      const dept = (sop.department || 'Unknown').trim();
      departments.set(dept, (departments.get(dept) || 0) + 1);
      if (sop.version) versions.add(sop.version.trim());
    }

    const topDepartments = Array.from(departments.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4);

    return {
      total,
      departmentCount: departments.size,
      versionCount: versions.size,
      latest: sops[0] || null,
      topDepartments,
      recent: sops.slice(0, 5),
    };
  }, [sops]);

  return (
    <div className="mx-auto max-w-7xl p-4 md:p-6">
      <section className="rounded-3xl bg-gradient-to-r from-slate-900 via-blue-900 to-cyan-800 p-6 text-white shadow-lg md:p-8">
        <p className="text-xs uppercase tracking-[0.2em] text-blue-200">SOP Command Center</p>
        <h1 className="mt-2 text-3xl font-bold md:text-4xl">Dashboard</h1>
        <p className="mt-3 max-w-3xl text-sm text-blue-100">
          SOP uploads, department coverage, and assistant readiness ek jagah.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            to="/chat"
            className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-100"
          >
            Open Assistant
          </Link>
          <Link
            to="/upload"
            className="rounded-xl border border-blue-300/40 bg-blue-600/40 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-600/60"
          >
            Upload New SOP
          </Link>
          <Link
            to="/sop-list"
            className="rounded-xl border border-blue-300/40 bg-transparent px-4 py-2 text-sm font-semibold text-white hover:bg-white/10"
          >
            Manage SOP List
          </Link>
        </div>
      </section>

      {error ? <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}

      <section className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-slate-500">Total SOPs</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{loading ? '...' : insights.total}</p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-slate-500">Departments Covered</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{loading ? '...' : insights.departmentCount}</p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-slate-500">Version Variants</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{loading ? '...' : insights.versionCount}</p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-slate-500">Last Upload</p>
          <p className="mt-2 text-sm font-semibold text-slate-900">
            {loading ? 'Loading...' : formatDateTime(insights.latest?.createdAt)}
          </p>
          <p className="mt-1 text-xs text-slate-500">{insights.latest?.name || 'No uploads yet'}</p>
        </article>
      </section>

      <section className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm xl:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Recent SOP Uploads</h2>
            <Link to="/sop-list" className="text-sm font-medium text-blue-700 hover:text-blue-900">
              View all
            </Link>
          </div>

          {loading ? (
            <p className="text-sm text-slate-500">Loading recent uploads...</p>
          ) : insights.recent.length === 0 ? (
            <p className="text-sm text-slate-500">No SOP uploaded yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="text-left text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="py-2 pr-3">Name</th>
                    <th className="py-2 pr-3">Department</th>
                    <th className="py-2 pr-3">Version</th>
                    <th className="py-2">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {insights.recent.map((sop) => (
                    <tr key={sop._id}>
                      <td className="py-3 pr-3 font-medium text-slate-900">{sop.name || 'N/A'}</td>
                      <td className="py-3 pr-3">{sop.department || 'N/A'}</td>
                      <td className="py-3 pr-3">{sop.version || 'N/A'}</td>
                      <td className="py-3">{formatDateTime(sop.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Top Departments</h2>
          <p className="mt-1 text-xs text-slate-500">SOP volume by department</p>
          <div className="mt-4 space-y-3">
            {loading ? (
              <p className="text-sm text-slate-500">Loading department stats...</p>
            ) : insights.topDepartments.length === 0 ? (
              <p className="text-sm text-slate-500">No department data available.</p>
            ) : (
              insights.topDepartments.map(([name, count]) => {
                const width = insights.total ? Math.max(8, Math.round((count / insights.total) * 100)) : 0;
                return (
                  <div key={name}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="font-medium text-slate-800">{name}</span>
                      <span className="text-slate-500">{count}</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100">
                      <div className="h-2 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500" style={{ width: `${width}%` }} />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </article>
      </section>

      <section className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-base font-semibold text-slate-900">Assistant Readiness</h3>
          <p className="mt-2 text-sm text-slate-600">
            SOP assistant best perform karta hai jab documents ka metadata clear ho aur versioning consistent ho.
          </p>
          <ul className="mt-3 space-y-2 text-sm text-slate-700">
            <li>- SOP name meaningful rakhein (example: Refund Policy v2).</li>
            <li>- Department field standardized rakhein (HR, Finance, Operations).</li>
            <li>- Naye version upload hote hi purana version review karein.</li>
          </ul>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-base font-semibold text-slate-900">Quick Actions</h3>
          <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
            <Link to="/upload" className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
              Upload SOP
            </Link>
            <Link to="/sop-list" className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
              Edit/Delete SOP
            </Link>
            <Link to="/chat" className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
              Ask SOP
            </Link>
            <Link to="/admin" className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
              Admin Panel
            </Link>
          </div>
        </article>
      </section>
    </div>
  );
};

export default Dashboard;
