'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Loader2, Image as ImageIcon } from 'lucide-react';
import { getLiveContent, updateContent } from '@/lib/api-client';

export default function NewProject() {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    status: 'ACTIVE',
    category: 'Web Architecture & CMS',
    client: '',
    year: '2026',
    displayOrder: 1,
    imageUrl: '',
    url: '',
    techInput: 'Next.js 16, Tailwind CSS, Hostinger PHP API',
    shortDescription: '',
    description: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'name' && !formData.slug) {
      const generatedSlug = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      setFormData(prev => ({ ...prev, name: value, slug: generatedSlug }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return alert("Project name is required");
    setIsSaving(true);
    try {
      const content = await getLiveContent();
      const projectsList = content?.projectsList || [];
      
      const techArray = formData.techInput
        .split(',')
        .map(t => t.trim())
        .filter(Boolean);

      const newProject = {
        id: Date.now().toString(),
        name: formData.name,
        slug: formData.slug || formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        status: formData.status as any,
        category: formData.category,
        client: formData.client,
        year: formData.year,
        displayOrder: Number(formData.displayOrder) || (projectsList.length + 1),
        imageUrl: formData.imageUrl,
        url: formData.url,
        tech: techArray,
        shortDescription: formData.shortDescription,
        description: formData.description,
        lastUpdated: new Date().toISOString().split('T')[0]
      };
      
      await updateContent({ projectsList: [...projectsList, newProject] });
      router.push('/admin/projects');
    } catch (err) {
      console.error(err);
      alert("Failed to save project.");
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto pb-24 text-white">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/projects" className="p-2 hover:bg-zinc-900 border border-zinc-800 rounded-lg transition-colors">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tight">Create Portfolio Project</h1>
            <p className="text-zinc-400 text-xs mt-1">Draft or publish a showcase project for the equal-interval slideshow.</p>
          </div>
        </div>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-400 text-black font-bold text-xs uppercase tracking-wider rounded-lg hover:bg-emerald-300 transition-colors disabled:opacity-50"
        >
          {isSaving ? <Loader2 className="animate-spin w-4 h-4" /> : <Save size={16} />}
          <span>Save Project</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Details (2 cols) */}
        <div className="md:col-span-2 flex flex-col gap-6">
          <div className="bg-zinc-950 border border-zinc-850 rounded-2xl p-6 space-y-5">
            <div className="space-y-1.5">
              <label htmlFor="name" className="text-xs font-mono uppercase text-zinc-400">Project Name *</label>
              <input 
                id="name" name="name" type="text" required
                value={formData.name} onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500" 
                placeholder="e.g. Star Excellent Academy"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="slug" className="text-xs font-mono uppercase text-zinc-400">URL Slug *</label>
                <input 
                  id="slug" name="slug" type="text" required
                  value={formData.slug} onChange={handleChange}
                  className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white font-mono focus:outline-none focus:border-emerald-500" 
                  placeholder="star-excellent-academy"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="category" className="text-xs font-mono uppercase text-zinc-400">Category</label>
                <input 
                  id="category" name="category" type="text"
                  value={formData.category} onChange={handleChange}
                  className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500" 
                  placeholder="Web Architecture & CMS"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="client" className="text-xs font-mono uppercase text-zinc-400">Client Organization</label>
                <input 
                  id="client" name="client" type="text"
                  value={formData.client} onChange={handleChange}
                  className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500" 
                  placeholder="e.g. Star Excellent Trust"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="year" className="text-xs font-mono uppercase text-zinc-400">Year</label>
                <input 
                  id="year" name="year" type="text"
                  value={formData.year} onChange={handleChange}
                  className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white font-mono focus:outline-none focus:border-emerald-500" 
                  placeholder="2026"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="techInput" className="text-xs font-mono uppercase text-zinc-400">Tech Stack (comma separated)</label>
              <input 
                id="techInput" name="techInput" type="text"
                value={formData.techInput} onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white font-mono focus:outline-none focus:border-emerald-500" 
                placeholder="Next.js 16, Tailwind CSS, Hostinger PHP API"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="shortDescription" className="text-xs font-mono uppercase text-zinc-400">Short Summary (Slideshow Card)</label>
              <textarea 
                id="shortDescription" name="shortDescription" rows={3}
                value={formData.shortDescription} onChange={handleChange}
                className="w-full px-3.5 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500" 
                placeholder="One or two punchy sentences describing this project..."
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="description" className="text-xs font-mono uppercase text-zinc-400">Full Description</label>
              <textarea 
                id="description" name="description" rows={5}
                value={formData.description} onChange={handleChange}
                className="w-full px-3.5 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500" 
                placeholder="Comprehensive overview of architecture, deliverables, and engineering..."
              />
            </div>
          </div>
        </div>

        {/* Sidebar Settings (1 col) */}
        <div className="flex flex-col gap-6">
          <div className="bg-zinc-950 border border-zinc-850 rounded-2xl p-6 space-y-4">
            <h2 className="font-bold text-sm uppercase tracking-wider text-zinc-300 border-b border-zinc-850 pb-3">
              Status & Display
            </h2>
            
            <div className="space-y-1.5">
              <label htmlFor="status" className="text-xs font-mono uppercase text-zinc-400">Status</label>
              <select 
                id="status" name="status" 
                value={formData.status} onChange={handleChange}
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="ACTIVE">ACTIVE (In Slideshow)</option>
                <option value="DRAFT">DRAFT (Hidden)</option>
                <option value="ARCHIVED">ARCHIVED</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="displayOrder" className="text-xs font-mono uppercase text-zinc-400">Slide Order</label>
              <input 
                id="displayOrder" name="displayOrder" type="number"
                min="1" max="99"
                value={formData.displayOrder} onChange={handleChange}
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white font-mono focus:outline-none focus:border-emerald-500" 
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="url" className="text-xs font-mono uppercase text-zinc-400">Live Website URL</label>
              <input 
                id="url" name="url" type="url"
                value={formData.url} onChange={handleChange}
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white font-mono focus:outline-none focus:border-emerald-500" 
                placeholder="https://..."
              />
            </div>
          </div>

          <div className="bg-zinc-950 border border-zinc-850 rounded-2xl p-6 space-y-4">
            <h2 className="font-bold text-sm uppercase tracking-wider text-zinc-300 border-b border-zinc-850 pb-3">
              Showcase Preview Media
            </h2>
            
            <div className="space-y-1.5">
              <label htmlFor="imageUrl" className="text-xs font-mono uppercase text-zinc-400">Image URL</label>
              <input 
                id="imageUrl" name="imageUrl" type="url"
                value={formData.imageUrl} onChange={handleChange}
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white font-mono focus:outline-none focus:border-emerald-500" 
                placeholder="https://images.unsplash.com/..."
              />
            </div>

            {formData.imageUrl ? (
              <div className="relative aspect-video rounded-lg overflow-hidden border border-zinc-800 bg-black">
                <img 
                  src={formData.imageUrl} 
                  alt="Preview" 
                  className="w-full h-full object-cover" 
                  onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                />
              </div>
            ) : (
              <div className="aspect-video bg-zinc-900/60 rounded-lg border border-dashed border-zinc-800 flex flex-col items-center justify-center p-4 text-center">
                <ImageIcon className="w-6 h-6 text-zinc-600 mb-2" />
                <span className="text-[11px] text-zinc-500">Paste an image URL above to preview</span>
              </div>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
