'use client';

import { useState, useEffect } from 'react';
import type { CapabilityItem } from '@/core/types';
import { getLiveContent, updateContent } from '@/lib/api-client';
import { Sparkles, Plus, Trash2, Save, Loader2, Check } from 'lucide-react';

export default function CapabilitiesAdminPage() {
  const [headerData, setHeaderData] = useState({
    tagline: 'WHAT WE DO',
    title: 'Studio Capabilities',
    description: 'One nexus for every digital solution - engineered with intent across 9 core disciplines.'
  });
  const [capabilities, setCapabilities] = useState<CapabilityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const content = await getLiveContent();
      if (content && content.capabilities) {
        if (content.capabilities.tagline) {
          setHeaderData({
            tagline: content.capabilities.tagline || 'WHAT WE DO',
            title: content.capabilities.title || 'Studio Capabilities',
            description: (content.capabilities.description || '').replace(/—/g, '-')
          });
        }
        if (Array.isArray(content.capabilities.list)) {
          const normalized: CapabilityItem[] = content.capabilities.list.map((c: any, i: number) => ({
            id: c.id || `cap-${i}-${(c.title || 'item').toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
            title: c.title || '',
            titleHi: c.titleHi || '',
            description: (c.description || '').replace(/—/g, '-'),
            descriptionHi: c.descriptionHi || '',
            icon: c.icon || 'Sparkles',
            category: c.category || 'Digital Strategy',
            featured: c.featured !== false,
            active: c.active !== false,
            displayOrder: c.displayOrder || (i + 1),
            tags: Array.isArray(c.tags) ? c.tags : []
          }));
          setCapabilities(normalized);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAdd = () => {
    const newItem: CapabilityItem = {
      id: `cap-${Date.now()}`,
      title: 'New Studio Capability',
      titleHi: '',
      description: 'Describe this capability and its architectural impact.',
      descriptionHi: '',
      icon: 'Sparkles',
      category: 'Digital Strategy',
      featured: true,
      active: true,
      displayOrder: capabilities.length + 1,
      tags: ['Strategy', 'Execution']
    } as any;
    setCapabilities([...capabilities, newItem]);
  };

  const handleRemove = (id: string) => {
    setCapabilities(prev => prev.filter(c => c.id !== id));
  };

  const handleUpdate = (id: string, field: keyof CapabilityItem, value: any) => {
    setCapabilities(prev => prev.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const handleTagsUpdate = (id: string, tagsString: string) => {
    const tags = tagsString.split(',').map(t => t.trim()).filter(Boolean);
    setCapabilities(prev => prev.map(c => c.id === id ? { ...c, tags } : c));
  };

  const handleSave = async () => {
    setSaving(true);
    setStatusMessage(null);
    try {
      const res = await updateContent({
        capabilities: {
          tagline: headerData.tagline,
          title: headerData.title,
          description: headerData.description,
          list: capabilities
        }
      });
      if (res.success) {
        setStatusMessage('Capabilities updated live to Hostinger storage.');
        setTimeout(() => setStatusMessage(null), 4000);
      } else {
        alert(res.message || 'Save failed.');
      }
    } catch (err: any) {
      alert(err.message || 'Error updating capabilities.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-zinc-400">
        <Loader2 className="w-8 h-8 text-emerald-400 animate-spin mr-3" />
        <span className="text-xs font-mono">Loading Capabilities...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl pb-24 text-white">
      {/* Top action header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight uppercase flex items-center gap-2.5">
            <Sparkles className="w-6 h-6 text-emerald-400" />
            <span>Studio Capabilities Management</span>
          </h1>
          <p className="text-zinc-400 text-xs sm:text-sm mt-1">
            Dynamic controls for infinite looping cards, icons, categories, tags, and section headers.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleAdd}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-xs font-semibold text-emerald-400 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Capability</span>
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center space-x-2 px-5 py-2.5 bg-emerald-400 hover:bg-emerald-300 text-black font-bold text-xs uppercase tracking-wider rounded-lg transition-colors disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Save Capabilities</span>
          </button>
        </div>
      </div>

      {statusMessage && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-xs text-emerald-300 flex items-center space-x-2">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Section Header Controls Card */}
      <div className="bg-zinc-950 border border-zinc-850 rounded-2xl p-6 space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-300 border-b border-zinc-850 pb-3">
          Section Header Details
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-mono uppercase text-zinc-400">Section Tagline</label>
            <input
              type="text"
              value={headerData.tagline}
              onChange={e => setHeaderData({ ...headerData, tagline: e.target.value })}
              className="w-full px-3.5 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-mono uppercase text-zinc-400">Section Title</label>
            <input
              type="text"
              value={headerData.title}
              onChange={e => setHeaderData({ ...headerData, title: e.target.value })}
              className="w-full px-3.5 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>
          <div className="md:col-span-2 space-y-1.5">
            <label className="text-xs font-mono uppercase text-zinc-400">Section Description</label>
            <textarea
              rows={2}
              value={headerData.description}
              onChange={e => setHeaderData({ ...headerData, description: e.target.value })}
              className="w-full px-3.5 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* Capability Cards List */}
      <div className="space-y-4">
        {capabilities.map((item, index) => (
          <div key={item.id || `cap-${index}`} className="bg-zinc-950 border border-zinc-850 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-850 pb-3">
              <div className="flex items-center space-x-2.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <h3 className="text-sm font-bold text-white">{item.title || 'Untitled Capability'}</h3>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={`active-${item.id}`}
                    checked={item.active}
                    onChange={e => handleUpdate(item.id, 'active', e.target.checked)}
                    className="rounded bg-zinc-900 border-zinc-800 text-emerald-500 focus:ring-emerald-500"
                  />
                  <label htmlFor={`active-${item.id}`} className="text-xs text-zinc-400 cursor-pointer">
                    Active
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={`feat-${item.id}`}
                    checked={item.featured}
                    onChange={e => handleUpdate(item.id, 'featured', e.target.checked)}
                    className="rounded bg-zinc-900 border-zinc-800 text-emerald-500 focus:ring-emerald-500"
                  />
                  <label htmlFor={`feat-${item.id}`} className="text-xs text-zinc-400 cursor-pointer">
                    Featured
                  </label>
                </div>
                <button
                  onClick={() => handleRemove(item.id)}
                  className="p-1.5 text-zinc-500 hover:text-red-400 transition-colors"
                  title="Remove Capability"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-mono uppercase text-zinc-400">Title (English)</label>
                <input
                  type="text"
                  value={item.title}
                  onChange={e => handleUpdate(item.id, 'title', e.target.value)}
                  className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-mono uppercase text-zinc-400">Category</label>
                <input
                  type="text"
                  value={item.category}
                  onChange={e => handleUpdate(item.id, 'category', e.target.value)}
                  className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
                  placeholder="e.g. Artificial Intelligence"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-mono uppercase text-zinc-400">Lucide Icon</label>
                <input
                  type="text"
                  value={item.icon}
                  onChange={e => handleUpdate(item.id, 'icon', e.target.value)}
                  className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                  placeholder="Cpu, Monitor, Video, Layers, PenTool, Globe, Shield..."
                />
              </div>

              <div className="sm:col-span-3 space-y-1">
                <label className="text-[11px] font-mono uppercase text-zinc-400">Tags (comma-separated pills)</label>
                <input
                  type="text"
                  value={Array.isArray(item.tags) ? item.tags.join(', ') : ''}
                  onChange={e => handleTagsUpdate(item.id, e.target.value)}
                  className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                  placeholder="e.g. LLMs, Chatbots, Pipelines, Workflow"
                />
              </div>

              <div className="sm:col-span-3 space-y-1">
                <label className="text-[11px] font-mono uppercase text-zinc-400">Description</label>
                <textarea
                  rows={2}
                  value={item.description}
                  onChange={e => handleUpdate(item.id, 'description', e.target.value)}
                  className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
