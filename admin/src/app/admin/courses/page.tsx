'use client';

import { useState, useEffect } from 'react';
import type { Course } from '@/core/types';
import { getCourses, updateCourses } from '@/lib/api-client';
import { GraduationCap, Sparkles, Save, Loader2, RefreshCw, Check } from 'lucide-react';

export default function CoursesAdminPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await getCourses();
      setCourses(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleUpdateField = (index: number, field: keyof Course, value: any) => {
    setCourses(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    setStatusMessage(null);
    try {
      const res = await updateCourses(courses);
      if (res.success) {
        setStatusMessage('Courses updated successfully.');
        setTimeout(() => setStatusMessage(null), 4000);
      } else {
        alert(res.message || 'Save failed.');
      }
    } catch (err: any) {
      alert(err.message || 'Failed to save courses.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-zinc-400">
        <Loader2 className="w-8 h-8 text-emerald-400 animate-spin mr-3" />
        <span className="text-sm font-mono">Loading Courses...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl text-white pb-24">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight uppercase flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-emerald-400" />
            <span>Course Track Management</span>
          </h1>
          <p className="text-zinc-400 text-xs mt-1">
            Configure educational tracks, descriptions, and linked booklet sequences.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={load}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 hover:text-white transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-emerald-400 hover:bg-emerald-300 text-black font-bold text-xs uppercase tracking-wider rounded-lg transition-colors disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Save All Tracks</span>
          </button>
        </div>
      </div>

      {statusMessage && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-xs text-emerald-300 flex items-center space-x-2">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      <div className="space-y-6">
        {courses.map((course, idx) => (
          <div key={course.id} className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-850 pb-3">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <h3 className="text-base font-bold text-white">{course.title}</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-900 text-zinc-400 uppercase">
                  {course.category}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id={`course-active-${course.id}`}
                  checked={course.active}
                  onChange={e => handleUpdateField(idx, 'active', e.target.checked)}
                  className="rounded bg-zinc-900 border-zinc-800 text-emerald-500 focus:ring-emerald-500"
                />
                <label htmlFor={`course-active-${course.id}`} className="text-xs text-zinc-300 cursor-pointer">
                  Active
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-300">Course Title</label>
                <input
                  type="text"
                  value={course.title}
                  onChange={e => handleUpdateField(idx, 'title', e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-300">Display Order</label>
                <input
                  type="number"
                  value={course.displayOrder}
                  onChange={e => handleUpdateField(idx, 'displayOrder', parseInt(e.target.value, 10) || 1)}
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className="text-xs font-semibold text-zinc-300">Description</label>
                <textarea
                  rows={2}
                  value={course.description}
                  onChange={e => handleUpdateField(idx, 'description', e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-zinc-300">Linked Booklet IDs (Comma-separated)</label>
                <input
                  type="text"
                  value={course.bookletIds.join(', ')}
                  onChange={e => handleUpdateField(idx, 'bookletIds', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs font-mono text-zinc-300 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
