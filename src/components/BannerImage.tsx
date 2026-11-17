import React, { useState, useEffect, useRef } from 'react';
import { Flame, ImageOff } from 'lucide-react';
import { isValidBannerImageSrc, normalizeBannerImageUrl } from '../services/bannerImageService';

interface BannerImageProps {
  src: string;
  alt: string;
  className?: string;
  draggable?: boolean;
  showErrorHint?: boolean;
  onStatusChange?: (status: 'loading' | 'loaded' | 'error') => void;
}

export const BannerImage: React.FC<BannerImageProps> = ({
  src,
  alt,
  className = 'w-full h-full object-cover',
  draggable = false,
  showErrorHint = false,
  onStatusChange
}) => {
  const normalizedSrc = normalizeBannerImageUrl(src);
  const canAttemptLoad = isValidBannerImageSrc(normalizedSrc);
  const imgRef = useRef<HTMLImageElement | null>(null);

  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>(
    canAttemptLoad ? 'loading' : 'error'
  );

  useEffect(() => {
    if (!canAttemptLoad) {
      setStatus('error');
      onStatusChange?.('error');
      return;
    }
    if (imgRef.current && imgRef.current.complete) {
      const nextStatus = imgRef.current.naturalWidth > 0 ? 'loaded' : 'error';
      setStatus(nextStatus);
      onStatusChange?.(nextStatus);
      return;
    }
    setStatus('loading');
    onStatusChange?.('loading');
  }, [normalizedSrc, canAttemptLoad]);

  if (!canAttemptLoad || status === 'error') {
    return (
      <div className="w-full h-full bg-gradient-to-br from-[#1b1024] via-[#2b1410] to-[#0f172a] relative overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_25%,rgba(249,115,22,0.28),transparent_55%)] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(234,179,8,0.16),transparent_50%)] pointer-events-none" />
        <div className="relative z-10 flex flex-col items-center justify-center text-center px-4 opacity-85">
          {showErrorHint ? (
            <>
              <ImageOff className="w-6 h-6 text-amber-400 mb-1" />
              <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider">
                Image Unavailable
              </span>
            </>
          ) : (
            <>
              <div className="w-10 h-10 rounded-xl overflow-hidden border border-orange-500/40 shadow-lg mb-1 opacity-90">
                <img
                  src="/assets/aistudio/Storm_FF_Club__Play_and_Win_69a00649.png"
                  alt="Storm FF Club"
                  className="w-full h-full object-cover"
                  draggable={false}
                  onError={(e) => {
                    const el = e.currentTarget;
                    if (!el.dataset.fb) {
                      el.dataset.fb = '1';
                      el.src = '/pwa-192x192.png';
                    }
                  }}
                />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-orange-400/90 flex items-center gap-1">
                <Flame className="w-3 h-3" /> Storm FF Club Event
              </span>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative bg-[#0b101d]">
      {status === 'loading' && (
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 animate-pulse" />
      )}
      <img
        ref={imgRef}
        src={normalizedSrc}
        alt={alt}
        draggable={draggable}
        referrerPolicy="no-referrer"
        onLoad={() => {
          setStatus('loaded');
          onStatusChange?.('loaded');
        }}
        onError={() => {
          setStatus('error');
          onStatusChange?.('error');
        }}
        className={`${className} transition-opacity duration-300 ${
          status === 'loaded' ? 'opacity-100' : 'opacity-0'
        }`}
      />
    </div>
  );
};
