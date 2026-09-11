'use client';

import { useState, useEffect } from 'react';
import type { ReaderRecord } from '@/core/types';
import { getReaders, deleteReader, getReadersCsvExportUrl } from '@/lib/api-client';
import { Users, Download, Search, Trash2, Loader2, RefreshCw, CheckCircle2 } from 'lucide-react';

export default function ReadersAdminPage() {
  const [readers, setReaders] = useState<ReaderRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [courseFilter, setCourseFilter] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadReaders = async () => {
    setLoading(true);
    try {
      const res = await getReaders(search, courseFilter);
      setReaders(res.readers || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReaders();
  }, [courseFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadReaders();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this reader registration?')) return;
    setDeletingId(id);
    try {
      const res = await deleteReader(id);
      if (res.success) {
        setReaders(prev => prev.filter(r => r.id !== id));
      } else {
        alert(res.message || 'Delete failed.');
      }
    } catch (err: any) {
      alert(err.message || 'Error deleting reader.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white uppercase flex items-center gap-2">
            <Users className="w-6 h-6 text-emerald-400" />
            <span>Reader Leads & Course Visitors</span>
          </h1>
          <p className="text-zinc-400 text-xs mt-1">
            Registered educational course participants with explicit privacy consent records.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <a
            href={getReadersCsvExportUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-xs font-semibold text-zinc-200 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Export CSV</span>
          </a>
          <button
            onClick={loadReaders}
            className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search name, email, institution..."
            className="w-full pl-9 pr-4 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
          />
        </form>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <span className="text-xs text-zinc-500">Filter Course:</span>
          <select
            value={courseFilter}
            onChange={e => setCourseFilter(e.target.value)}
            className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-300 focus:outline-none focus:border-emerald-500"
          >
            <option value="">All Courses</option>
            <option value="students-ai">Students AI Course</option>
            <option value="teachers-ai">Educators AI Toolkit</option>
          </select>
        </div>
      </div>

      {/* Readers Table */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-900/60 border-b border-zinc-800 text-zinc-400 uppercase tracking-wider text-[10px] font-mono">
              <tr>
                <th className="px-4 py-3">Visitor Name</th>
                <th className="px-4 py-3">Email & WhatsApp</th>
                <th className="px-4 py-3">Demographics & City</th>
                <th className="px-4 py-3">Industry & Intent</th>
                <th className="px-4 py-3">Role / Org</th>
                <th className="px-4 py-3">Course</th>
                <th className="px-4 py-3">Registered At</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900 text-zinc-300">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-zinc-500">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-400" />
                    <span>Loading reader records...</span>
                  </td>
                </tr>
              ) : readers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-zinc-500">
                    No reader registrations found yet.
                  </td>
                </tr>
              ) : (
                readers.map((r) => (
                  <tr key={r.id} className="hover:bg-zinc-900/40 transition-colors">
                    <td className="px-4 py-3 font-semibold text-white">
                      <span>{r.name}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="block font-mono text-[11px] text-zinc-300">{r.contact}</span>
                      {r.phone && (
                        <span className="block font-mono text-[10px] text-emerald-400">{r.phone}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {r.city && <span className="block text-zinc-300">{r.city}</span>}
                      {r.ageGroup && <span className="block text-[10px] text-zinc-500 font-mono">Age: {r.ageGroup}</span>}
                    </td>
                    <td className="px-4 py-3">
                      {r.industry && <span className="block text-zinc-300 text-[11px]">{r.industry}</span>}
                      {r.intent && <span className="block text-[10px] text-emerald-400/90 font-mono truncate max-w-[180px]">{r.intent}</span>}
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-medium text-zinc-300">{r.role}</span>
                      {r.institution && (
                        <span className="block text-[11px] text-zinc-500">{r.institution}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-900 border border-zinc-800 text-emerald-400">
                        {r.courseSelected}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-[11px] text-zinc-500">
                      {new Date(r.registeredAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleDelete(r.id)}
                        disabled={deletingId === r.id}
                        className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                        title="Delete record"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
