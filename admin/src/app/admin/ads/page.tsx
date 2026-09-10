'use client';

import { useState, useEffect } from 'react';
import type { AdsConfig, TopBarSlide } from '@/core/types';
import { getAds, updateAds } from '@/lib/api-client';
import { Megaphone, Plus, Trash2, Save, Loader2, RefreshCw } from 'lucide-react';

export default function AdsAdminPage() {
  const [ads, setAds] = useState<AdsConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const loadAds = async () => {
    setLoading(true);
    try {
      const data = await getAds();
      setAds(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAds();
  }, []);

  const handleSave = async () => {
    if (!ads) return;
    setSaving(true);
    setStatusMessage(null);
    try {
      const res = await updateAds(ads);
      if (res.success) {
        setStatusMessage('✅ Advertisement configuration updated successfully!');
      } else {
        alert(res.message || 'Save failed.');
      }
    } catch (err: any) {
      alert(err.message || 'Error saving ads config.');
    } finally {
      setSaving(false);
    }
  };

  const handleAddSlide = () => {
    if (!ads) return;
    const newSlide: TopBarSlide = {
      id: `slide-${Date.now()}`,
      title: 'New Sponsor Headline',
      subtitle: 'Optional sponsor description',
      destinationUrl: 'https://urdhvascens.com',
      active: true,
      displayOrder: ads.topBar.slides.length + 1
    };
    setAds({
      ...ads,
      topBar: {
        ...ads.topBar,
        slides: [...ads.topBar.slides, newSlide]
      }
    });
  };

  const handleRemoveSlide = (id: string) => {
    if (!ads) return;
    setAds({
      ...ads,
      topBar: {
        ...ads.topBar,
        slides: ads.topBar.slides.filter(s => s.id !== id)
      }
    });
  };

  const handleUpdateSlide = (id: string, field: keyof TopBarSlide, value: any) => {
    if (!ads) return;
    setAds({
      ...ads,
      topBar: {
        ...ads.topBar,
        slides: ads.topBar.slides.map(s => s.id === id ? { ...s, [field]: value } : s)
      }
    });
  };

  const handleAddSideAdSlide = () => {
    if (!ads) return;
    const newSlide = {
      id: `side-slide-${Date.now()}`,
      title: 'New Side Banner Slide',
      imageUrl: '/uploads/ad_side_1.png',
      destinationUrl: 'https://urdhvascens.com',
      alt: 'Side sponsor creative',
      active: true,
      displayOrder: (ads.sideAds.slides?.length || 0) + 1
    };
    setAds({
      ...ads,
      sideAds: {
        ...ads.sideAds,
        slides: [...(ads.sideAds.slides || []), newSlide]
      }
    });
  };

  const handleRemoveSideAdSlide = (id: string) => {
    if (!ads) return;
    setAds({
      ...ads,
      sideAds: {
        ...ads.sideAds,
        slides: (ads.sideAds.slides || []).filter(s => s.id !== id)
      }
    });
  };

  const handleUpdateSideAdSlide = (id: string, field: string, value: any) => {
    if (!ads) return;
    setAds({
      ...ads,
      sideAds: {
        ...ads.sideAds,
        slides: (ads.sideAds.slides || []).map(s => s.id === id ? { ...s, [field]: value } : s)
      }
    });
  };

  const handleAddMobileBannerSlide = () => {
    if (!ads) return;
    const newSlide = {
      id: `mob-slide-${Date.now()}`,
      title: 'New Mobile Banner Slide',
      imageUrl: '/uploads/ad_mobile_1.png',
      destinationUrl: 'https://urdhvascens.com',
      alt: 'Mobile sponsor creative',
      active: true,
      displayOrder: (ads.mobileBanner?.slides?.length || 0) + 1
    };
    setAds({
      ...ads,
      mobileBanner: {
        ...ads.mobileBanner,
        slides: [...(ads.mobileBanner?.slides || []), newSlide]
      }
    });
  };

  const handleRemoveMobileBannerSlide = (id: string) => {
    if (!ads) return;
    setAds({
      ...ads,
      mobileBanner: {
        ...ads.mobileBanner,
        slides: (ads.mobileBanner?.slides || []).filter(s => s.id !== id)
      }
    });
  };

  const handleUpdateMobileBannerSlide = (id: string, field: string, value: any) => {
    if (!ads) return;
    setAds({
      ...ads,
      mobileBanner: {
        ...ads.mobileBanner,
        slides: (ads.mobileBanner?.slides || []).map(s => s.id === id ? { ...s, [field]: value } : s)
      }
    });
  };

  if (loading || !ads) {
    return (
      <div className="flex items-center justify-center h-64 text-zinc-400">
        <Loader2 className="w-8 h-8 text-emerald-400 animate-spin mr-3" />
        <span className="text-sm font-mono">Loading Ads Configuration...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white uppercase flex items-center gap-2">
            <Megaphone className="w-6 h-6 text-emerald-400" />
            <span>Advertisement & Sponsor Control</span>
          </h1>
          <p className="text-zinc-400 text-xs mt-1">
            Manage the Top Sponsor Bar slideshow and Desktop side advertisement placements in the Viewer.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={loadAds}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 hover:text-white transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-emerald-400 hover:bg-emerald-300 text-black font-bold text-xs rounded-lg transition-colors disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Save Ads Config</span>
          </button>
        </div>
      </div>

      {statusMessage && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 font-medium">
          {statusMessage}
        </div>
      )}

      {/* SECTION 1: Top Sponsor Bar */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-zinc-850 pb-4">
          <div className="space-y-0.5">
            <h2 className="text-base font-bold text-white">Top Sponsor Bar Slideshow</h2>
            <p className="text-xs text-zinc-400">Rotating header announcement banner on the Viewer platform.</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="topBarEnabled"
                checked={ads.topBar.enabled}
                onChange={e => setAds({ ...ads, topBar: { ...ads.topBar, enabled: e.target.checked } })}
                className="rounded bg-zinc-900 border-zinc-800 text-emerald-500 focus:ring-emerald-500"
              />
              <label htmlFor="topBarEnabled" className="text-xs font-semibold text-zinc-300 cursor-pointer">
                Enabled
              </label>
            </div>
            <div className="flex items-center space-x-1.5 text-xs text-zinc-400">
              <span>Interval:</span>
              <input
                type="number"
                min={2}
                max={60}
                value={ads.topBar.rotationIntervalSeconds}
                onChange={e => setAds({
                  ...ads,
                  topBar: { ...ads.topBar, rotationIntervalSeconds: parseInt(e.target.value, 10) || 6 }
                })}
                className="w-12 bg-zinc-900 border border-zinc-800 rounded-lg text-center py-1 text-white text-xs font-mono"
              />
              <span>sec</span>
            </div>
          </div>
        </div>

        {/* Slides List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Slides ({ads.topBar.slides.length})
            </h3>
            <button
              onClick={handleAddSlide}
              className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-medium text-emerald-400"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Slide</span>
            </button>
          </div>

          <div className="space-y-3">
            {ads.topBar.slides.map((slide) => (
              <div key={slide.id} className="p-4 bg-zinc-900/50 border border-zinc-850 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`slide-active-${slide.id}`}
                      checked={slide.active}
                      onChange={e => handleUpdateSlide(slide.id, 'active', e.target.checked)}
                      className="rounded bg-zinc-900 border-zinc-800 text-emerald-500"
                    />
                    <label htmlFor={`slide-active-${slide.id}`} className="text-xs font-semibold text-zinc-300 cursor-pointer">
                      Active
                    </label>
                  </div>
                  <button
                    onClick={() => handleRemoveSlide(slide.id)}
                    className="p-1 text-zinc-500 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-zinc-400">Slide Headline</label>
                    <input
                      type="text"
                      value={slide.title}
                      onChange={e => handleUpdateSlide(slide.id, 'title', e.target.value)}
                      className="w-full px-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-zinc-400">Subtitle / Tagline</label>
                    <input
                      type="text"
                      value={slide.subtitle || ''}
                      onChange={e => handleUpdateSlide(slide.id, 'subtitle', e.target.value)}
                      className="w-full px-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-white"
                    />
                  </div>

                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-[11px] font-medium text-zinc-400">Target Destination URL</label>
                    <input
                      type="text"
                      value={slide.destinationUrl}
                      onChange={e => handleUpdateSlide(slide.id, 'destinationUrl', e.target.value)}
                      className="w-full px-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-white font-mono"
                      placeholder="https://..."
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SECTION 2: Desktop Side Ads */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white">Desktop Side Ads (Reader Canvas & 2XL Viewport)</h2>
            <p className="text-xs text-zinc-400">Vertical banners flanking the reader canvas and library view with looping image slideshow.</p>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="sideAdsEnabled"
              checked={ads.sideAds.enabled}
              onChange={e => setAds({
                ...ads,
                sideAds: { ...ads.sideAds, enabled: e.target.checked }
              })}
              className="rounded bg-zinc-900 border-zinc-800 text-emerald-500"
            />
            <label htmlFor="sideAdsEnabled" className="text-xs font-medium text-zinc-300 cursor-pointer">
              Enable Side Ads
            </label>
          </div>
        </div>

        {/* Global Slide Rotation Interval */}
        <div className="max-w-xs space-y-1">
          <label className="text-xs font-medium text-zinc-400">Rotation Interval (Seconds)</label>
          <input
            type="number"
            min="2"
            max="60"
            value={ads.sideAds.rotationIntervalSeconds || 5}
            onChange={e => setAds({
              ...ads,
              sideAds: { ...ads.sideAds, rotationIntervalSeconds: parseInt(e.target.value) || 5 }
            })}
            className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white"
          />
        </div>

        {/* Dynamic Slides for Desktop Side Ads */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">
              Slideshow Image Creatives (Auto-Loop)
            </h3>
            <button
              onClick={handleAddSideAdSlide}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-xs font-medium text-white transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Slide</span>
            </button>
          </div>

          <div className="space-y-3">
            {(ads.sideAds.slides || []).map((slide, idx) => (
              <div key={slide.id || idx} className="p-4 bg-zinc-900/40 border border-zinc-850 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-zinc-400">Slide #{idx + 1}</span>
                  <div className="flex items-center space-x-3">
                    <label className="flex items-center space-x-1.5 text-xs text-zinc-400 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={slide.active !== false}
                        onChange={e => handleUpdateSideAdSlide(slide.id, 'active', e.target.checked)}
                        className="rounded bg-zinc-900 border-zinc-800 text-emerald-500"
                      />
                      <span>Active</span>
                    </label>
                    <button
                      onClick={() => handleRemoveSideAdSlide(slide.id)}
                      className="p-1 text-zinc-500 hover:text-red-400 rounded transition-colors"
                      title="Delete Slide"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-zinc-400">Title / Label</label>
                    <input
                      type="text"
                      value={slide.title || ''}
                      onChange={e => handleUpdateSideAdSlide(slide.id, 'title', e.target.value)}
                      className="w-full px-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-white"
                      placeholder="e.g. Enterprise Architecture"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-zinc-400">Image URL</label>
                    <input
                      type="text"
                      value={slide.imageUrl || ''}
                      onChange={e => handleUpdateSideAdSlide(slide.id, 'imageUrl', e.target.value)}
                      className="w-full px-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-white font-mono"
                      placeholder="/uploads/ad_side_1.png"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-zinc-400">Destination URL</label>
                    <input
                      type="text"
                      value={slide.destinationUrl || ''}
                      onChange={e => handleUpdateSideAdSlide(slide.id, 'destinationUrl', e.target.value)}
                      className="w-full px-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-white font-mono"
                      placeholder="https://..."
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Fallback Left & Right Placement Banners */}
        <div className="pt-4 border-t border-zinc-900">
          <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-4">
            Fallback Static Placements
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Left Ad */}
            <div className="p-4 bg-zinc-900/40 border border-zinc-850 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-white">Left Banner Default</h4>
                <input
                  type="checkbox"
                  id="leftAdEnabled"
                  checked={ads.sideAds.leftAd.enabled}
                  onChange={e => setAds({
                    ...ads,
                    sideAds: { ...ads.sideAds, leftAd: { ...ads.sideAds.leftAd, enabled: e.target.checked } }
                  })}
                  className="rounded bg-zinc-900 border-zinc-800 text-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-zinc-400">Creative Image URL</label>
                <input
                  type="text"
                  value={ads.sideAds.leftAd.imageUrl}
                  onChange={e => setAds({
                    ...ads,
                    sideAds: { ...ads.sideAds, leftAd: { ...ads.sideAds.leftAd, imageUrl: e.target.value } }
                  })}
                  className="w-full px-3 py-1.5 bg-zinc-950 border border-zinc-850 rounded-lg text-xs text-white font-mono"
                  placeholder="/uploads/ad_side_1.png"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-zinc-400">Destination Link</label>
                <input
                  type="text"
                  value={ads.sideAds.leftAd.destinationUrl}
                  onChange={e => setAds({
                    ...ads,
                    sideAds: { ...ads.sideAds, leftAd: { ...ads.sideAds.leftAd, destinationUrl: e.target.value } }
                  })}
                  className="w-full px-3 py-1.5 bg-zinc-950 border border-zinc-850 rounded-lg text-xs text-white font-mono"
                  placeholder="https://..."
                />
              </div>
            </div>

            {/* Right Ad */}
            <div className="p-4 bg-zinc-900/40 border border-zinc-850 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-white">Right Banner Default</h4>
                <input
                  type="checkbox"
                  id="rightAdEnabled"
                  checked={ads.sideAds.rightAd.enabled}
                  onChange={e => setAds({
                    ...ads,
                    sideAds: { ...ads.sideAds, rightAd: { ...ads.sideAds.rightAd, enabled: e.target.checked } }
                  })}
                  className="rounded bg-zinc-900 border-zinc-800 text-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-zinc-400">Creative Image URL</label>
                <input
                  type="text"
                  value={ads.sideAds.rightAd.imageUrl}
                  onChange={e => setAds({
                    ...ads,
                    sideAds: { ...ads.sideAds, rightAd: { ...ads.sideAds.rightAd, imageUrl: e.target.value } }
                  })}
                  className="w-full px-3 py-1.5 bg-zinc-950 border border-zinc-850 rounded-lg text-xs text-white font-mono"
                  placeholder="/uploads/ad_side_2.png"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-zinc-400">Destination Link</label>
                <input
                  type="text"
                  value={ads.sideAds.rightAd.destinationUrl}
                  onChange={e => setAds({
                    ...ads,
                    sideAds: { ...ads.sideAds, rightAd: { ...ads.sideAds.rightAd, destinationUrl: e.target.value } }
                  })}
                  className="w-full px-3 py-1.5 bg-zinc-950 border border-zinc-850 rounded-lg text-xs text-white font-mono"
                  placeholder="https://..."
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 3: Mobile Top Ad Banner */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white">Mobile Top Ad Banner (Thick Image Bar)</h2>
            <p className="text-xs text-zinc-400">Horizontal banner shown at the top of the viewer on mobile devices in auto-slideshow loop.</p>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="mobileBannerEnabled"
              checked={ads.mobileBanner?.enabled ?? true}
              onChange={e => setAds({
                ...ads,
                mobileBanner: { ...(ads.mobileBanner || { slides: [] }), enabled: e.target.checked }
              })}
              className="rounded bg-zinc-900 border-zinc-800 text-emerald-500"
            />
            <label htmlFor="mobileBannerEnabled" className="text-xs font-medium text-zinc-300 cursor-pointer">
              Enable Mobile Banner
            </label>
          </div>
        </div>

        {/* Mobile Banner Rotation Interval */}
        <div className="max-w-xs space-y-1">
          <label className="text-xs font-medium text-zinc-400">Rotation Interval (Seconds)</label>
          <input
            type="number"
            min="2"
            max="60"
            value={ads.mobileBanner?.rotationIntervalSeconds || 5}
            onChange={e => setAds({
              ...ads,
              mobileBanner: { ...(ads.mobileBanner || { slides: [], enabled: true }), rotationIntervalSeconds: parseInt(e.target.value) || 5 }
            })}
            className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white"
          />
        </div>

        {/* Dynamic Slides for Mobile Banner */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">
              Mobile Slideshow Image Creatives (Auto-Loop)
            </h3>
            <button
              onClick={handleAddMobileBannerSlide}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-xs font-medium text-white transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Slide</span>
            </button>
          </div>

          <div className="space-y-3">
            {(ads.mobileBanner?.slides || []).map((slide, idx) => (
              <div key={slide.id || idx} className="p-4 bg-zinc-900/40 border border-zinc-850 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-zinc-400">Mobile Slide #{idx + 1}</span>
                  <div className="flex items-center space-x-3">
                    <label className="flex items-center space-x-1.5 text-xs text-zinc-400 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={slide.active !== false}
                        onChange={e => handleUpdateMobileBannerSlide(slide.id, 'active', e.target.checked)}
                        className="rounded bg-zinc-900 border-zinc-800 text-emerald-500"
                      />
                      <span>Active</span>
                    </label>
                    <button
                      onClick={() => handleRemoveMobileBannerSlide(slide.id)}
                      className="p-1 text-zinc-500 hover:text-red-400 rounded transition-colors"
                      title="Delete Slide"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-zinc-400">Title / Label</label>
                    <input
                      type="text"
                      value={slide.title || ''}
                      onChange={e => handleUpdateMobileBannerSlide(slide.id, 'title', e.target.value)}
                      className="w-full px-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-white"
                      placeholder="e.g. Ūrdhv Ascens Studio"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-zinc-400">Image URL</label>
                    <input
                      type="text"
                      value={slide.imageUrl || ''}
                      onChange={e => handleUpdateMobileBannerSlide(slide.id, 'imageUrl', e.target.value)}
                      className="w-full px-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-white font-mono"
                      placeholder="/uploads/ad_mobile_1.png"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-zinc-400">Destination URL</label>
                    <input
                      type="text"
                      value={slide.destinationUrl || ''}
                      onChange={e => handleUpdateMobileBannerSlide(slide.id, 'destinationUrl', e.target.value)}
                      className="w-full px-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-white font-mono"
                      placeholder="https://..."
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
