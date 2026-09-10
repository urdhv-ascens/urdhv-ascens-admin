'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Loader2, Save, Check, Clock, Play, Trash2, ArrowRight } from 'lucide-react';
import contentData from "@/data/content.json";
import { getLiveContent, updateContent } from '@/lib/api-client';
import type { ProjectItem } from '@/core/types';

export default function ProjectsCMS() {
  const [projectsMeta, setProjectsMeta] = useState({
    tagline: 'SELECTED WORK',
    title: 'Curated Projects',
    description: 'Digital systems and client flagship productions delivered with precision.',
    intervalSeconds: 5,
    autoPlay: true
  });

  const [projects, setProjects] = useState<ProjectItem[]>((contentData.projectsList as unknown as ProjectItem[]) || []);
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingMeta, setIsSavingMeta] = useState(false);
  const [metaMessage, setMetaMessage] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProjects() {
      try {
        const content = await getLiveContent();
        if (content) {
          if ((content as any).projects) {
            setProjectsMeta({
              tagline: (content as any).projects.tagline || 'SELECTED WORK',
              title: (content as any).projects.title || 'Curated Projects',
              description: (content as any).projects.description || '',
              intervalSeconds: Number((content as any).projects.intervalSeconds) || 5,
              autoPlay: (content as any).projects.autoPlay !== false
            });
          }
          if (content.projectsList && Array.isArray(content.projectsList)) {
            setProjects(content.projectsList);
          }
        }
      } catch (err) {
        console.error("Failed to fetch projects data:", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchProjects();
  }, []);

  const handleSaveMeta = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingMeta(true);
    setMetaMessage(null);
    try {
      await updateContent({
        projects: {
          tagline: projectsMeta.tagline,
          title: projectsMeta.title,
          description: projectsMeta.description,
          intervalSeconds: Number(projectsMeta.intervalSeconds),
          autoPlay: projectsMeta.autoPlay
        }
      } as any);
      setMetaMessage('Slideshow settings saved successfully.');
      setTimeout(() => setMetaMessage(null), 4000);
    } catch (err) {
      console.error(err);
      alert('Failed to save slideshow settings.');
    } finally {
      setIsSavingMeta(false);
    }
  };

  const handleDeleteProject = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete project "${name}"? This cannot be undone.`)) return;
    try {
      const updatedList = projects.filter(p => p.id !== id);
      setProjects(updatedList);
      await updateContent({ projectsList: updatedList });
    } catch (err) {
      console.error(err);
      alert('Failed to delete project.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64 text-zinc-400">
        <Loader2 className="animate-spin text-emerald-400 w-8 h-8 mr-3" />
        <span className="text-xs font-mono">Loading Projects CMS...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 max-w-6xl pb-24 text-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight uppercase">
            Curated Projects & Slideshow
          </h1>
          <p className="text-zinc-400 text-xs sm:text-sm mt-1">
            Configure section header, equal-interval timing, and individual portfolio pieces. Zero hardcoded values.
          </p>
        </div>
        <Link 
          href="/admin/projects/new" 
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-400 text-black font-bold text-xs uppercase tracking-wider rounded-lg hover:bg-emerald-300 transition-colors"
        >
          <Plus size={16} />
          <span>New Project</span>
        </Link>
      </div>

      {/* Slideshow & Equal-Interval Settings Card */}
      <form onSubmit={handleSaveMeta} className="bg-zinc-950 border border-zinc-850 rounded-2xl p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-850 pb-4">
          <div className="flex items-center space-x-2.5">
            <Clock className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-bold text-white uppercase tracking-wide">
              Slideshow Engine & Header Settings
            </h2>
          </div>
          <button
            type="submit"
            disabled={isSavingMeta}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-emerald-400 hover:bg-emerald-300 text-black font-bold text-xs uppercase tracking-wider rounded-lg transition-colors disabled:opacity-50"
          >
            {isSavingMeta ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Save Settings</span>
          </button>
        </div>

        {metaMessage && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-xs text-emerald-300 flex items-center space-x-2">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{metaMessage}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-1.5">
            <label className="text-xs font-mono text-zinc-400 uppercase">Tagline</label>
            <input
              type="text"
              value={projectsMeta.tagline}
              onChange={e => setProjectsMeta({ ...projectsMeta, tagline: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
              placeholder="SELECTED WORK"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-mono text-zinc-400 uppercase">Main Title</label>
            <input
              type="text"
              value={projectsMeta.title}
              onChange={e => setProjectsMeta({ ...projectsMeta, title: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
              placeholder="Curated Projects"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-mono text-zinc-400 uppercase">
              Equal Interval Duration: <span className="text-emerald-400 font-bold">{projectsMeta.intervalSeconds}s</span>
            </label>
            <div className="flex items-center space-x-3 pt-1">
              <input
                type="range"
                min="2"
                max="20"
                step="1"
                value={projectsMeta.intervalSeconds}
                onChange={e => setProjectsMeta({ ...projectsMeta, intervalSeconds: Number(e.target.value) })}
                className="w-full accent-emerald-400"
              />
              <span className="text-xs font-mono text-zinc-300 w-12 text-right">{projectsMeta.intervalSeconds} sec</span>
            </div>
          </div>

          <div className="md:col-span-2 space-y-1.5">
            <label className="text-xs font-mono text-zinc-400 uppercase">Section Description</label>
            <textarea
              rows={2}
              value={projectsMeta.description}
              onChange={e => setProjectsMeta({ ...projectsMeta, description: e.target.value })}
              className="w-full px-3.5 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
              placeholder="Describe this section..."
            />
          </div>

          <div className="flex items-center space-x-3 pt-4">
            <input
              type="checkbox"
              id="autoPlay"
              checked={projectsMeta.autoPlay}
              onChange={e => setProjectsMeta({ ...projectsMeta, autoPlay: e.target.checked })}
              className="rounded bg-zinc-900 border-zinc-700 text-emerald-500 focus:ring-emerald-500 w-4 h-4"
            />
            <label htmlFor="autoPlay" className="text-xs font-semibold text-zinc-300 cursor-pointer">
              Enable Looping Autoplay
            </label>
          </div>
        </div>
      </form>

      {/* Projects Table */}
      <div className="bg-zinc-950 border border-zinc-850 rounded-2xl overflow-hidden shadow-xl">
        <div className="px-6 py-4 border-b border-zinc-850 flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-300">
            Portfolio Items ({projects.length})
          </h2>
          <span className="text-xs font-mono text-zinc-500">
            Slide Order: Ascending (1, 2, 3...)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-zinc-850 bg-zinc-900/60 text-zinc-400 font-mono">
                <th className="px-6 py-3.5 font-medium">Order</th>
                <th className="px-6 py-3.5 font-medium">Project Name</th>
                <th className="px-6 py-3.5 font-medium">Category</th>
                <th className="px-6 py-3.5 font-medium">Client</th>
                <th className="px-6 py-3.5 font-medium">Year</th>
                <th className="px-6 py-3.5 font-medium">Status</th>
                <th className="px-6 py-3.5 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-850/60">
              {projects.map((project, idx) => (
                <tr key={project.id || idx} className="hover:bg-zinc-900/40 transition-colors">
                  <td className="px-6 py-4 font-mono text-zinc-500">{project.displayOrder || idx + 1}</td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-white">{project.name}</div>
                    <div className="text-[11px] font-mono text-zinc-500">{project.slug}</div>
                  </td>
                  <td className="px-6 py-4 text-zinc-300">{project.category}</td>
                  <td className="px-6 py-4 text-zinc-400">{project.client || '-'}</td>
                  <td className="px-6 py-4 font-mono text-zinc-400">{project.year || '-'}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded-md uppercase ${
                      project.status === 'ACTIVE' 
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' 
                        : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                    }`}>
                      {project.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-3">
                    <Link 
                      href={`/admin/projects/edit?id=${project.id}`} 
                      className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDeleteProject(project.id, project.name)}
                      className="text-xs font-semibold text-zinc-500 hover:text-red-400 transition-colors"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {projects.length === 0 && (
          <div className="p-12 text-center text-zinc-500 flex flex-col items-center gap-3 text-xs">
            <p>No projects found. Create your first project to populate the slideshow.</p>
            <Link 
              href="/admin/projects/new" 
              className="px-4 py-2 bg-zinc-900 text-white font-semibold rounded-lg hover:bg-zinc-800 transition-colors"
            >
              Create Project
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
