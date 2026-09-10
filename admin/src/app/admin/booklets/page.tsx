'use client';

import { useState, useEffect } from 'react';
import type { Booklet } from '@/core/types';
import { getBooklets, updateBooklet, uploadAsset } from '@/lib/api-client';
import {
  BookOpen,
  Image as ImageIcon,
  Check,
  Upload,
  Layers,
  Sparkles,
  ExternalLink,
  Save,
  Loader2,
  RefreshCw
} from 'lucide-react';

export default function BookletsAdminPage() {
  const [booklets, setBooklets] = useState<Booklet[]>([]);
  const [selectedBooklet, setSelectedBooklet] = useState<Booklet | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Form edit fields for selected booklet
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editCoverPath, setEditCoverPath] = useState('');
  const [editCustomCoverUrl, setEditCustomCoverUrl] = useState('');
  const [editActive, setEditActive] = useState(true);
  const [editOrder, setEditOrder] = useState(1);

  const loadBooklets = async () => {
    setLoading(true);
    try {
      const data = await getBooklets();
      setBooklets(data);
      if (data.length > 0 && !selectedBooklet) {
        selectBooklet(data[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBooklets();
  }, []);

  const selectBooklet = (b: Booklet) => {
    setSelectedBooklet(b);
    setEditTitle(b.title);
    setEditDescription(b.shortDescription);
    setEditCoverPath(b.coverPath);
    setEditCustomCoverUrl(b.customCoverUrl || '');
    setEditActive(b.active);
    setEditOrder(b.displayOrder);
    setStatusMessage(null);
  };

  // Helper to get thumbnail URL for any page in this booklet
  const getPageThumbUrl = (pageIndex: number) => {
    if (!selectedBooklet) return '';
    const pad = String(pageIndex).padStart(4, '0');
    return `${selectedBooklet.cdnBaseUrl}${selectedBooklet.thumbnailDirectory}${pad}.webp`;
  };

  // Select page from grid as cover
  const handleSelectPageAsCover = (pageIndex: number) => {
    const pad = String(pageIndex).padStart(4, '0');
    const newCover = `${selectedBooklet?.thumbnailDirectory}${pad}.webp`;
    setEditCoverPath(newCover);
    setEditCustomCoverUrl(''); // clear external override if selecting native page
    setStatusMessage(`Selected Page ${pageIndex} as primary cover thumbnail.`);
  };

  // Upload custom external cover thumbnail
  const handleUploadCustomCover = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const res = await uploadAsset(file);
      if (res.success && res.url) {
        setEditCustomCoverUrl(res.url);
        setStatusMessage('Custom cover uploaded successfully! Click Save to apply.');
      } else {
        alert(res.message || 'Upload failed.');
      }
    } catch (err: any) {
      alert(err.message || 'Upload error.');
    } finally {
      setUploadingImage(false);
    }
  };

  // Save changes
  const handleSave = async () => {
    if (!selectedBooklet) return;
    setSaving(true);
    setStatusMessage(null);

    const updated: Partial<Booklet> & { id: string } = {
      id: selectedBooklet.id,
      title: editTitle,
      shortDescription: editDescription,
      coverPath: editCoverPath,
      customCoverUrl: editCustomCoverUrl,
      active: editActive,
      displayOrder: editOrder
    };

    try {
      const res = await updateBooklet(updated);
      if (res.success) {
        setStatusMessage('✅ Booklet and thumbnail changes saved live to Hostinger!');
        // Update local list
        setBooklets(prev =>
          prev.map(b => (b.id === selectedBooklet.id ? { ...b, ...updated } : b))
        );
        setSelectedBooklet(prev => (prev ? { ...prev, ...updated } : null));
      } else {
        alert(res.message || 'Save failed.');
      }
    } catch (err: any) {
      alert(err.message || 'Failed to save booklet.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-zinc-400">
        <Loader2 className="w-8 h-8 text-emerald-400 animate-spin mr-3" />
        <span className="text-sm font-mono">Loading Booklet Catalog...</span>
      </div>
    );
  }

  // Current active cover preview
  const currentCoverPreview = editCustomCoverUrl 
    ? editCustomCoverUrl 
    : (selectedBooklet ? `${selectedBooklet.cdnBaseUrl}${editCoverPath}` : '');

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white uppercase flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-emerald-400" />
            <span>Booklet Management & Thumbnail Editor</span>
          </h1>
          <p className="text-zinc-400 text-xs mt-1">
            Configure CDN endpoints, page counts, active statuses, and visually customize booklet covers.
          </p>
        </div>

        <button
          onClick={loadBooklets}
          className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 hover:text-white transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {statusMessage && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 font-medium">
          {statusMessage}
        </div>
      )}

      {/* Main Grid: Left booklet list, Right Manual Thumbnail Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Booklet Selector (4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
            All 12 Course Booklets
          </h2>

          <div className="space-y-2 max-h-[75vh] overflow-y-auto pr-1">
            {booklets.map((b) => {
              const isSelected = selectedBooklet?.id === b.id;
              const isStudent = b.category === 'student';

              return (
                <div
                  key={b.id}
                  onClick={() => selectBooklet(b)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                    isSelected
                      ? 'bg-emerald-500/10 border-emerald-500/40 text-white'
                      : 'bg-zinc-950 border-zinc-800/80 hover:border-zinc-700 text-zinc-300'
                  }`}
                >
                  <div className="truncate pr-2">
                    <div className="flex items-center space-x-2">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          b.active ? 'bg-emerald-400' : 'bg-zinc-600'
                        }`}
                      />
                      <h4 className="text-xs font-bold truncate">{b.title}</h4>
                    </div>
                    <p className="text-[11px] text-zinc-500 mt-0.5">
                      {isStudent ? 'Students AI' : 'Educators Toolkit'} • {b.totalPages} Pages
                    </p>
                  </div>

                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400">
                    {b.id}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Manual Thumbnail Editor (8 cols) */}
        {selectedBooklet && (
          <div className="lg:col-span-8 bg-zinc-950 border border-zinc-800 rounded-2xl p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-zinc-850 pb-4">
              <div>
                <span className="text-[10px] uppercase tracking-widest font-mono text-emerald-400">
                  Editing Booklet
                </span>
                <h2 className="text-lg font-bold text-white">{selectedBooklet.title}</h2>
              </div>

              <button
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center space-x-2 px-4 py-2 bg-emerald-400 hover:bg-emerald-300 text-black font-bold text-xs rounded-lg transition-colors disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>Save Changes</span>
              </button>
            </div>

            {/* Current Cover Preview & Custom Upload */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-start bg-zinc-900/40 p-4 rounded-xl border border-zinc-850">
              <div className="sm:col-span-4 aspect-[3/4] bg-zinc-900 rounded-lg overflow-hidden border border-zinc-700 relative">
                <img
                  src={currentCoverPreview}
                  alt="Cover preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="400" viewBox="0 0 300 400"><rect fill="%2318181b" width="300" height="400"/><text fill="%2300ff66" font-size="20" font-family="sans-serif" x="50%" y="50%" text-anchor="middle">COVER PREVIEW</text></svg>';
                  }}
                />
                <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded text-[10px] font-semibold bg-black text-emerald-400 border border-emerald-500/30">
                  Active Cover
                </span>
              </div>

              <div className="sm:col-span-8 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Manual Cover Selection</span>
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Choose any page thumbnail from the grid below, or upload a custom studio graphic to serve as this booklet's library cover.
                </p>

                <div className="pt-2">
                  <label className="inline-flex items-center space-x-2 px-3 py-2 bg-zinc-800 hover:bg-zinc-750 text-white rounded-lg text-xs font-medium cursor-pointer transition-colors border border-zinc-700">
                    <Upload className="w-4 h-4 text-emerald-400" />
                    <span>{uploadingImage ? 'Uploading Image...' : 'Upload Custom Cover Graphic'}</span>
                    <input
                      type="file"
                      accept="image/webp,image/jpeg,image/png"
                      onChange={handleUploadCustomCover}
                      disabled={uploadingImage}
                      className="hidden"
                    />
                  </label>
                  {editCustomCoverUrl && (
                    <button
                      onClick={() => setEditCustomCoverUrl('')}
                      className="text-xs text-red-400 hover:underline ml-3"
                    >
                      Revert to page cover
                    </button>
                  )}
                </div>

                <div className="text-[11px] text-zinc-500 font-mono pt-2">
                  Cover Path: <code className="text-zinc-300">{editCoverPath}</code>
                </div>
              </div>
            </div>

            {/* Visual Page Grid (Spec §3.5) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Select Any Page As Cover ({selectedBooklet.totalPages} Pages)</span>
                </h3>
                <span className="text-[11px] text-zinc-500">Click any thumbnail to set as cover</span>
              </div>

              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2.5 max-h-72 overflow-y-auto p-2 bg-zinc-900/30 rounded-xl border border-zinc-850">
                {Array.from({ length: selectedBooklet.totalPages }, (_, i) => i + 1).map((pageIdx) => {
                  const pad = String(pageIdx).padStart(4, '0');
                  const isCurrentPage = editCoverPath.includes(pad);

                  return (
                    <button
                      key={pageIdx}
                      type="button"
                      onClick={() => handleSelectPageAsCover(pageIdx)}
                      className={`relative aspect-[3/4] rounded-lg overflow-hidden border transition-all ${
                        isCurrentPage
                          ? 'border-emerald-400 ring-2 ring-emerald-500/50 scale-95'
                          : 'border-zinc-800 hover:border-zinc-600 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={getPageThumbUrl(pageIdx)}
                        alt={`Page ${pageIdx}`}
                        loading="lazy"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="60" height="80" viewBox="0 0 60 80"><rect fill="%2318181b" width="60" height="80"/><text fill="%2371717a" font-size="10" font-family="sans-serif" x="50%" y="50%" text-anchor="middle">p.' + pageIdx + '</text></svg>';
                        }}
                      />
                      <span className="absolute bottom-1 right-1 px-1 py-0.5 rounded text-[8px] font-mono font-bold bg-black/80 text-white">
                        {pageIdx}
                      </span>
                      {isCurrentPage && (
                        <div className="absolute inset-0 bg-emerald-500/20 flex items-center justify-center">
                          <Check className="w-4 h-4 text-emerald-400 drop-shadow" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Metadata Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-zinc-850 pt-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-300">Booklet Title</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-300">Display Order</label>
                <input
                  type="number"
                  value={editOrder}
                  onChange={(e) => setEditOrder(parseInt(e.target.value, 10) || 1)}
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className="text-xs font-semibold text-zinc-300">Short Description</label>
                <textarea
                  rows={2}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="activeCheck"
                  checked={editActive}
                  onChange={(e) => setEditActive(e.target.checked)}
                  className="rounded bg-zinc-900 border-zinc-800 text-emerald-500 focus:ring-emerald-500"
                />
                <label htmlFor="activeCheck" className="text-xs font-semibold text-zinc-300 cursor-pointer">
                  Booklet Active (Visible in Viewer Library)
                </label>
              </div>

              <div className="flex items-center justify-end pt-2">
                <a
                  href={`${selectedBooklet.cdnBaseUrl}/manifest.json`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-emerald-400 hover:text-emerald-300 inline-flex items-center gap-1 font-mono"
                >
                  <span>View CDN Manifest</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
