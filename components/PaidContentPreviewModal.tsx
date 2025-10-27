'use client';

import CTAButton from './CTAButton';

interface PaidContentPreviewModalProps {
  title: string;
  description: string;
  previewContent: React.ReactNode;
  price: number;
  purchaseUrl: string;
  onClose: () => void;
}

export default function PaidContentPreviewModal({
  title,
  description,
  previewContent,
  price,
  purchaseUrl,
  onClose,
}: PaidContentPreviewModalProps) {
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
          
          <div className="mt-4 text-left p-4 rounded-lg overflow-hidden border-2 border-white/20 bg-black/20">
            {previewContent}
          </div>

          <div className="mt-6">
            <CTAButton href={purchaseUrl}>
              {`Unlock Full Report - $${price.toFixed(2)}`}
            </CTAButton>
          </div>
        </div>
      </div>
    </div>
  );
}
