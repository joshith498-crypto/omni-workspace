import React, { useState, useRef } from 'react';
import {
  Search,
  Upload,
  Image as ImageIcon,
  Video,
  Eye,
  Trash2,
  Star,
  Play,
  X,
  Palette,
  Check,
  Tag,
  Maximize2,
  Layers,
  FileCode,
} from 'lucide-react';
import { MediaItem } from '../types';
import { analyzeMediaAsset } from '../utils/aiEngine';

interface VisualMediaViewProps {
  media: MediaItem[];
  onSaveMedia: (media: MediaItem[]) => void;
  selectedMediaItem?: MediaItem | null;
  onLogActivity: (type: 'media' | 'command', title: string, desc: string) => void;
  initialSearchQuery?: string;
}

export const VisualMediaView: React.FC<VisualMediaViewProps> = ({
  media,
  onSaveMedia,
  selectedMediaItem,
  onLogActivity,
  initialSearchQuery = '',
}) => {
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [activeFilter, setActiveFilter] = useState<'all' | 'photo' | 'video' | 'favorites'>('all');
  const [inspectItem, setInspectItem] = useState<MediaItem | null>(selectedMediaItem || null);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [copiedColor, setCopiedColor] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredMedia = media.filter((item) => {
    if (activeFilter === 'photo' && item.type !== 'image') return false;
    if (activeFilter === 'video' && item.type !== 'video') return false;
    if (activeFilter === 'favorites' && !item.favorite) return false;

    if (!searchQuery.trim()) return true;

    const q = searchQuery.toLowerCase().trim();
    const matchName = item.name.toLowerCase().includes(q);
    const matchSummary = item.summary.toLowerCase().includes(q);
    const matchTags = item.tags.some((t) => t.toLowerCase().includes(q));
    const matchObjects = item.detectedObjects.some((o) => o.toLowerCase().includes(q));
    const matchOcr = item.ocrText?.toLowerCase().includes(q) || false;
    const matchType = item.type.toLowerCase().includes(q);

    const searchTerms = q.split(' ').filter(Boolean);
    const multiMatch = searchTerms.every(
      (term) =>
        item.name.toLowerCase().includes(term) ||
        item.tags.some((t) => t.toLowerCase().includes(term)) ||
        item.detectedObjects.some((o) => o.toLowerCase().includes(term))
    );

    return matchName || matchSummary || matchTags || matchObjects || matchOcr || matchType || multiMatch;
  });

  const handleFilesSelected = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setIsAnalyzing(true);

    const newItems: MediaItem[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const isVideo = file.type.startsWith('video');
      const isImage = file.type.startsWith('image');

      if (!isImage && !isVideo) continue;

      const url = URL.createObjectURL(file);
      const analysis = await analyzeMediaAsset(file);

      const newItem: MediaItem = {
        id: 'media-local-' + Date.now() + '-' + i,
        name: file.name.replace(/\.[^/.]+$/, ''),
        type: isVideo ? 'video' : 'image',
        url: url,
        thumbnailUrl: isVideo ? undefined : url,
        tags: analysis.tags,
        detectedObjects: analysis.detectedObjects,
        dominantColors: analysis.dominantColors,
        summary: analysis.summary,
        fileSize: (file.size / (1024 * 1024)).toFixed(1) + ' MB',
        dimensions: analysis.dimensions,
        ocrText: analysis.ocrText,
        createdAt: new Date().toISOString(),
        favorite: false,
        isUserUploaded: true,
      };

      newItems.push(newItem);
    }

    if (newItems.length > 0) {
      const updated = [...newItems, ...media];
      onSaveMedia(updated);
      setInspectItem(newItems[0]);
      onLogActivity(
        'media',
        'Device Media Imported',
        `Indexed ${newItems.length} file(s) into workspace library`
      );
    }

    setIsAnalyzing(false);
  };

  const handleToggleFavorite = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const updated = media.map((m) =>
      m.id === id ? { ...m, favorite: !m.favorite } : m
    );
    onSaveMedia(updated);
    if (inspectItem?.id === id) {
      setInspectItem({ ...inspectItem, favorite: !inspectItem.favorite });
    }
  };

  const handleDeleteMedia = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const updated = media.filter((m) => m.id !== id);
    onSaveMedia(updated);
    if (inspectItem?.id === id) {
      setInspectItem(null);
    }
    onLogActivity('media', 'Media Removed', 'Asset removed from gallery');
  };

  const handleCopyColor = (colorHex: string) => {
    navigator.clipboard.writeText(colorHex);
    setCopiedColor(colorHex);
    setTimeout(() => setCopiedColor(null), 1500);
  };

  return (
    <div className="space-y-6 pb-16">
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,video/*"
        onChange={(e) => handleFilesSelected(e.target.files)}
        className="hidden"
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white text-glow-sm">
            Visual Media Studio
          </h1>
          <p className="text-zinc-400 text-xs sm:text-sm mt-0.5">
            Import photos and videos with smart tag indexing and instant full-resolution preview.
          </p>
        </div>

        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isAnalyzing}
          className="btn-3d flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-b from-white to-zinc-200 text-zinc-950 text-xs sm:text-sm font-bold shadow-md transition cursor-pointer shrink-0"
        >
          <Upload className={`w-4 h-4 ${isAnalyzing ? 'animate-bounce' : ''}`} />
          <span>{isAnalyzing ? 'Analyzing Media...' : 'Import Device Files'}</span>
        </button>
      </div>

      {/* Contextual Search & Filters */}
      <div className="space-y-2.5">
        <div className="relative bg-zinc-900/85 border border-zinc-800 rounded-xl p-2 flex items-center gap-2 specular-card focus-within:border-cyan-500/60 focus-within:shadow-[0_0_25px_-5px_rgba(6,182,212,0.3)] transition-all">
          <Search className="w-4 h-4 text-zinc-400 ml-1 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search media by natural phrase (e.g. 'screenshot', 'diagram', 'server', 'landscape')..."
            className="flex-1 bg-transparent text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 outline-none px-1 min-w-0"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="p-1 text-zinc-400 hover:text-white rounded cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Badges */}
        <div className="flex items-center justify-between gap-2 overflow-x-auto no-scrollbar py-0.5">
          <div className="flex items-center gap-1.5">
            {(
              [
                { id: 'all', label: 'All Files' },
                { id: 'photo', label: 'Photos' },
                { id: 'video', label: 'Videos' },
                { id: 'favorites', label: 'Favorites' },
              ] as const
            ).map((filter) => (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                  activeFilter === filter.id
                    ? 'bg-zinc-800 text-white border border-zinc-700'
                    : 'bg-zinc-900/60 text-zinc-400 hover:text-zinc-200 border border-zinc-800/60'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>

          <span className="text-[11px] text-zinc-500 font-mono shrink-0">
            {filteredMedia.length} of {media.length} items
          </span>
        </div>
      </div>

      {/* Drag and Drop Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          handleFilesSelected(e.dataTransfer.files);
        }}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-6 text-center transition cursor-pointer ${
          isDragging
            ? 'border-zinc-400 bg-zinc-800/40 text-white'
            : 'border-zinc-800/80 hover:border-zinc-700 bg-zinc-950/40 text-zinc-400'
        }`}
      >
        <div className="flex flex-col items-center gap-1.5">
          <Upload className="w-5 h-5 text-zinc-400" />
          <p className="text-xs sm:text-sm font-medium text-zinc-300">
            Drop device photos or videos here, or click to browse
          </p>
          <p className="text-[11px] text-zinc-500">
            Supports PNG, JPEG, WebP, MP4, and QuickTime · Stored locally in browser
          </p>
        </div>
      </div>

      {/* Gallery Grid */}
      {filteredMedia.length === 0 ? (
        <div className="py-16 text-center space-y-3 bg-zinc-900/40 rounded-xl border border-zinc-800/60">
          <div className="w-12 h-12 mx-auto rounded-lg bg-zinc-800 border border-zinc-700/60 flex items-center justify-center text-zinc-500">
            <ImageIcon className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-zinc-200">No media assets found</h3>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto">
              {media.length === 0
                ? 'Import photos or videos from your phone or PC storage to populate your workspace gallery.'
                : `No assets matched "${searchQuery}".`}
            </p>
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-3.5 py-1.5 rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-semibold shadow-sm inline-flex items-center gap-1.5"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Select Media Files</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredMedia.map((item) => (
            <div
              key={item.id}
              onClick={() => setInspectItem(item)}
              className="group relative bg-zinc-900/60 border border-zinc-800/80 rounded-xl overflow-hidden hover:border-zinc-700 transition cursor-pointer flex flex-col"
            >
              {/* Media Preview Container */}
              <div className="aspect-[4/3] bg-zinc-950 relative overflow-hidden flex items-center justify-center">
                {item.type === 'video' ? (
                  item.thumbnailUrl ? (
                    <img
                      src={item.thumbnailUrl}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                  ) : (
                    <video
                      src={item.url}
                      className="w-full h-full object-cover"
                      muted
                      playsInline
                    />
                  )
                ) : (
                  <img
                    src={item.url}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    loading="lazy"
                  />
                )}

                {/* Video Play Overlay */}
                {item.type === 'video' && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <div className="w-9 h-9 rounded-full bg-zinc-900/80 border border-zinc-700 text-white flex items-center justify-center shadow">
                      <Play className="w-4 h-4 fill-white ml-0.5" />
                    </div>
                  </div>
                )}

                {/* Quick actions top bar */}
                <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition duration-200">
                  <button
                    onClick={(e) => handleToggleFavorite(item.id, e)}
                    className="p-1.5 rounded-md bg-zinc-900/80 text-zinc-300 hover:text-amber-400 border border-zinc-700"
                    title="Favorite"
                  >
                    <Star
                      className={`w-3.5 h-3.5 ${
                        item.favorite ? 'fill-amber-400 text-amber-400' : ''
                      }`}
                    />
                  </button>
                  <button
                    onClick={(e) => handleDeleteMedia(item.id, e)}
                    className="p-1.5 rounded-md bg-zinc-900/80 text-zinc-300 hover:text-red-400 border border-zinc-700"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Card Meta Footer */}
              <div className="p-3 space-y-1.5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-1 text-[10px] text-zinc-500 font-mono mb-1">
                    <span className="uppercase">{item.type}</span>
                    <span>{item.fileSize}</span>
                  </div>
                  <h4 className="text-xs font-semibold text-zinc-200 truncate">
                    {item.name}
                  </h4>
                </div>

                <div className="flex flex-wrap gap-1 pt-1">
                  {item.tags.slice(0, 3).map((tag, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400 font-mono"
                    >
                      #{tag}
                    </span>
                  ))}
                  {item.tags.length > 3 && (
                    <span className="text-[10px] text-zinc-600 font-mono">
                      +{item.tags.length - 3}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Media Detail & Metadata Modal */}
      {inspectItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="absolute inset-0" onClick={() => setInspectItem(null)} />

          <div className="relative w-full max-w-3xl bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl z-10 flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
              <div className="min-w-0 flex items-center gap-2">
                <span className="text-xs uppercase px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 font-mono">
                  {inspectItem.type}
                </span>
                <h3 className="font-semibold text-white text-sm sm:text-base truncate">
                  {inspectItem.name}
                </h3>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={(e) => handleToggleFavorite(inspectItem.id, e)}
                  className="p-1.5 rounded-lg border border-zinc-700 bg-zinc-800 text-zinc-300 hover:text-amber-400"
                >
                  <Star
                    className={`w-4 h-4 ${
                      inspectItem.favorite ? 'fill-amber-400 text-amber-400' : ''
                    }`}
                  />
                </button>
                <button
                  onClick={() => setInspectItem(null)}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-white bg-zinc-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
              {/* Media Display Viewport */}
              <div className="rounded-xl overflow-hidden bg-zinc-950 border border-zinc-800 flex items-center justify-center max-h-[380px]">
                {inspectItem.type === 'video' ? (
                  <video
                    src={inspectItem.url}
                    controls
                    autoPlay
                    className="max-h-[360px] w-auto max-w-full rounded-lg"
                  />
                ) : (
                  <img
                    src={inspectItem.url}
                    alt={inspectItem.name}
                    className="max-h-[360px] w-auto max-w-full object-contain"
                  />
                )}
              </div>

              {/* Metadata Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-zinc-950/60 border border-zinc-800">
                  <span className="text-zinc-500 block text-[10px] uppercase font-mono">
                    Dimensions
                  </span>
                  <span className="text-zinc-200 font-semibold font-mono">
                    {inspectItem.dimensions || 'Dynamic'}
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-zinc-950/60 border border-zinc-800">
                  <span className="text-zinc-500 block text-[10px] uppercase font-mono">
                    File Size
                  </span>
                  <span className="text-zinc-200 font-semibold font-mono">
                    {inspectItem.fileSize}
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-zinc-950/60 border border-zinc-800">
                  <span className="text-zinc-500 block text-[10px] uppercase font-mono">
                    Created
                  </span>
                  <span className="text-zinc-200 font-semibold font-mono">
                    {new Date(inspectItem.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-zinc-950/60 border border-zinc-800">
                  <span className="text-zinc-500 block text-[10px] uppercase font-mono">
                    Storage Mode
                  </span>
                  <span className="text-emerald-400 font-semibold">Local Storage</span>
                </div>
              </div>

              {/* Summary Description */}
              <div className="space-y-1.5">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Semantic Summary
                </h4>
                <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed p-3 rounded-lg bg-zinc-950/60 border border-zinc-800">
                  {inspectItem.summary}
                </p>
              </div>

              {/* Detected Tags & Objects */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5" />
                    <span>Indexed Tags</span>
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {inspectItem.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="text-xs px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1">
                    <Palette className="w-3.5 h-3.5" />
                    <span>Dominant Colors</span>
                  </h4>
                  <div className="flex items-center gap-2">
                    {inspectItem.dominantColors.map((color, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleCopyColor(color)}
                        className="group/c relative flex flex-col items-center gap-1"
                        title={`Copy ${color}`}
                      >
                        <div
                          className="w-8 h-8 rounded-lg border border-white/20 shadow-sm transition group-hover/c:scale-110"
                          style={{ backgroundColor: color }}
                        />
                        <span className="text-[10px] text-zinc-500 font-mono">
                          {copiedColor === color ? 'Copied' : color}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
