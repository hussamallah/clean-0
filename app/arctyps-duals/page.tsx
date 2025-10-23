'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

function ArchetypeDualsContent() {
  const search = useSearchParams();
  const ridAFromUrl = search?.get('ridA') || '';
  const ridBFromUrl = search?.get('ridB') || '';
  
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDebug, setShowDebug] = useState(false);

  const [ridA, setRidA] = useState(ridAFromUrl);
  const [ridB, setRidB] = useState(ridBFromUrl);

  useEffect(() => {
    if (ridAFromUrl && ridBFromUrl) {
      async function fetchData() {
    setLoading(true);
        setError(null);
        try {
          const res = await fetch(`/api/archetype-duals?ridA=${encodeURIComponent(ridAFromUrl)}&ridB=${encodeURIComponent(ridBFromUrl)}`);
          if (!res.ok) {
            const errorData = await res.json().catch(() => ({ message: 'Failed to fetch archetype data' }));
            throw new Error(errorData.message || 'Failed to fetch archetype data');
          }
          const jsonData = await res.json();
          setData(jsonData);
        } catch (err: any) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      }
      fetchData();
    } else {
      setLoading(false);
    }
  }, [ridAFromUrl, ridBFromUrl]);

  const extractRid = (input: string): string => {
    if (!input) return input;
    const urlPattern = /[?&]rid=([a-zA-Z0-9_-]{24,})/;
    const urlMatch = input.match(urlPattern);
    if (urlMatch && urlMatch[1]) {
      return urlMatch[1];
    }
    const directPattern = /([a-zA-Z0-9_-]{24,})/;
    const directMatch = input.match(directPattern);
    if (directMatch && directMatch[0]) {
      return directMatch[0];
    }
    return input;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const extractedA = extractRid(ridA);
    const extractedB = extractRid(ridB);
    if (extractedA && extractedB) {
      window.location.href = `/arctyps-duals?ridA=${extractedA}&ridB=${extractedB}`;
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-black text-white flex items-center justify-center font-sans">Loading Archetype Comparison...</div>;
  }
  
  if (error) {
    return <div className="min-h-screen bg-black text-white flex items-center justify-center font-sans">Error: {error}</div>;
  }

  if (!data) {
    return (
      <main className="min-h-screen bg-gray-900 text-white p-8 font-sans">
        <div className="max-w-md mx-auto">
            <h1 className="text-3xl font-bold mb-4 text-center">Archetype Duals</h1>
            <p className="text-gray-400 text-center mb-6">Enter two IDs or page URLs to see a direct comparison of their archetypes.</p>
            <form onSubmit={handleSubmit} className="bg-gray-800 p-6 rounded-lg shadow-lg">
                <div className="mb-4">
                    <label htmlFor="ridA" className="block mb-2 text-sm font-bold text-gray-300">Person A's ID or Page URL</label>
                    <input 
                      type="text" 
                      id="ridA" 
                      name="ridA" 
                      value={ridA}
                      onChange={e => setRidA(e.target.value)}
                      onBlur={e => setRidA(extractRid(e.target.value))}
                      placeholder="Paste URL or ID for Person A"
                      className="bg-gray-700 border border-gray-600 rounded w-full p-2 text-white focus:outline-none focus:ring-2 focus:ring-red-500" />
                </div>
                <div className="mb-6">
                    <label htmlFor="ridB" className="block mb-2 text-sm font-bold text-gray-300">Person B's ID or Page URL</label>
                    <input 
                      type="text" 
                      id="ridB" 
                      name="ridB"
                      value={ridB}
                      onChange={e => setRidB(e.target.value)}
                      onBlur={e => setRidB(extractRid(e.target.value))}
                      placeholder="Paste URL or ID for Person B"
                      className="bg-gray-700 border border-gray-600 rounded w-full p-2 text-white focus:outline-none focus:ring-2 focus:ring-red-500" />
                </div>
                <button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition-colors duration-300">
                    Compare
                </button>
            </form>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-900 text-white p-8 font-sans leading-relaxed">
        <div className="max-w-4xl mx-auto">
            {/* Act 1: The Hook */}
            <header className="text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-bold mb-2">{data.narrative.title}</h1>
                <p className="text-lg md:text-xl text-gray-400 max-w-3xl mx-auto">{data.narrative.summary}</p>
            </header>

            {/* Act 2: The Cheat Sheet */}
            <section className="mb-12">
              <div className="grid md:grid-cols-2 gap-px bg-gray-700 rounded-lg overflow-hidden">
                {/* Person A */}
                <div className="bg-gray-800 p-6">
                    <h2 className="text-2xl font-bold text-red-400">{data.a.title}</h2>
                    <dl className="mt-4 space-y-4 text-sm">
                      <div>
                        <dt className="font-semibold text-gray-400">Your Superpower:</dt>
                        <dd className="mt-1">{data.a.superpower}</dd>
                      </div>
                      <div>
                        <dt className="font-semibold text-gray-400">How You Operate:</dt>
                        <dd className="mt-1">{data.a.operation}</dd>
                      </div>
                      <div>
                        <dt className="font-semibold text-gray-400">Your Kryptonite:</dt>
                        <dd className="mt-1">{data.a.kryptonite}</dd>
                      </div>
                       <div>
                        <dt className="font-semibold text-gray-400">Core Drive:</dt>
                        <dd className="mt-1 font-mono text-lg">{data.a.drive}</dd>
                      </div>
                    </dl>
                </div>

                {/* Person B */}
                <div className="bg-gray-800 p-6">
                    <h2 className="text-2xl font-bold text-red-400">{data.b.title}</h2>
                    <dl className="mt-4 space-y-4 text-sm">
                       <div>
                        <dt className="font-semibold text-gray-400">Their Superpower:</dt>
                        <dd className="mt-1">{data.b.superpower}</dd>
                      </div>
                      <div>
                        <dt className="font-semibold text-gray-400">How They Operate:</dt>
                        <dd className="mt-1">{data.b.operation}</dd>
                      </div>
                      <div>
                        <dt className="font-semibold text-gray-400">Their Kryptonite:</dt>
                        <dd className="mt-1">{data.b.kryptonite}</dd>
                      </div>
                       <div>
                        <dt className="font-semibold text-gray-400">Core Drive:</dt>
                        <dd className="mt-1 font-mono text-lg">{data.b.drive}</dd>
                      </div>
                    </dl>
                </div>
              </div>
            </section>

            {/* Act 3: The Playbook */}
            <section>
                <h3 className="text-3xl font-bold text-center mb-6">The Deep Dive & Playbook</h3>
                <div className="space-y-6">
                    {/* Where You Sync */}
                    <div className="bg-gray-800 p-6 rounded-lg">
                        <h4 className="text-xl font-bold text-green-400">{data.interaction.sync.title}</h4>
                        <p className="mt-2 text-gray-300">{data.interaction.sync.narrative}</p>
                    </div>
                     {/* Where You Clash */}
                     <div className="bg-gray-800 p-6 rounded-lg">
                        <h4 className="text-xl font-bold text-red-400">{data.interaction.clash.title}</h4>
                        <p className="mt-2 text-gray-300">{data.interaction.clash.narrative}</p>
                        {data.interaction.clash.playbook && (
                          <div className="mt-4 pt-4 border-t border-gray-700">
                            <h5 className="font-semibold text-yellow-400">The Playbook:</h5>
                            <p className="text-sm text-gray-300 mt-2">
                              <strong className="block">Your Job ({data.a.title}):</strong>
                              {data.interaction.clash.playbook.a.replace('Your Job (Visionary): ', '')}
                            </p>
                            <p className="text-sm text-gray-300 mt-2">
                              <strong className="block">Their Job ({data.b.title}):</strong>
                              {data.interaction.clash.playbook.b.replace('Their Job (Guardian): ', '')}
                            </p>
                          </div>
                        )}
                    </div>
                </div>
            </section>

            {/* ... debug section */}
        </div>
    </main>
  );
}

export default function ArchetypeDualsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black text-white flex items-center justify-center font-sans">Loading...</div>}>
      <ArchetypeDualsContent />
    </Suspense>
  );
}


