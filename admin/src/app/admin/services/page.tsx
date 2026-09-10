'use client';

import { useState, useEffect } from 'react';
import { Save, Plus, Trash2, Loader2, Check, Wrench } from 'lucide-react';
import contentData from "@/data/content.json";
import { getLiveContent, updateContent } from '@/lib/api-client';

export default function ServicesCMS() {
  const [data, setData] = useState<any>(contentData.services || {
    tagline: 'HOW WE SERVE',
    title: 'Precision Services',
    description: 'Tailored engagements engineered from foundational concept to enterprise execution.',
    list: []
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const content = await getLiveContent();
        if (content && content.services) {
          setData(content.services);
        }
      } catch (err) {
        console.error("Failed to fetch live services:", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setStatusMessage(null);
    try {
      await updateContent({ services: data });
      setStatusMessage('Services saved successfully to Hostinger storage.');
      setTimeout(() => setStatusMessage(null), 4000);
    } catch (err) {
      console.error(err);
      alert("Failed to save services.");
    } finally {
      setIsSaving(false);
    }
  };

  const addService = () => {
    const currentList = Array.isArray(data.list) ? data.list : [];
    setData({
      ...data,
      list: [
        ...currentList,
        {
          id: `srv-${Date.now()}`,
          number: String(currentList.length + 1).padStart(2, '0'),
          title: 'New Service Engagement',
          category: 'Digital Strategy',
          description: 'Detailed scope and deliverables for this service engagement.',
          tags: ['Deliverable', 'Production']
        }
      ]
    });
  };

  const removeService = (index: number) => {
    const newList = [...data.list];
    newList.splice(index, 1);
    setData({ ...data, list: newList });
  };

  const updateService = (index: number, field: string, value: any) => {
    const newList = [...data.list];
    newList[index] = { ...newList[index], [field]: value };
    setData({ ...data, list: newList });
  };

  const updateServiceTags = (index: number, tagsString: string) => {
    const tags = tagsString.split(',').map(t => t.trim()).filter(Boolean);
    const newList = [...data.list];
    newList[index] = { ...newList[index], tags };
    setData({ ...data, list: newList });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64 text-zinc-400">
        <Loader2 className="animate-spin text-emerald-400 w-8 h-8 mr-3" />
        <span className="text-xs font-mono">Loading Services CMS...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 max-w-5xl pb-24 text-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight uppercase flex items-center gap-2.5">
            <Wrench className="w-6 h-6 text-emerald-400" />
            <span>Precision Services Management</span>
          </h1>
          <p className="text-zinc-400 text-xs sm:text-sm mt-1">
            Configure section header, numbered deliverables, service cards, and category badges.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={addService}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-xs font-semibold text-emerald-400 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Service</span>
          </button>
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex items-center space-x-2 px-5 py-2.5 bg-emerald-400 hover:bg-emerald-300 text-black font-bold text-xs uppercase tracking-wider rounded-lg transition-colors disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="animate-spin w-4 h-4" /> : <Save size={16} />}
            <span>Save Services</span>
          </button>
        </div>
      </div>

      {statusMessage && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-xs text-emerald-300 flex items-center space-x-2">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Header Section Details Card */}
      <div className="bg-zinc-950 border border-zinc-850 rounded-2xl p-6 space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-300 border-b border-zinc-850 pb-3">
          Services Section Header
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-mono uppercase text-zinc-400">Tagline</label>
            <input 
              type="text" 
              value={data.tagline || ''} 
              onChange={e => setData({...data, tagline: e.target.value})}
              className="w-full px-3.5 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500" 
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-mono uppercase text-zinc-400">Main Title</label>
            <input 
              type="text" 
              value={data.title || ''} 
              onChange={e => setData({...data, title: e.target.value})}
              className="w-full px-3.5 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500" 
            />
          </div>
          <div className="space-y-1.5 md:col-span-2">
            <label className="text-xs font-mono uppercase text-zinc-400">Description</label>
            <textarea 
              rows={2}
              value={data.description || ''} 
              onChange={e => setData({...data, description: e.target.value})}
              className="w-full px-3.5 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500" 
            />
          </div>
        </div>
      </div>

      {/* Service List Cards */}
      <div className="space-y-4">
        {(data.list || []).map((service: any, index: number) => (
          <div key={service.id || index} className="bg-zinc-950 border border-zinc-850 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-850 pb-3">
              <div className="flex items-center space-x-2.5">
                <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  {service.number || String(index + 1).padStart(2, '0')}
                </span>
                <h3 className="text-sm font-bold text-white">{service.title || 'Untitled Service'}</h3>
              </div>
              <button 
                onClick={() => removeService(index)}
                className="p-1.5 text-zinc-500 hover:text-red-400 transition-colors"
                title="Remove Service"
              >
                <Trash2 size={16} />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-mono uppercase text-zinc-400">Service Number</label>
                <input 
                  type="text" 
                  value={service.number || ''} 
                  onChange={e => updateService(index, 'number', e.target.value)}
                  className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white font-mono focus:outline-none focus:border-emerald-500" 
                  placeholder="01"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-mono uppercase text-zinc-400">Service Title</label>
                <input 
                  type="text" 
                  value={service.title || ''} 
                  onChange={e => updateService(index, 'title', e.target.value)}
                  className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white font-medium focus:outline-none focus:border-emerald-500" 
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-mono uppercase text-zinc-400">Category</label>
                <input 
                  type="text" 
                  value={service.category || ''} 
                  onChange={e => updateService(index, 'category', e.target.value)}
                  className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500" 
                  placeholder="e.g. Web Architecture"
                />
              </div>

              <div className="sm:col-span-3 space-y-1">
                <label className="text-[11px] font-mono uppercase text-zinc-400">Tags (comma-separated deliverables)</label>
                <input 
                  type="text" 
                  value={Array.isArray(service.tags) ? service.tags.join(', ') : ''} 
                  onChange={e => updateServiceTags(index, e.target.value)}
                  className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white font-mono focus:outline-none focus:border-emerald-500" 
                  placeholder="e.g. Full-Stack, Fast Load, Mobile-First"
                />
              </div>

              <div className="sm:col-span-3 space-y-1">
                <label className="text-[11px] font-mono uppercase text-zinc-400">Service Description</label>
                <textarea 
                  rows={2}
                  value={service.description || ''} 
                  onChange={e => updateService(index, 'description', e.target.value)}
                  className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500" 
                />
              </div>
            </div>
          </div>
        ))}

        {(!data.list || data.list.length === 0) && (
          <div className="p-8 text-center border border-dashed border-zinc-850 rounded-xl text-zinc-500 text-xs">
            No services added yet. Click &quot;Add Service&quot; to start.
          </div>
        )}
      </div>
    </div>
  );
}
