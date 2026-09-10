'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Save, Loader2, Trash2, Image as ImageIcon } from 'lucide-react';
import { getLiveContent, updateContent } from '@/lib/api-client';

function EditProjectContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectId = searchParams.get('id');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    slug: '',
    status: 'ACTIVE',
    category: 'Web Architecture & CMS',
    client: '',
    year: '2026',
    displayOrder: 1,
    imageUrl: '',
    url: '',
    techInput: '',
    shortDescription: '',
    description: '',
    lastUpdated: ''
  });

  useEffect(() => {
    async function fetchProject() {
      if (!projectId) return;
      try {
        const content = await getLiveContent();
        if (content && content.projectsList) {
          const project = content.projectsList.find((p: any) => p.id === projectId);
          if (project) {
            setFormData({
              id: project.id,
              name: project.name || '',
              slug: project.slug || '',
              status: project.status || 'ACTIVE',
              category: project.category || 'Web Architecture & CMS',
              client: project.client || '',
              year: project.year || '2026',
              displayOrder: Number(project.displayOrder) || 1,
              imageUrl: project.imageUrl || '',
              url: project.url || '',
              techInput: Array.isArray(project.tech) ? project.tech.join(', ') : '',
              shortDescription: project.shortDescription || '',
              description: project.description || '',
              lastUpdated: project.lastUpdated || ''
            });
          } else {
            alert("Project not found.");
            router.push('/admin/projects');
          }
        }
      } catch (err) {
        console.error("Failed to fetch project:", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchProject();
  }, [projectId, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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

      const updatedProject = {
        id: formData.id,
        name: formData.name,
        slug: formData.slug || formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        status: formData.status as any,
        category: formData.category,
        client: formData.client,
        year: formData.year,
        displayOrder: Number(formData.displayOrder) || 1,
        imageUrl: formData.imageUrl,
        url: formData.url,
        tech: techArray,
        shortDescription: formData.shortDescription,
        description: formData.description,
        lastUpdated: new Date().toISOString().split('T')[0]
      };
      
      const updatedList = projectsList.map((p: any) => p.id === formData.id ? updatedProject : p);
      
      await updateContent({ projectsList: updatedList });
      router.push('/admin/projects');
    } catch (err) {
      console.error(err);
      alert("Failed to update project.");
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this project? This cannot be undone.")) return;
    setIsSaving(true);
    try {
      const content = await getLiveContent();
      const projectsList = content?.projectsList || [];
      
      const updatedList = projectsList.filter((p: any) => p.id !== formData.id);
      
      await updateContent({ projectsList: updatedList });
      router.push('/admin/projects');
    } catch (err) {
      console.error(err);
      alert("Failed to delete project.");
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64 text-zinc-400">
        <Loader2 className="animate-spin text-emerald-400 w-8 h-8 mr-3" />
        <span className="text-xs font-mono">Loading Project...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto pb-24 text-white">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/projects" className="p-2 hover:bg-zinc-900 border border-zinc-800 rounded-lg transition-colors">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tight">Edit Project</h1>
            <p className="text-zinc-400 text-xs mt-1">Update details, slide order, and preview assets.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            type="button"
            onClick={handleDelete}
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-400 font-bold text-xs uppercase tracking-wider rounded-lg hover:bg-red-500/20 transition-colors disabled:opacity-50"
          >
            <Trash2 size={16} />
            <span>Delete</span>
          </button>
          <button 
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-400 text-black font-bold text-xs uppercase tracking-wider rounded-lg hover:bg-emerald-300 transition-colors disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="animate-spin w-4 h-4" /> : <Save size={16} />}
            <span>Save Changes</span>
          </button>
        </div>
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
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="slug" className="text-xs font-mono uppercase text-zinc-400">URL Slug *</label>
                <input 
                  id="slug" name="slug" type="text" required
                  value={formData.slug} onChange={handleChange}
                  className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white font-mono focus:outline-none focus:border-emerald-500" 
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="category" className="text-xs font-mono uppercase text-zinc-400">Category</label>
                <input 
                  id="category" name="category" type="text"
                  value={formData.category} onChange={handleChange}
                  className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500" 
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
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="year" className="text-xs font-mono uppercase text-zinc-400">Year</label>
                <input 
                  id="year" name="year" type="text"
                  value={formData.year} onChange={handleChange}
                  className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white font-mono focus:outline-none focus:border-emerald-500" 
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="techInput" className="text-xs font-mono uppercase text-zinc-400">Tech Stack (comma separated)</label>
              <input 
                id="techInput" name="techInput" type="text"
                value={formData.techInput} onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white font-mono focus:outline-none focus:border-emerald-500" 
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="shortDescription" className="text-xs font-mono uppercase text-zinc-400">Short Summary (Slideshow Card)</label>
              <textarea 
                id="shortDescription" name="shortDescription" rows={3}
                value={formData.shortDescription} onChange={handleChange}
                className="w-full px-3.5 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500" 
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="description" className="text-xs font-mono uppercase text-zinc-400">Full Description</label>
              <textarea 
                id="description" name="description" rows={5}
                value={formData.description} onChange={handleChange}
                className="w-full px-3.5 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500" 
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

export default function EditProject() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center h-64 text-zinc-400">
        <Loader2 className="animate-spin text-emerald-400 w-8 h-8 mr-3" />
        <span className="text-xs font-mono">Loading Editor...</span>
      </div>
    }>
      <EditProjectContent />
    </Suspense>
  );
}
