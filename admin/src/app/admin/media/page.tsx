'use client';

import { useState } from 'react';
import { CldUploadWidget } from 'next-cloudinary';
import { Image as ImageIcon, UploadCloud, Copy, ExternalLink, Trash2 } from 'lucide-react';
import Image from 'next/image';

interface CloudinaryResult {
  info: {
    secure_url: string;
    public_id: string;
    format: string;
    width: number;
    height: number;
    bytes: number;
  };
  event: string;
}

export default function MediaLibrary() {
  const [uploadedAssets, setUploadedAssets] = useState<CloudinaryResult['info'][]>([]);

  const handleUploadSuccess = (result: any) => {
    if (result.event === 'success') {
      setUploadedAssets(prev => [result.info, ...prev]);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('URL copied to clipboard!');
  };

  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto pb-24">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Media Library</h2>
          <p className="text-muted-foreground mt-2">Manage all assets via your dedicated Cloudinary CDN.</p>
        </div>
        
        <CldUploadWidget 
          uploadPreset="ml_default" // The default unsigned preset or change to your specific preset
          onSuccess={handleUploadSuccess}
          options={{
            maxFiles: 10,
            resourceType: "auto", // support images and videos
            clientAllowedFormats: ["png", "jpg", "jpeg", "webp", "avif", "mp4", "webm"],
          }}
        >
          {({ open }) => {
            return (
              <button 
                onClick={() => open()} 
                className="flex items-center gap-2 bg-emerald-400 text-black px-5 py-2.5 rounded-lg font-bold text-xs uppercase tracking-wider hover:bg-emerald-300 transition-colors"
              >
                <UploadCloud size={20} />
                Upload New Media
              </button>
            );
          }}
        </CldUploadWidget>
      </div>

      <div className="bg-card border border-border rounded-xl p-8 min-h-[400px]">
        {uploadedAssets.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center gap-4 py-20">
            <div className="p-4 bg-secondary rounded-full">
              <ImageIcon className="w-8 h-8 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-xl font-medium mb-1">No media uploaded in this session</h3>
              <p className="text-muted-foreground">Upload images or videos to generate highly-optimized CDN URLs.</p>
            </div>
            <p className="text-sm text-muted-foreground/70 mt-4 max-w-sm">
              Note: Historic assets are managed directly in your Cloudinary console. Newly uploaded assets will appear here during your active session.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {uploadedAssets.map((asset) => (
              <div key={asset.public_id} className="group flex flex-col gap-3 bg-background border border-border rounded-xl overflow-hidden shadow-sm hover:border-primary/30 transition-colors">
                <div className="relative aspect-square w-full bg-secondary border-b border-border overflow-hidden">
                  {asset.format === 'mp4' || asset.format === 'webm' ? (
                    <video 
                      src={asset.secure_url} 
                      className="w-full h-full object-cover"
                      muted 
                      loop 
                      autoPlay 
                      playsInline
                    />
                  ) : (
                    <Image 
                      src={asset.secure_url} 
                      alt={asset.public_id}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 50vw, 25vw"
                    />
                  )}
                  <div className="absolute top-2 right-2 px-2 py-1 bg-black text-white text-[10px] font-mono rounded border border-zinc-800 uppercase">
                    {asset.format}
                  </div>
                </div>
                
                <div className="p-3 flex flex-col gap-2">
                  <span className="text-xs font-medium truncate" title={asset.public_id}>
                    {asset.public_id}
                  </span>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => copyToClipboard(asset.secure_url)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-secondary hover:bg-primary/10 hover:text-primary transition-colors rounded text-xs font-medium"
                    >
                      <Copy size={12} /> Copy URL
                    </button>
                    <a 
                      href={asset.secure_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-8 flex items-center justify-center bg-secondary hover:bg-secondary/80 transition-colors rounded text-muted-foreground hover:text-foreground"
                    >
                      <ExternalLink size={14} />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
