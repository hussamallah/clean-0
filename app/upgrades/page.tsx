'use client';
import { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

function UpgradesContent() {
  const searchParams = useSearchParams();
  const rid = searchParams.get('rid');

  const upgrades = [
    {
      title: 'Conflict Patterns',
      description: 'Unlock a detailed analysis of your core conflict patterns. Understand how you behave under pressure and learn to navigate tension more effectively.',
      price: 3.00,
      href: `/conflict-patterns${rid ? `?rid=${rid}` : ''}`,
      cta: 'View Conflict Patterns'
    },
    {
      title: 'Existential Circuits',
      description: 'Get a full report on your 12 existential circuits and all life signals. Discover the fundamental systems that drive your motivations, fears, and core psychological wiring.',
      price: 3.00,
      href: `/existential-circuits${rid ? `?rid=${rid}` : ''}`,
      cta: 'View Existential Circuits'
    },
    {
      title: 'Compatibility Report',
      description: 'How do you relate to others? This report reveals the precise points of harmony and friction between you and another person, creating a playbook for better communication.',
      price: 3.00,
      href: `/compatibility${rid ? `?ridA=${rid}` : ''}`,
      cta: 'View Compatibility Report'
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-4xl font-bold text-yellow-400 mb-4">Upgrades</h1>
      <p className="text-white/80 mb-8 max-w-2xl">
        Enhance your self-understanding with these detailed reports. Each upgrade provides a deeper layer of insight into your personality and how you interact with the world.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl w-full">
        {upgrades.map((upgrade) => (
          <div key={upgrade.title} className="bg-white/5 border border-white/10 rounded-lg p-6 flex flex-col">
            <h2 className="text-2xl font-bold text-yellow-300">{upgrade.title}</h2>
            <p className="text-white/70 mt-4 flex-grow">{upgrade.description}</p>
            <div className="mt-6">
              <p className="text-lg font-semibold text-white">${upgrade.price.toFixed(2)}</p>
              <Link href={upgrade.href} className="mt-4 inline-block bg-yellow-500 text-black font-bold py-2 px-4 rounded hover:bg-yellow-400 transition-colors">
                {upgrade.cta}
              </Link>
            </div>
          </div>
        ))}
      </div>
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
