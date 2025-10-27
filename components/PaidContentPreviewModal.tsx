'use client';

import CTAButton from './CTAButton';
import { useEffect } from 'react';

interface PaidContentPreviewModalProps {
  title: string;
  description: string;
  previewContent: React.ReactNode;
  price: number;
  purchaseUrl: string;
  unlocks?: string;
  onClose: () => void;
}

export default function PaidContentPreviewModal({ title, description, previewContent, price, purchaseUrl, unlocks, onClose }: PaidContentPreviewModalProps) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.7)' }}
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="rounded-xl border relative max-w-2xl w-[94%] border-yellow-500/50"
        style={{ background: '#0f141a' }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-2 right-2 px-3 py-1 text-white/70 hover:text-white z-10"
        >
          &times;
        </button>
        <div className="p-6 text-center">
          <h2 className="text-sm font-bold uppercase tracking-widest text-yellow-400">
            Premium Report Preview
          </h2>
          <h3 className="mt-2 text-2xl font-bold text-white">{title}</h3>
          <p className="mt-2 max-w-md mx-auto text-white/80">{description}</p>
          
          <div className="mt-4 p-4 rounded-lg bg-black/30 border border-white/10">
            {previewContent}
          </div>
          
          {unlocks && (
            <div className="mt-4 text-center text-sm text-green-300 bg-green-500/10 p-2 rounded-md">
              {unlocks}
            </div>
          )}

          <div className="mt-6 flex flex-col items-center">
            <CTAButton href={purchaseUrl} tier="Paid">
              {`Unlock for $${price.toFixed(2)}`}
            </CTAButton>
          </div>
        </div>
      </div>
    </div>
  );
}
