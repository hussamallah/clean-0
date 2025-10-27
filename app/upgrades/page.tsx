'use client';
import { Suspense } from 'react';

function UpgradesContent() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-4xl font-bold text-yellow-400 mb-4">Upgrades</h1>
      <p className="text-white/80 mb-8 max-w-md">
        This page is under construction.
      </p>
    </div>
  );
}

export default function UpgradesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black text-white flex items-center justify-center">Loading...</div>}>
      <UpgradesContent />
    </Suspense>
  );
}
