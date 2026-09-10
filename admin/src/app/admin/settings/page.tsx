'use client';

import { useState, useEffect } from 'react';
import { Save, Loader2 } from 'lucide-react';
import contentData from "@/data/content.json";
import { getLiveContent, updateContent } from '@/lib/api-client';

export default function SiteSettings() {
  const [data, setData] = useState<any>(contentData);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const content = await getLiveContent();
        if (content) {
          setData({ ...contentData, ...content } as any);
        }
      } catch (err) {
        console.error("Failed to fetch live settings:", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateContent(data);
      alert("Settings saved successfully to Hostinger Control Center!");
    } catch (err) {
      console.error(err);
      alert("Failed to save settings.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin text-primary w-8 h-8" /></div>;
  }

  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto pb-24">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Site Settings & Content</h2>
          <p className="text-muted-foreground mt-2">Manage the core messaging and configuration for the delivery plane.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-6 py-2.5 bg-emerald-400 text-black font-bold text-xs uppercase tracking-wider rounded-lg hover:bg-emerald-300 transition-colors disabled:opacity-50"
        >
          {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          <span>{isSaving ? "Saving..." : "Save & Publish"}</span>
        </button>
      </div>

      <div className="grid gap-8">
        
        {/* Global Settings */}
        <section className="bg-card border border-border rounded-xl p-6 flex flex-col gap-6">
          <h3 className="text-xl font-semibold border-b border-border pb-4">Global Brand Settings</h3>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Company Name</label>
            <input 
              type="text" 
              value={data.siteSettings.companyName} 
              onChange={e => setData({...data, siteSettings: {...data.siteSettings, companyName: e.target.value}})}
              className="px-4 py-2 bg-background border border-border rounded-lg" 
            />
          </div>
        </section>

        {/* Hero Section */}
        <section className="bg-card border border-border rounded-xl p-6 flex flex-col gap-6">
          <h3 className="text-xl font-semibold border-b border-border pb-4">Hero Section & Background</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Tagline</label>
              <input 
                type="text" 
                value={data.hero?.tagline || ''} 
                onChange={e => setData({...data, hero: {...data.hero, tagline: e.target.value}})}
                className="px-4 py-2 bg-background border border-border rounded-lg text-sm" 
              />
            </div>
            <div className="flex flex-col gap-2 md:col-span-2">
              <label className="text-sm font-medium">Main Title (H1)</label>
              <input 
                type="text" 
                value={data.hero?.title || ''} 
                onChange={e => setData({...data, hero: {...data.hero, title: e.target.value}})}
                className="px-4 py-2 bg-background border border-border rounded-lg text-lg font-bold" 
              />
            </div>
            <div className="flex flex-col gap-2 md:col-span-2">
              <label className="text-sm font-medium">Description</label>
              <textarea 
                rows={3}
                value={data.hero?.description || ''} 
                onChange={e => setData({...data, hero: {...data.hero, description: e.target.value}})}
                className="px-4 py-2 bg-background border border-border rounded-lg text-sm" 
              />
            </div>

            {/* Hero Background Image Settings */}
            <div className="flex flex-col gap-2 md:col-span-2 pt-2 border-t border-border">
              <label className="text-sm font-bold text-emerald-400 uppercase tracking-wider">
                Hero Background Image (Blurred)
              </label>
              <div className="grid md:grid-cols-3 gap-4 mt-2">
                <div className="flex flex-col gap-1.5 md:col-span-2">
                  <span className="text-xs text-muted-foreground">Image URL or Local Asset Path</span>
                  <input
                    type="text"
                    value={data.hero?.backgroundImage || '/assets/images/favicon.png'}
                    onChange={e => setData({...data, hero: {...data.hero, backgroundImage: e.target.value}})}
                    placeholder="/assets/images/favicon.png"
                    className="px-4 py-2 bg-background border border-border rounded-lg font-mono text-xs"
                  />
                  <p className="text-[11px] text-zinc-500 mt-1">
                    Default: <code className="text-emerald-400 font-mono">/assets/images/favicon.png</code>. You can paste any media URL or uploaded image path.
                  </p>
                </div>

                <div className="flex flex-col gap-1.5">
                  <span className="text-xs text-muted-foreground">
                    Blur Intensity: {data.hero?.backgroundBlur ?? 32}px
                  </span>
                  <input
                    type="range"
                    min="4"
                    max="64"
                    step="4"
                    value={data.hero?.backgroundBlur ?? 32}
                    onChange={e => setData({...data, hero: {...data.hero, backgroundBlur: Number(e.target.value)}})}
                    className="w-full accent-emerald-400"
                  />
                  <span className="text-xs text-muted-foreground mt-2">
                    Opacity: {data.hero?.backgroundOpacity ?? 20}%
                  </span>
                  <input
                    type="range"
                    min="5"
                    max="60"
                    step="5"
                    value={data.hero?.backgroundOpacity ?? 20}
                    onChange={e => setData({...data, hero: {...data.hero, backgroundOpacity: Number(e.target.value)}})}
                    className="w-full accent-emerald-400"
                  />
                </div>
              </div>

              {/* Background Preview */}
              <div className="mt-4 p-4 rounded-xl bg-black border border-zinc-800 flex items-center justify-center relative overflow-hidden h-36">
                <div
                  className="w-24 h-24 bg-contain bg-center bg-no-repeat transition-all"
                  style={{
                    backgroundImage: `url('${data.hero?.backgroundImage || '/assets/images/favicon.png'}')`,
                    filter: `blur(${data.hero?.backgroundBlur ?? 32}px)`,
                    opacity: (data.hero?.backgroundOpacity ?? 20) / 100,
                  }}
                />
                <div className="absolute inset-0 flex items-center justify-center text-xs font-mono text-zinc-400 pointer-events-none">
                  Live Hero Background Preview ({data.hero?.backgroundBlur ?? 32}px blur - {data.hero?.backgroundOpacity ?? 20}% opacity)
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section className="bg-card border border-border rounded-xl p-6 flex flex-col gap-6">
          <h3 className="text-xl font-semibold border-b border-border pb-4">About Section</h3>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Title</label>
            <input 
              type="text" 
              value={data.about.title} 
              onChange={e => setData({...data, about: {...data.about, title: e.target.value}})}
              className="px-4 py-2 bg-background border border-border rounded-lg" 
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Description</label>
            <textarea 
              rows={4}
              value={data.about.description} 
              onChange={e => setData({...data, about: {...data.about, description: e.target.value}})}
              className="px-4 py-2 bg-background border border-border rounded-lg" 
            />
          </div>
        </section>

        {/* Contact Section */}
        <section className="bg-card border border-border rounded-xl p-6 flex flex-col gap-6">
          <h3 className="text-xl font-semibold border-b border-border pb-4">Contact Information</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Public Email</label>
              <input 
                type="email" 
                value={data.contact.email} 
                onChange={e => setData({...data, contact: {...data.contact, email: e.target.value}})}
                className="px-4 py-2 bg-background border border-border rounded-lg" 
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Phone Number</label>
              <input 
                type="text" 
                value={data.contact.phone} 
                onChange={e => setData({...data, contact: {...data.contact, phone: e.target.value}})}
                className="px-4 py-2 bg-background border border-border rounded-lg" 
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Location</label>
              <input 
                type="text" 
                value={data.contact.location} 
                onChange={e => setData({...data, contact: {...data.contact, location: e.target.value}})}
                className="px-4 py-2 bg-background border border-border rounded-lg" 
              />
            </div>
            <div className="flex flex-col gap-2 md:col-span-2">
              <label className="text-sm font-medium">Call to Action Heading</label>
              <textarea 
                rows={2}
                value={data.contact.heading} 
                onChange={e => setData({...data, contact: {...data.contact, heading: e.target.value}})}
                className="px-4 py-2 bg-background border border-border rounded-lg" 
              />
            </div>
          </div>
        </section>

        {/* Deployment Settings */}
        <section className="bg-card border border-border rounded-xl p-6 flex flex-col gap-6">
          <h3 className="text-xl font-semibold border-b border-border pb-4">Deployment Settings</h3>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Cloudflare Webhook URL</label>
            <input 
              type="url" 
              value={data.cloudflareWebhookUrl || ''} 
              onChange={e => setData({...data, cloudflareWebhookUrl: e.target.value})}
              placeholder="https://api.cloudflare.com/client/v4/pages/webhooks/..."
              className="px-4 py-2 bg-background border border-border rounded-lg" 
            />
            <p className="text-xs text-muted-foreground mt-1">
              Paste the Deploy Hook URL from Cloudflare to make the Publish button work without .env files.
            </p>
          </div>
        </section>

      </div>
    </div>
  );
}
