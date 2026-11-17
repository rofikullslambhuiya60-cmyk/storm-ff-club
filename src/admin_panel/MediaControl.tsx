import React, { useState, useRef } from 'react';
import {
  Image as ImageIcon, Plus, Trash2, ExternalLink, CheckCircle2,
  Upload, Link as LinkIcon, AlertTriangle, Edit3, Loader2, Sparkles
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { dbStore } from '../services/firebaseConfig';
import { Banner } from '../types';
import { BannerImage } from '../components/BannerImage';
import {
  normalizeBannerImageUrl,
  isValidBannerImageSrc,
  processAndUploadBannerImage
} from '../services/bannerImageService';

export const MediaControl: React.FC = () => {
  const { banners } = useApp();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingBannerId, setEditingBannerId] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [inputMode, setInputMode] = useState<'upload' | 'url'>('upload');
  const [imageUrl, setImageUrl] = useState('');
  const [uploadStatusText, setUploadStatusText] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [previewStatus, setPreviewStatus] = useState<'loading' | 'loaded' | 'error'>('error');

  const [redirectUrl, setRedirectUrl] = useState('');
  const [actionType, setActionType] = useState<'video' | 'link' | 'in_app'>('video');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [brokenCardIds, setBrokenCardIds] = useState<Record<string, boolean>>({});
  const [isDragOver, setIsDragOver] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const resetModal = () => {
    setShowAddModal(false);
    setEditingBannerId(null);
    setTitle('');
    setInputMode('upload');
    setImageUrl('');
    setUploadStatusText(null);
    setIsUploading(false);
    setUploadError(null);
    setPreviewStatus('error');
    setRedirectUrl('');
    setActionType('video');
    setIsDragOver(false);
  };

  const openAddModal = () => {
    resetModal();
    setShowAddModal(true);
  };

  const openEditModal = (banner: Banner) => {
    setEditingBannerId(banner.id);
    setTitle(banner.title);
    setImageUrl(banner.imageUrl);
    setInputMode(banner.imageUrl.startsWith('data:image/') ? 'upload' : 'url');
    setUploadStatusText(
      banner.imageUrl.startsWith('data:image/') ? 'Uploaded device image loaded' : null
    );
    setUploadError(null);
    setRedirectUrl(banner.redirectUrl || '');
    setActionType(banner.actionType || 'video');
    setShowAddModal(true);
  };

  const handleFileSelected = async (file: File | undefined | null) => {
    if (!file) return;
    setUploadError(null);
    setIsUploading(true);
    setUploadStatusText(`Processing "${file.name}"...`);

    try {
      const targetBannerId =
        editingBannerId || `banner_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
      const processed = await processAndUploadBannerImage(file, targetBannerId);
      setImageUrl(processed.url);
      setUploadStatusText(
        processed.storageMode === 'firebase-storage'
          ? `Uploaded to cloud storage (${processed.sizeKb} KB)`
          : `Ready for Firestore (${processed.sizeKb} KB optimized)`
      );
    } catch (err: any) {
      setUploadError(err?.message || 'Failed to upload selected image.');
      setUploadStatusText(null);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSaveBanner = (e: React.FormEvent) => {
    e.preventDefault();
    setUploadError(null);

    if (isUploading) {
      setUploadError('Please wait for the image upload to finish.');
      return;
    }

    const cleanTitle = title.trim();
    const normalizedImageUrl = normalizeBannerImageUrl(imageUrl);

    if (!cleanTitle) {
      setUploadError('Please enter a banner headline.');
      return;
    }

    if (!normalizedImageUrl || !isValidBannerImageSrc(normalizedImageUrl)) {
      setUploadError('Please upload an image from your device or paste a valid direct image URL.');
      return;
    }

    if (editingBannerId) {
      const updated = banners.map((b) =>
        b.id === editingBannerId
          ? {
              ...b,
              title: cleanTitle,
              imageUrl: normalizedImageUrl,
              redirectUrl: redirectUrl.trim() || 'wallet',
              actionType
            }
          : b
      );
      dbStore.updateBanners(updated);
      resetModal();
      setFeedback('Promotional banner updated & synced live!');
      setTimeout(() => setFeedback(null), 3000);
      return;
    }

    const maxOrder = banners.reduce((max, b) => Math.max(max, b.order || 0), 0);
    const newBanner: Banner = {
      id: `banner_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 7)}`,
      title: cleanTitle,
      imageUrl: normalizedImageUrl,
      redirectUrl: redirectUrl.trim() || 'wallet',
      actionType,
      active: true,
      order: maxOrder + 1
    };

    dbStore.updateBanners([...banners, newBanner]);
    resetModal();
    setFeedback('New clickable promotional banner added & synced to Firestore!');
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleDeleteBanner = (id: string) => {
    const filtered = banners.filter((b) => b.id !== id);
    dbStore.updateBanners(filtered);
    setConfirmDeleteId(null);
    setFeedback('Banner removed.');
    setTimeout(() => setFeedback(null), 2500);
  };

  const normalizedPreviewSrc = normalizeBannerImageUrl(imageUrl);

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-black text-white font-display uppercase tracking-wider flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-orange-400" />
            Media & Clickable Banners CMS ({banners.length} Active)
          </h2>
          <p className="text-xs text-slate-400">
            Upload images directly from your device or paste image URLs. Syncs instantly to the User App touch-swipe carousel.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-white font-bold text-xs rounded-xl shadow-lg shadow-orange-500/25 flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Banner</span>
        </button>
      </div>

      {feedback && (
        <div className="p-3 bg-emerald-500/15 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Existing Banners Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {banners.map((banner, idx) => (
          <div
            key={banner.id}
            className="bg-[#0f1524] border border-slate-800 rounded-2xl overflow-hidden shadow-xl flex flex-col justify-between"
          >
            <div>
              <div className="relative aspect-[2.1/1] overflow-hidden bg-black">
                <BannerImage
                  src={banner.imageUrl}
                  alt={banner.title}
                  showErrorHint
                  onStatusChange={(status) => {
                    setBrokenCardIds((prev) => {
                      const nextBroken = status === 'error';
                      if (Boolean(prev[banner.id]) === nextBroken) return prev;
                      return { ...prev, [banner.id]: nextBroken };
                    });
                  }}
                />
                <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/75 text-[10px] font-mono text-orange-400 font-bold border border-orange-500/30 z-10">
                  Slide #{idx + 1}
                </span>
                {brokenCardIds[banner.id] && (
                  <span className="absolute top-2 right-2 px-2 py-0.5 rounded bg-amber-500/90 text-[9px] font-bold text-black z-10">
                    Broken Link
                  </span>
                )}
              </div>

              <div className="p-3.5 space-y-1">
                <h4 className="text-xs font-bold text-white line-clamp-1 font-display">
                  {banner.title}
                </h4>
                <div className="text-[11px] text-slate-400 flex items-center gap-1 truncate font-mono">
                  <ExternalLink className="w-3 h-3 text-slate-500 shrink-0" />
                  <span className="truncate">{banner.redirectUrl}</span>
                </div>
              </div>
            </div>

            <div className="p-3 pt-0 flex items-center justify-between gap-2">
              <button
                onClick={() => openEditModal(banner)}
                className="px-2.5 py-1 text-xs text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-all cursor-pointer flex items-center gap-1"
              >
                <Edit3 className="w-3.5 h-3.5 text-cyan-400" />
                <span>Edit</span>
              </button>

              {confirmDeleteId === banner.id ? (
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleDeleteBanner(banner.id)}
                    className="px-2.5 py-1 text-xs bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg transition-all cursor-pointer"
                  >
                    Confirm Delete
                  </button>
                  <button
                    onClick={() => setConfirmDeleteId(null)}
                    className="px-2 py-1 text-xs bg-slate-800 text-slate-300 rounded-lg cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmDeleteId(banner.id)}
                  className="px-2.5 py-1 text-xs text-red-400 hover:bg-red-500/20 rounded-lg transition-all cursor-pointer flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* ADD / EDIT BANNER MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-lg bg-[#0f1524] border border-slate-800 rounded-2xl p-5 shadow-2xl my-auto">
            <h3 className="text-sm font-black text-white font-display mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-orange-400" />
              <span>{editingBannerId ? 'Edit Promotional Banner' : 'Add New Clickable Mobile Banner'}</span>
            </h3>

            {uploadError && (
              <div className="mb-3 p-2.5 bg-red-500/15 border border-red-500/40 rounded-xl text-xs text-red-300 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span>{uploadError}</span>
              </div>
            )}

            <form onSubmit={handleSaveBanner} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Banner Headline
                </label>
                <input
                  type="text"
                  placeholder="e.g. 🔥 Weekend 5,000 TK Free Fire Mega Cup!"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-[#090d16] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
                  required
                />
              </div>

              {/* Dual Image Input Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Banner Image Source (16:9 / 2:1 recommended)
                </label>
                <div className="grid grid-cols-2 gap-1.5 p-1 bg-[#090d16] border border-slate-800 rounded-xl mb-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      setInputMode('upload');
                      setUploadError(null);
                    }}
                    className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      inputMode === 'upload'
                        ? 'bg-orange-500 text-white shadow-md'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload from Device</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setInputMode('url');
                      setUploadError(null);
                    }}
                    className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      inputMode === 'url'
                        ? 'bg-orange-500 text-white shadow-md'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <LinkIcon className="w-3.5 h-3.5" />
                    <span>Image URL Link</span>
                  </button>
                </div>

                {inputMode === 'upload' ? (
                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileSelected(e.target.files?.[0])}
                      className="hidden"
                      id="banner-file-upload"
                    />
                    <label
                      htmlFor="banner-file-upload"
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDragOver(true);
                      }}
                      onDragLeave={() => setIsDragOver(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setIsDragOver(false);
                        handleFileSelected(e.dataTransfer.files?.[0]);
                      }}
                      className={`w-full border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                        isDragOver
                          ? 'border-orange-400 bg-orange-500/10'
                          : 'border-slate-700 hover:border-orange-500/60 bg-[#090d16]'
                      }`}
                    >
                      {isUploading ? (
                        <>
                          <Loader2 className="w-6 h-6 text-orange-400 animate-spin mb-1.5" />
                          <span className="text-xs font-bold text-orange-300">
                            Optimizing & Uploading Image...
                          </span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-6 h-6 text-orange-400 mb-1.5" />
                          <span className="text-xs font-bold text-slate-200">
                            Tap to select image or drag & drop here
                          </span>
                          <span className="text-[10px] text-slate-500 mt-0.5">
                            PNG, JPG, WebP, GIF • Auto-optimized for instant mobile loading
                          </span>
                        </>
                      )}
                    </label>
                    {uploadStatusText && !uploadError && (
                      <p className="text-[11px] text-emerald-400 mt-1.5 flex items-center gap-1 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                        <span>{uploadStatusText}</span>
                      </p>
                    )}
                  </div>
                ) : (
                  <div>
                    <input
                      type="text"
                      placeholder="https://images.unsplash.com/... or Google Drive image link"
                      value={imageUrl.startsWith('data:image/') ? '' : imageUrl}
                      onChange={(e) => {
                        setImageUrl(e.target.value);
                        setUploadStatusText(null);
                      }}
                      className="w-full bg-[#090d16] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500 font-mono"
                    />
                    <div className="flex flex-wrap items-center gap-3 mt-1.5">
                      <button
                        type="button"
                        onClick={() =>
                          setImageUrl(
                            'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=900&q=80'
                          )
                        }
                        className="text-[10px] text-slate-400 hover:text-orange-400 underline cursor-pointer"
                      >
                        Preset Esports 1
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setImageUrl(
                            'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=900&q=80'
                          )
                        }
                        className="text-[10px] text-slate-400 hover:text-orange-400 underline cursor-pointer"
                      >
                        Preset Esports 2
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setImageUrl(
                            'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=900&q=80'
                          )
                        }
                        className="text-[10px] text-slate-400 hover:text-orange-400 underline cursor-pointer"
                      >
                        Preset Esports 3
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Live Banner Preview */}
              {normalizedPreviewSrc && (
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-slate-400">Live Mobile Carousel Preview</span>
                    {previewStatus === 'loaded' && (
                      <span className="text-emerald-400 font-bold">Image Loaded ✓</span>
                    )}
                    {previewStatus === 'error' && (
                      <span className="text-amber-400 font-bold">
                        URL failed to load — try Upload from Device
                      </span>
                    )}
                  </div>
                  <div className="relative aspect-[2.1/1] rounded-xl overflow-hidden border border-slate-700 bg-black">
                    <BannerImage
                      src={normalizedPreviewSrc}
                      alt={title || 'Banner preview'}
                      showErrorHint
                      onStatusChange={setPreviewStatus}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent flex flex-col justify-end p-3 pointer-events-none">
                      <span className="text-[9px] font-black uppercase tracking-wider text-orange-400">
                        Featured Event
                      </span>
                      <span className="text-xs font-extrabold text-white line-clamp-1 font-display">
                        {title || 'Your Banner Headline Preview'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Action Type</label>
                  <select
                    value={actionType}
                    onChange={(e) => setActionType(e.target.value as any)}
                    className="w-full bg-[#090d16] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
                  >
                    <option value="video">External Video / Stream</option>
                    <option value="link">Website Link</option>
                    <option value="in_app">In-App Route (e.g. wallet, spin)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Target Redirect URL</label>
                  <input
                    type="text"
                    placeholder="https://... or wallet"
                    value={redirectUrl}
                    onChange={(e) => setRedirectUrl(e.target.value)}
                    className="w-full bg-[#090d16] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={isUploading}
                  className="flex-1 py-2.5 bg-orange-500 hover:bg-orange-400 disabled:opacity-60 text-white font-bold text-xs rounded-xl cursor-pointer"
                >
                  {isUploading
                    ? 'Uploading Image...'
                    : editingBannerId
                    ? 'Save Banner Changes'
                    : 'Publish Banner'}
                </button>
                <button
                  type="button"
                  onClick={resetModal}
                  className="px-3 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-400 text-xs rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
