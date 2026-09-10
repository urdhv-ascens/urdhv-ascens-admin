'use client';

import React, { useState, useEffect } from 'react';
import { 
  Save, 
  Loader2, 
  Sparkles, 
  Globe, 
  Layout, 
  Info, 
  Phone, 
  FileText, 
  ShieldCheck, 
  Check, 
  Plus, 
  Trash2, 
  ExternalLink,
  Sliders,
  Send
} from 'lucide-react';
import contentData from "@/data/content.json";
import { getLiveContent, updateContent } from '@/lib/api-client';
import type { ContentRecord, LegalPageContent } from '@/core/types';

type ActiveTab = 'brand' | 'hero' | 'about' | 'contact' | 'footer' | 'legal' | 'deploy';

export default function SiteSettings() {
  const [data, setData] = useState<ContentRecord>(contentData as unknown as ContentRecord);
  const [activeTab, setActiveTab] = useState<ActiveTab>('brand');
  const [activeLegalSubTab, setActiveLegalSubTab] = useState<'privacy' | 'terms' | 'refund'>('privacy');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const content = await getLiveContent();
        if (content) {
          setData((prev) => ({
            ...prev,
            ...content,
            siteSettings: { ...(prev.siteSettings || {}), ...(content.siteSettings || {}) },
            navigation: { ...(prev.navigation || {}), ...(content.navigation || {}) },
            hero: { ...(prev.hero || {}), ...(content.hero || {}) },
            about: { ...(prev.about || {}), ...(content.about || {}) },
            contact: { ...(prev.contact || {}), ...(content.contact || {}) },
            footer: { ...(prev.footer || {}), ...(content.footer || {}) },
            legal: { ...(prev.legal || {}), ...(content.legal || {}) }
          } as ContentRecord));
        }
      } catch (err) {
        console.error("Failed to fetch live settings:", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    setSaveStatus(null);
    try {
      const res = await updateContent(data);
      if (res && res.success) {
        setSaveStatus("Changes saved and published live to Hostinger storage!");
      } else {
        setSaveStatus(res?.message || "Settings updated successfully!");
      }
      setTimeout(() => setSaveStatus(null), 4000);
    } catch (err: any) {
      console.error(err);
      alert("Failed to save settings: " + (err?.message || "Network error"));
    } finally {
      setIsSaving(false);
    }
  };

  // Navigation Links Helpers
  const addNavLink = () => {
    const currentLinks = data.navigation?.links || [];
    setData({
      ...data,
      navigation: {
        ...data.navigation,
        links: [...currentLinks, { label: 'New Link', href: '/#section' }]
      }
    });
  };

  const removeNavLink = (index: number) => {
    const currentLinks = data.navigation?.links || [];
    setData({
      ...data,
      navigation: {
        ...data.navigation,
        links: currentLinks.filter((_, i) => i !== index)
      }
    });
  };

  const updateNavLink = (index: number, key: 'label' | 'href', value: string) => {
    const currentLinks = [...(data.navigation?.links || [])];
    currentLinks[index] = { ...currentLinks[index], [key]: value };
    setData({
      ...data,
      navigation: {
        ...data.navigation,
        links: currentLinks
      }
    });
  };

  // Legal Policy Sections Helpers
  const getLegalTargetKey = () => {
    if (activeLegalSubTab === 'privacy') return 'privacyPolicy';
    if (activeLegalSubTab === 'terms') return 'termsAndConditions';
    return 'refundPolicy';
  };

  const currentLegalConfig: LegalPageContent = (data.legal && (data.legal as any)[getLegalTargetKey()]) || {
    title: '',
    lastUpdated: '',
    sections: []
  };

  const updateLegalMeta = (field: 'title' | 'lastUpdated' | 'description', val: string) => {
    const target = getLegalTargetKey();
    setData({
      ...data,
      legal: {
        ...data.legal,
        [target]: {
          ...(data.legal as any)?.[target],
          [field]: val
        }
      }
    });
  };

  const addLegalSection = () => {
    const target = getLegalTargetKey();
    const currentSections = currentLegalConfig.sections || [];
    setData({
      ...data,
      legal: {
        ...data.legal,
        [target]: {
          ...(data.legal as any)?.[target],
          sections: [
            ...currentSections,
            { heading: `${currentSections.length + 1}. New Clause`, content: 'Enter clause text here.' }
          ]
        }
      }
    });
  };

  const removeLegalSection = (secIndex: number) => {
    const target = getLegalTargetKey();
    const currentSections = currentLegalConfig.sections || [];
    setData({
      ...data,
      legal: {
        ...data.legal,
        [target]: {
          ...(data.legal as any)?.[target],
          sections: currentSections.filter((_, i) => i !== secIndex)
        }
      }
    });
  };

  const updateLegalSection = (secIndex: number, key: 'heading' | 'content', value: string) => {
    const target = getLegalTargetKey();
    const currentSections = [...(currentLegalConfig.sections || [])];
    currentSections[secIndex] = { ...currentSections[secIndex], [key]: value };
    setData({
      ...data,
      legal: {
        ...data.legal,
        [target]: {
          ...(data.legal as any)?.[target],
          sections: currentSections
        }
      }
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin text-emerald-400 w-8 h-8" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto pb-24">
      {/* Top Header & Save Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-850 pb-6">
        <div>
          <span className="text-emerald-400 text-xs font-mono font-bold tracking-widest uppercase mb-1 block">
            DYNAMIC CONTENT NEXUS
          </span>
          <h2 className="text-3xl font-black tracking-tight text-white">
            Ultra-Editable CMS
          </h2>
          <p className="text-zinc-400 text-xs sm:text-sm mt-1">
            Normal content changes update live in real-time. Zero code edits or redeployments required.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {saveStatus && (
            <span className="text-xs font-mono text-emerald-400 flex items-center gap-1.5 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20">
              <Check className="w-3.5 h-3.5" />
              {saveStatus}
            </span>
          )}
          <button 
            onClick={() => handleSave()}
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-2.5 bg-emerald-400 text-black font-bold text-xs uppercase tracking-wider rounded-lg hover:bg-emerald-300 transition-colors disabled:opacity-50 shrink-0"
          >
            {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            <span>{isSaving ? "Publishing..." : "Save & Publish"}</span>
          </button>
        </div>
      </div>

      {/* Tabs Navigation Bar */}
      <div className="flex flex-wrap gap-2 border-b border-zinc-800 pb-2">
        <button
          onClick={() => setActiveTab('brand')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono uppercase tracking-wider transition-colors ${
            activeTab === 'brand'
              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
          }`}
        >
          <Globe className="w-3.5 h-3.5" />
          <span>Brand & Nav</span>
        </button>

        <button
          onClick={() => setActiveTab('hero')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono uppercase tracking-wider transition-colors ${
            activeTab === 'hero'
              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Hero</span>
        </button>

        <button
          onClick={() => setActiveTab('about')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono uppercase tracking-wider transition-colors ${
            activeTab === 'about'
              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
          }`}
        >
          <Info className="w-3.5 h-3.5" />
          <span>About & Stats</span>
        </button>

        <button
          onClick={() => setActiveTab('contact')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono uppercase tracking-wider transition-colors ${
            activeTab === 'contact'
              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
          }`}
        >
          <Phone className="w-3.5 h-3.5" />
          <span>Contact</span>
        </button>

        <button
          onClick={() => setActiveTab('footer')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono uppercase tracking-wider transition-colors ${
            activeTab === 'footer'
              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
          }`}
        >
          <Layout className="w-3.5 h-3.5" />
          <span>Footer & Socials</span>
        </button>

        <button
          onClick={() => setActiveTab('legal')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono uppercase tracking-wider transition-colors ${
            activeTab === 'legal'
              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Legal Policies</span>
        </button>

        <button
          onClick={() => setActiveTab('deploy')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono uppercase tracking-wider transition-colors ${
            activeTab === 'deploy'
              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Edge Webhook</span>
        </button>
      </div>

      {/* Tab 1: Brand & Navigation */}
      {activeTab === 'brand' && (
        <div className="flex flex-col gap-6">
          <section className="bg-zinc-950 border border-zinc-850 rounded-xl p-6 flex flex-col gap-6">
            <h3 className="text-base font-bold text-white uppercase tracking-wider border-b border-zinc-850 pb-3 flex items-center gap-2">
              <Globe className="w-4 h-4 text-emerald-400" />
              Brand Identity & Logo
            </h3>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-mono text-zinc-400 uppercase">Studio Full Name</label>
                <input 
                  type="text" 
                  value={data.siteSettings?.companyName || ''} 
                  onChange={e => setData({...data, siteSettings: {...data.siteSettings, companyName: e.target.value}})}
                  className="px-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-white focus:border-emerald-400 focus:outline-none" 
                  placeholder="Ūrdhv Ascens"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-mono text-zinc-400 uppercase">Brand Header Title</label>
                <input 
                  type="text" 
                  value={data.navigation?.brandTitle || ''} 
                  onChange={e => setData({...data, navigation: {...data.navigation, brandTitle: e.target.value}} as any)}
                  className="px-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-white focus:border-emerald-400 focus:outline-none" 
                  placeholder="ŪRDHV ASCENS"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-mono text-zinc-400 uppercase">Brand Tagline</label>
                <input 
                  type="text" 
                  value={data.siteSettings?.tagline || ''} 
                  onChange={e => setData({...data, siteSettings: {...data.siteSettings, tagline: e.target.value}})}
                  className="px-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-white focus:border-emerald-400 focus:outline-none" 
                  placeholder="Bespoke Digital Design & Engineering Studio"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-mono text-zinc-400 uppercase">Logo URL or Asset Path</label>
                <input 
                  type="text" 
                  value={data.navigation?.logoUrl || '/logo.webp'} 
                  onChange={e => setData({...data, navigation: {...data.navigation, logoUrl: e.target.value}} as any)}
                  className="px-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-white font-mono focus:border-emerald-400 focus:outline-none" 
                  placeholder="/logo.webp"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4 pt-4 border-t border-zinc-850">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-mono text-emerald-400 uppercase">Viewer / Curriculum Portal URL</label>
                <input 
                  type="url" 
                  value={data.siteSettings?.viewerUrl || 'https://urdhv-viewer.pages.dev'} 
                  onChange={e => setData({...data, siteSettings: {...data.siteSettings, viewerUrl: e.target.value}})}
                  className="px-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-white font-mono focus:border-emerald-400 focus:outline-none" 
                  placeholder="https://urdhv-viewer.pages.dev"
                />
                <span className="text-[11px] text-zinc-500">Destination for free student & teacher course entry.</span>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-mono text-zinc-400 uppercase">Production Base URL</label>
                <input 
                  type="url" 
                  value={data.siteSettings?.productionBaseUrl || 'https://urdhvascens.pages.dev'} 
                  onChange={e => setData({...data, siteSettings: {...data.siteSettings, productionBaseUrl: e.target.value}})}
                  className="px-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-white font-mono focus:border-emerald-400 focus:outline-none" 
                  placeholder="https://urdhvascens.pages.dev"
                />
              </div>
            </div>
          </section>

          {/* Navigation Links Manager */}
          <section className="bg-zinc-950 border border-zinc-850 rounded-xl p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-zinc-850 pb-3">
              <h3 className="text-base font-bold text-white uppercase tracking-wider">
                Storefront Navigation Links
              </h3>
              <button
                type="button"
                onClick={addNavLink}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-mono hover:bg-emerald-500/20 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Link</span>
              </button>
            </div>

            <div className="space-y-3">
              {(data.navigation?.links || []).map((link, idx) => (
                <div key={idx} className="flex items-center gap-3 bg-zinc-900/60 p-3 rounded-lg border border-zinc-850">
                  <span className="text-xs font-mono text-zinc-500 w-6 text-center">{idx + 1}</span>
                  <div className="flex-1 grid sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={link.label}
                      onChange={e => updateNavLink(idx, 'label', e.target.value)}
                      placeholder="Label (e.g. Services)"
                      className="px-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded text-xs text-white"
                    />
                    <input
                      type="text"
                      value={link.href}
                      onChange={e => updateNavLink(idx, 'href', e.target.value)}
                      placeholder="Href (e.g. /#services)"
                      className="px-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded text-xs text-white font-mono"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeNavLink(idx)}
                    className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Nav Header Action Buttons */}
            <div className="grid md:grid-cols-2 gap-4 pt-4 border-t border-zinc-850 mt-2">
              <div className="flex flex-col gap-2 p-3 bg-zinc-900/40 rounded-lg border border-zinc-850">
                <span className="text-xs font-bold text-white uppercase tracking-wider">Course Button (Nav)</span>
                <input
                  type="text"
                  value={data.navigation?.courseButton?.text || 'Free Course'}
                  onChange={e => setData({
                    ...data,
                    navigation: {
                      ...data.navigation,
                      courseButton: {
                        href: data.navigation?.courseButton?.href || '#course',
                        text: e.target.value
                      }
                    } as any
                  })}
                  placeholder="Button Text"
                  className="px-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded text-xs text-white"
                />
              </div>

              <div className="flex flex-col gap-2 p-3 bg-zinc-900/40 rounded-lg border border-zinc-850">
                <span className="text-xs font-bold text-white uppercase tracking-wider">Primary CTA Button (Nav)</span>
                <input
                  type="text"
                  value={data.navigation?.ctaButton?.text || 'Initiate Dialogue'}
                  onChange={e => setData({
                    ...data,
                    navigation: {
                      ...data.navigation,
                      ctaButton: {
                        href: data.navigation?.ctaButton?.href || '#contact',
                        text: e.target.value
                      }
                    } as any
                  })}
                  placeholder="Button Text"
                  className="px-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded text-xs text-white"
                />
              </div>
            </div>
          </section>
        </div>
      )}

      {/* Tab 2: Hero Section */}
      {activeTab === 'hero' && (
        <div className="flex flex-col gap-6">
          <section className="bg-zinc-950 border border-zinc-850 rounded-xl p-6 flex flex-col gap-6">
            <h3 className="text-base font-bold text-white uppercase tracking-wider border-b border-zinc-850 pb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              Hero Section Copy & Action Triggers
            </h3>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label className="text-xs font-mono text-zinc-400 uppercase">Hero Tagline</label>
                <input 
                  type="text" 
                  value={data.hero?.tagline || ''} 
                  onChange={e => setData({...data, hero: {...data.hero, tagline: e.target.value}})}
                  className="px-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-white font-mono focus:border-emerald-400 focus:outline-none" 
                  placeholder="DIGITAL CRAFT / UNCOMPROMISING PRECISION"
                />
              </div>

              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label className="text-xs font-mono text-zinc-400 uppercase">Main Title (H1)</label>
                <input 
                  type="text" 
                  value={data.hero?.title || ''} 
                  onChange={e => setData({...data, hero: {...data.hero, title: e.target.value}})}
                  className="px-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-lg text-base font-black text-white focus:border-emerald-400 focus:outline-none" 
                  placeholder="Architecting Distinctive Digital Presence"
                />
              </div>

              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label className="text-xs font-mono text-zinc-400 uppercase">Narrative Description</label>
                <textarea 
                  rows={3}
                  value={data.hero?.description || ''} 
                  onChange={e => setData({...data, hero: {...data.hero, description: e.target.value}})}
                  className="px-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-white focus:border-emerald-400 focus:outline-none" 
                  placeholder="We engineer bespoke web applications, authoritative visual identities, and interactive learning systems."
                />
              </div>
            </div>

            {/* CTAs Configuration */}
            <div className="grid md:grid-cols-2 gap-6 pt-4 border-t border-zinc-850">
              <div className="flex flex-col gap-3 p-4 bg-zinc-900/40 rounded-xl border border-zinc-850">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Primary CTA Button</span>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-mono text-zinc-400">Button Text</label>
                  <input
                    type="text"
                    value={data.hero?.primaryCtaText || 'Access Free Courses'}
                    onChange={e => setData({...data, hero: {...data.hero, primaryCtaText: e.target.value}})}
                    className="px-3 py-2 bg-zinc-950 border border-zinc-800 rounded text-xs text-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-mono text-zinc-400">Action Type</label>
                    <select
                      value={data.hero?.primaryCtaAction || 'modal'}
                      onChange={e => setData({...data, hero: {...data.hero, primaryCtaAction: e.target.value as any}})}
                      className="px-3 py-2 bg-zinc-950 border border-zinc-800 rounded text-xs text-white"
                    >
                      <option value="modal">Open Course Modal</option>
                      <option value="link">Navigate to URL / Anchor</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-mono text-zinc-400">Target Link</label>
                    <input
                      type="text"
                      value={data.hero?.primaryCtaLink || '#course'}
                      onChange={e => setData({...data, hero: {...data.hero, primaryCtaLink: e.target.value}})}
                      className="px-3 py-2 bg-zinc-950 border border-zinc-800 rounded text-xs text-white font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3 p-4 bg-zinc-900/40 rounded-xl border border-zinc-850">
                <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Secondary CTA Button</span>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-mono text-zinc-400">Button Text</label>
                  <input
                    type="text"
                    value={data.hero?.secondaryCtaText || 'Start a Dialogue'}
                    onChange={e => setData({...data, hero: {...data.hero, secondaryCtaText: e.target.value}})}
                    className="px-3 py-2 bg-zinc-950 border border-zinc-800 rounded text-xs text-white"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-mono text-zinc-400">Target Link</label>
                  <input
                    type="text"
                    value={data.hero?.secondaryCtaLink || '#contact'}
                    onChange={e => setData({...data, hero: {...data.hero, secondaryCtaLink: e.target.value}})}
                    className="px-3 py-2 bg-zinc-950 border border-zinc-800 rounded text-xs text-white font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Hero Background Asset Settings */}
            <div className="flex flex-col gap-3 pt-4 border-t border-zinc-850">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                Hero Ambient Background Asset
              </span>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="flex flex-col gap-1.5 md:col-span-2">
                  <label className="text-[11px] font-mono text-zinc-400">Image URL or Local Asset Path</label>
                  <input
                    type="text"
                    value={data.hero?.backgroundImage || '/assets/images/favicon.webp'}
                    onChange={e => setData({...data, hero: {...data.hero, backgroundImage: e.target.value}})}
                    className="px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white font-mono"
                  />
                  <span className="text-[11px] text-zinc-500">
                    Use any asset path or uploaded media from the Media Library.
                  </span>
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex justify-between text-xs font-mono text-zinc-400">
                    <span>Blur: {data.hero?.backgroundBlur ?? 32}px</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="64"
                    step="4"
                    value={data.hero?.backgroundBlur ?? 32}
                    onChange={e => setData({...data, hero: {...data.hero, backgroundBlur: Number(e.target.value)}})}
                    className="w-full accent-emerald-400"
                  />

                  <div className="flex justify-between text-xs font-mono text-zinc-400 mt-2">
                    <span>Opacity: {data.hero?.backgroundOpacity ?? 20}%</span>
                  </div>
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

              {/* Ambient Live Preview */}
              <div className="mt-2 p-4 rounded-xl bg-black border border-zinc-850 flex items-center justify-center relative overflow-hidden h-32">
                <div
                  className="w-24 h-24 bg-contain bg-center bg-no-repeat transition-all"
                  style={{
                    backgroundImage: `url('${data.hero?.backgroundImage || '/assets/images/favicon.webp'}')`,
                    filter: `blur(${data.hero?.backgroundBlur ?? 32}px)`,
                    opacity: (data.hero?.backgroundOpacity ?? 20) / 100,
                  }}
                />
                <div className="absolute inset-0 flex items-center justify-center text-xs font-mono text-zinc-500 pointer-events-none">
                  Live Backdrop Render Preview
                </div>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* Tab 3: About & Metric Counters */}
      {activeTab === 'about' && (
        <div className="flex flex-col gap-6">
          <section className="bg-zinc-950 border border-zinc-850 rounded-xl p-6 flex flex-col gap-6">
            <h3 className="text-base font-bold text-white uppercase tracking-wider border-b border-zinc-850 pb-3 flex items-center gap-2">
              <Info className="w-4 h-4 text-emerald-400" />
              About Studio Narrative & Media
            </h3>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-mono text-zinc-400 uppercase">Category Tag</label>
                <input 
                  type="text" 
                  value={data.about?.category || 'OUR PHILOSOPHY'} 
                  onChange={e => setData({...data, about: {...data.about, category: e.target.value}})}
                  className="px-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-white font-mono" 
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-mono text-zinc-400 uppercase">Studio Title</label>
                <input 
                  type="text" 
                  value={data.about?.title || ''} 
                  onChange={e => setData({...data, about: {...data.about, title: e.target.value}})}
                  className="px-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-white font-bold" 
                />
              </div>

              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label className="text-xs font-mono text-zinc-400 uppercase">Narrative Description</label>
                <textarea 
                  rows={4}
                  value={data.about?.description || ''} 
                  onChange={e => setData({...data, about: {...data.about, description: e.target.value}})}
                  className="px-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-white" 
                />
              </div>

              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label className="text-xs font-mono text-zinc-400 uppercase">Studio Imagery URL</label>
                <input 
                  type="text" 
                  value={data.about?.imageUrl || '/assets/images/About-Us.webp'} 
                  onChange={e => setData({...data, about: {...data.about, imageUrl: e.target.value}})}
                  className="px-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-white font-mono" 
                />
              </div>
            </div>

            {/* 3 Metric Counters */}
            <div className="pt-4 border-t border-zinc-850">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block mb-3">
                3 Key Metric Velocity Counters
              </span>
              <div className="grid md:grid-cols-3 gap-4">
                {[0, 1, 2].map((idx) => {
                  const stat = (data.about?.stats && data.about.stats[idx]) || { value: '', label: '' };
                  return (
                    <div key={idx} className="p-4 bg-zinc-900/50 rounded-xl border border-zinc-850 flex flex-col gap-2">
                      <span className="text-[11px] font-mono text-zinc-500">Metric #{idx + 1}</span>
                      <input
                        type="text"
                        value={stat.value}
                        onChange={e => {
                          const currentStats = [...(data.about?.stats || [{ value: '', label: '' }, { value: '', label: '' }, { value: '', label: '' }])];
                          currentStats[idx] = { ...currentStats[idx], value: e.target.value };
                          setData({
                            ...data,
                            about: {
                              ...data.about,
                              stats: currentStats
                            }
                          });
                        }}
                        placeholder="Value (e.g. 99.8%)"
                        className="px-3 py-2 bg-zinc-950 border border-zinc-800 rounded text-sm font-bold text-emerald-400"
                      />
                      <input
                        type="text"
                        value={stat.label}
                        onChange={e => {
                          const currentStats = [...(data.about?.stats || [{ value: '', label: '' }, { value: '', label: '' }, { value: '', label: '' }])];
                          currentStats[idx] = { ...currentStats[idx], label: e.target.value };
                          setData({
                            ...data,
                            about: {
                              ...data.about,
                              stats: currentStats
                            }
                          });
                        }}
                        placeholder="Label (e.g. On-Time Velocity)"
                        className="px-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded text-xs text-zinc-300"
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 3 Floating Badges */}
            <div className="pt-4 border-t border-zinc-850">
              <span className="text-xs font-bold text-white uppercase tracking-wider block mb-3">
                3 Floating Image Badges
              </span>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-mono text-zinc-400">Badge 1 (Top Left)</label>
                  <input
                    type="text"
                    value={data.about?.badges?.badge1 || 'Bespoke Engineering'}
                    onChange={e => setData({
                      ...data,
                      about: {
                        ...data.about,
                        badges: { ...(data.about?.badges || {}), badge1: e.target.value }
                      }
                    })}
                    className="px-3 py-2 bg-zinc-900 border border-zinc-800 rounded text-xs text-white"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-mono text-zinc-400">Badge 2 (Top Right)</label>
                  <input
                    type="text"
                    value={data.about?.badges?.badge2 || 'Zero Generic Templates'}
                    onChange={e => setData({
                      ...data,
                      about: {
                        ...data.about,
                        badges: { ...(data.about?.badges || {}), badge2: e.target.value }
                      }
                    })}
                    className="px-3 py-2 bg-zinc-900 border border-zinc-800 rounded text-xs text-white"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-mono text-zinc-400">Badge 3 (Bottom Centered)</label>
                  <input
                    type="text"
                    value={data.about?.badges?.badge3 || 'Direct Principal Access'}
                    onChange={e => setData({
                      ...data,
                      about: {
                        ...data.about,
                        badges: { ...(data.about?.badges || {}), badge3: e.target.value }
                      }
                    })}
                    className="px-3 py-2 bg-zinc-900 border border-zinc-800 rounded text-xs text-white"
                  />
                </div>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* Tab 4: Contact Information */}
      {activeTab === 'contact' && (
        <div className="flex flex-col gap-6">
          <section className="bg-zinc-950 border border-zinc-850 rounded-xl p-6 flex flex-col gap-6">
            <h3 className="text-base font-bold text-white uppercase tracking-wider border-b border-zinc-850 pb-3 flex items-center gap-2">
              <Phone className="w-4 h-4 text-emerald-400" />
              Studio Contact Channels & SLA
            </h3>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-mono text-zinc-400 uppercase">Section Tagline</label>
                <input 
                  type="text" 
                  value={data.contact?.tagline || 'GET IN TOUCH'} 
                  onChange={e => setData({...data, contact: {...data.contact, tagline: e.target.value}})}
                  className="px-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-white font-mono" 
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-mono text-zinc-400 uppercase">Section Title</label>
                <input 
                  type="text" 
                  value={data.contact?.title || 'Start a Dialogue'} 
                  onChange={e => setData({...data, contact: {...data.contact, title: e.target.value}})}
                  className="px-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-white font-bold" 
                />
              </div>

              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label className="text-xs font-mono text-zinc-400 uppercase">Call to Action Heading</label>
                <textarea 
                  rows={2}
                  value={data.contact?.heading || ''} 
                  onChange={e => setData({...data, contact: {...data.contact, heading: e.target.value}})}
                  className="px-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-white" 
                />
              </div>

              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label className="text-xs font-mono text-zinc-400 uppercase">Description</label>
                <textarea 
                  rows={2}
                  value={data.contact?.description || ''} 
                  onChange={e => setData({...data, contact: {...data.contact, description: e.target.value}})}
                  className="px-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-white" 
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4 pt-4 border-t border-zinc-850">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-mono text-emerald-400 uppercase">Primary Public Email</label>
                <input 
                  type="email" 
                  value={data.contact?.email || ''} 
                  onChange={e => setData({...data, contact: {...data.contact, email: e.target.value}})}
                  className="px-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-white font-mono" 
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-mono text-zinc-400 uppercase">Primary Phone Number</label>
                <input 
                  type="text" 
                  value={data.contact?.phone || ''} 
                  onChange={e => setData({...data, contact: {...data.contact, phone: e.target.value}})}
                  className="px-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-white font-mono" 
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-mono text-zinc-400 uppercase">Secondary / Alternate Phone</label>
                <input 
                  type="text" 
                  value={data.contact?.secondaryPhone || ''} 
                  onChange={e => setData({...data, contact: {...data.contact, secondaryPhone: e.target.value}})}
                  className="px-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-white font-mono" 
                  placeholder="+91 80037 53540"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-mono text-zinc-400 uppercase">Studio Location</label>
                <input 
                  type="text" 
                  value={data.contact?.location || ''} 
                  onChange={e => setData({...data, contact: {...data.contact, location: e.target.value}})}
                  className="px-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-white" 
                />
              </div>

              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label className="text-xs font-mono text-emerald-400 uppercase">Response Time SLA / Availability Note</label>
                <input 
                  type="text" 
                  value={data.contact?.responseTime || ''} 
                  onChange={e => setData({...data, contact: {...data.contact, responseTime: e.target.value}})}
                  className="px-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-white font-mono" 
                  placeholder="Rapid Response: < 2 Hours"
                />
              </div>
            </div>
          </section>
        </div>
      )}

      {/* Tab 5: Footer & Socials */}
      {activeTab === 'footer' && (
        <div className="flex flex-col gap-6">
          <section className="bg-zinc-950 border border-zinc-850 rounded-xl p-6 flex flex-col gap-6">
            <h3 className="text-base font-bold text-white uppercase tracking-wider border-b border-zinc-850 pb-3 flex items-center gap-2">
              <Layout className="w-4 h-4 text-emerald-400" />
              Footer Copy & Location Note
            </h3>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label className="text-xs font-mono text-zinc-400 uppercase">Footer Narrative Description</label>
                <textarea 
                  rows={2}
                  value={data.footer?.description || ''} 
                  onChange={e => setData({...data, footer: {...data.footer, description: e.target.value}} as any)}
                  className="px-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-white" 
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-mono text-zinc-400 uppercase">Location Note</label>
                <input 
                  type="text" 
                  value={data.footer?.locationNote || ''} 
                  onChange={e => setData({...data, footer: {...data.footer, locationNote: e.target.value}} as any)}
                  className="px-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-white font-mono" 
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-mono text-zinc-400 uppercase">Copyright Text</label>
                <input 
                  type="text" 
                  value={data.footer?.copyrightText || ''} 
                  onChange={e => setData({...data, footer: {...data.footer, copyrightText: e.target.value}} as any)}
                  className="px-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-white font-mono" 
                />
              </div>

              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label className="text-xs font-mono text-zinc-400 uppercase">System Credit / Hosting Text</label>
                <input 
                  type="text" 
                  value={data.footer?.creditText || ''} 
                  onChange={e => setData({...data, footer: {...data.footer, creditText: e.target.value}} as any)}
                  className="px-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-white font-mono" 
                />
              </div>
            </div>

            {/* Social Presence URLs */}
            <div className="pt-4 border-t border-zinc-850">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block mb-3">
                Social Networks & Direct Messaging Channels
              </span>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-mono text-zinc-400">Twitter / X URL</label>
                  <input
                    type="url"
                    value={data.footer?.socialLinks?.twitter || ''}
                    onChange={e => setData({
                      ...data,
                      footer: {
                        ...data.footer,
                        socialLinks: { ...(data.footer?.socialLinks || {}), twitter: e.target.value }
                      } as any
                    })}
                    placeholder="https://x.com/urdhvascens"
                    className="px-3 py-2 bg-zinc-900 border border-zinc-800 rounded text-xs text-white font-mono"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-mono text-zinc-400">LinkedIn URL</label>
                  <input
                    type="url"
                    value={data.footer?.socialLinks?.linkedin || ''}
                    onChange={e => setData({
                      ...data,
                      footer: {
                        ...data.footer,
                        socialLinks: { ...(data.footer?.socialLinks || {}), linkedin: e.target.value }
                      } as any
                    })}
                    placeholder="https://linkedin.com/company/urdhvascens"
                    className="px-3 py-2 bg-zinc-900 border border-zinc-800 rounded text-xs text-white font-mono"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-mono text-zinc-400">Instagram URL</label>
                  <input
                    type="url"
                    value={data.footer?.socialLinks?.instagram || ''}
                    onChange={e => setData({
                      ...data,
                      footer: {
                        ...data.footer,
                        socialLinks: { ...(data.footer?.socialLinks || {}), instagram: e.target.value }
                      } as any
                    })}
                    placeholder="https://instagram.com/urdhvascens"
                    className="px-3 py-2 bg-zinc-900 border border-zinc-800 rounded text-xs text-white font-mono"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-mono text-zinc-400">GitHub URL</label>
                  <input
                    type="url"
                    value={data.footer?.socialLinks?.github || ''}
                    onChange={e => setData({
                      ...data,
                      footer: {
                        ...data.footer,
                        socialLinks: { ...(data.footer?.socialLinks || {}), github: e.target.value }
                      } as any
                    })}
                    placeholder="https://github.com/urdhvascens"
                    className="px-3 py-2 bg-zinc-900 border border-zinc-800 rounded text-xs text-white font-mono"
                  />
                </div>

                <div className="flex flex-col gap-1.5 md:col-span-2">
                  <label className="text-[11px] font-mono text-zinc-400">WhatsApp Direct Link</label>
                  <input
                    type="url"
                    value={data.footer?.socialLinks?.whatsapp || ''}
                    onChange={e => setData({
                      ...data,
                      footer: {
                        ...data.footer,
                        socialLinks: { ...(data.footer?.socialLinks || {}), whatsapp: e.target.value }
                      } as any
                    })}
                    placeholder="https://wa.me/917891085020"
                    className="px-3 py-2 bg-zinc-900 border border-zinc-800 rounded text-xs text-white font-mono"
                  />
                </div>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* Tab 6: Legal & Policies */}
      {activeTab === 'legal' && (
        <div className="flex flex-col gap-6">
          {/* Sub-Tabs for the 3 Policies */}
          <div className="flex gap-2">
            <button
              onClick={() => setActiveLegalSubTab('privacy')}
              className={`px-4 py-2 rounded-lg text-xs font-mono uppercase tracking-wider transition-colors ${
                activeLegalSubTab === 'privacy'
                  ? 'bg-emerald-400 text-black font-bold'
                  : 'bg-zinc-900 text-zinc-400 hover:text-white'
              }`}
            >
              Privacy Policy
            </button>
            <button
              onClick={() => setActiveLegalSubTab('terms')}
              className={`px-4 py-2 rounded-lg text-xs font-mono uppercase tracking-wider transition-colors ${
                activeLegalSubTab === 'terms'
                  ? 'bg-emerald-400 text-black font-bold'
                  : 'bg-zinc-900 text-zinc-400 hover:text-white'
              }`}
            >
              Terms of Service
            </button>
            <button
              onClick={() => setActiveLegalSubTab('refund')}
              className={`px-4 py-2 rounded-lg text-xs font-mono uppercase tracking-wider transition-colors ${
                activeLegalSubTab === 'refund'
                  ? 'bg-emerald-400 text-black font-bold'
                  : 'bg-zinc-900 text-zinc-400 hover:text-white'
              }`}
            >
              Refund Policy
            </button>
          </div>

          <section className="bg-zinc-950 border border-zinc-850 rounded-xl p-6 flex flex-col gap-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-mono text-zinc-400 uppercase">Policy Page Title</label>
                <input
                  type="text"
                  value={currentLegalConfig.title || ''}
                  onChange={e => updateLegalMeta('title', e.target.value)}
                  className="px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-white font-bold"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-mono text-zinc-400 uppercase">Effective Date / Last Updated</label>
                <input
                  type="text"
                  value={currentLegalConfig.lastUpdated || ''}
                  onChange={e => updateLegalMeta('lastUpdated', e.target.value)}
                  className="px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-white font-mono"
                />
              </div>

              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label className="text-xs font-mono text-zinc-400 uppercase">Subtitle / Scope Summary</label>
                <textarea
                  rows={2}
                  value={(currentLegalConfig as any).description || ''}
                  onChange={e => updateLegalMeta('description', e.target.value)}
                  className="px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-white"
                />
              </div>
            </div>

            {/* Policy Clauses List */}
            <div className="pt-4 border-t border-zinc-850 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Contractual Clauses & Sections ({currentLegalConfig.sections?.length || 0})
                </span>
                <button
                  type="button"
                  onClick={addLegalSection}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-mono hover:bg-emerald-500/20 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Section</span>
                </button>
              </div>

              <div className="space-y-4">
                {(currentLegalConfig.sections || []).map((sec, sIdx) => (
                  <div key={sIdx} className="p-4 bg-zinc-900/50 rounded-xl border border-zinc-850 flex flex-col gap-3">
                    <div className="flex items-center justify-between gap-3">
                      <input
                        type="text"
                        value={sec.heading}
                        onChange={e => updateLegalSection(sIdx, 'heading', e.target.value)}
                        placeholder="Section Heading"
                        className="flex-1 px-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded text-xs text-white font-bold"
                      />
                      <button
                        type="button"
                        onClick={() => removeLegalSection(sIdx)}
                        className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <textarea
                      rows={3}
                      value={sec.content}
                      onChange={e => updateLegalSection(sIdx, 'content', e.target.value)}
                      placeholder="Clause body paragraph text..."
                      className="px-3 py-2 bg-zinc-950 border border-zinc-800 rounded text-xs text-zinc-300 leading-relaxed"
                    />
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      )}

      {/* Tab 7: Edge Deployment */}
      {activeTab === 'deploy' && (
        <div className="flex flex-col gap-6">
          <section className="bg-zinc-950 border border-zinc-850 rounded-xl p-6 flex flex-col gap-6">
            <h3 className="text-base font-bold text-white uppercase tracking-wider border-b border-zinc-850 pb-3 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-emerald-400" />
              Cloudflare Pages Edge Webhook Hook
            </h3>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-mono text-zinc-400 uppercase">Cloudflare Webhook URL</label>
              <input 
                type="url" 
                value={data.cloudflareWebhookUrl || ''} 
                onChange={e => setData({...data, cloudflareWebhookUrl: e.target.value})}
                placeholder="https://api.cloudflare.com/client/v4/pages/webhooks/..."
                className="px-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-white font-mono" 
              />
              <p className="text-xs text-zinc-500 mt-1">
                Optional: Paste a Cloudflare Deploy Webhook to trigger an edge CDN cache flush or rebuild directly from this panel.
              </p>
            </div>

            {data.cloudflareWebhookUrl && (
              <div className="pt-4 border-t border-zinc-850">
                <button
                  type="button"
                  onClick={async () => {
                    if (!confirm("Trigger Cloudflare Edge deployment rebuild now?")) return;
                    try {
                      await fetch(data.cloudflareWebhookUrl!, { method: 'POST' });
                      alert("Deployment webhook triggered successfully!");
                    } catch (err: any) {
                      alert("Failed to trigger webhook: " + err.message);
                    }
                  }}
                  className="flex items-center gap-2 px-5 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-xs font-mono text-emerald-400 hover:bg-zinc-850 transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Trigger Cloudflare Edge Rebuild</span>
                </button>
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
