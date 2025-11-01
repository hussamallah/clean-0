'use client';
import Link from 'next/link';
import { useState } from 'react';
import { usePathname } from 'next/navigation';

export default function GlobalMenu() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showRetrieve, setShowRetrieve] = useState(false);
  const [resultCode, setResultCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const pathname = usePathname();

  const handleRetrieve = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resultCode.trim()) return;

    let code = resultCode.trim();
    
    try {
      const url = new URL(code);
      const rid = url.searchParams.get('rid');
      if (rid) {
        code = rid;
      }
    } catch (error) {
      // Not a valid URL, treat it as a raw code
    }

    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(`/api/who/${encodeURIComponent(code)}`);
      
      if (response.ok) {
        window.location.href = `/your-id?rid=${encodeURIComponent(code)}`;
      } else {
        const data = await response.json();
        setError(data.message || 'Result not found. Please check your code and try again.');
        setLoading(false);
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      setLoading(false);
    }
  };

  const showMenu = ['/', '/assessment', '/free-results', '/privacy'].includes(pathname || '');

  if (!showMenu) {
    return null;
  }

  return (
    <>
      {/* MENU BUTTON */}
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="fixed top-4 left-4 z-50 flex items-center justify-center h-12 px-4 rounded-xl bg-gradient-to-br from-yellow-500/20 to-amber-600/20 border-2 border-yellow-500/60 hover:border-yellow-400 transition-all backdrop-blur-sm shadow-lg hover:shadow-yellow-500/50"
        style={{
          boxShadow: '0 0 20px rgba(234, 179, 8, 0.4), 0 0 40px rgba(234, 179, 8, 0.2), 0 4px 16px rgba(0,0,0,0.3)'
        }}
        aria-label="Menu"
      >
        <svg className="w-6 h-6 text-yellow-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {menuOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
        <span className="ml-2 text-sm font-semibold text-yellow-200">Menu</span>
      </button>

      {/* MENU OVERLAY */}
      {menuOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            onClick={() => setMenuOpen(false)}
          />
          <div className="fixed top-0 left-0 h-full w-80 bg-[#0f1419] border-r border-yellow-500/20 z-50 shadow-2xl" style={{
            boxShadow: '0 0 40px rgba(234, 179, 8, 0.15), 4px 0 20px rgba(0,0,0,0.5)'
          }}>
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-6 text-yellow-300">Menu</h2>
              <nav className="space-y-2">
                 <Link
                  href="/"
                  className="block w-full text-left px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
                  onClick={() => setMenuOpen(false)}
                >
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a2 2 0 002 2h10a2 2 0 002-2V10M9 20h6" />
                    </svg>
                    <span className="text-white/90">Home</span>
                  </div>
                </Link>
                <button
                  onClick={() => {
                    setShowRetrieve(true);
                    setMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-3 rounded-xl bg-gradient-to-r from-yellow-500/20 to-amber-600/20 hover:from-yellow-500/30 hover:to-amber-600/30 border-2 border-yellow-500/50 hover:border-yellow-400/70 transition-all shadow-lg"
                  style={{
                    boxShadow: '0 0 15px rgba(234, 179, 8, 0.3), 0 4px 10px rgba(0,0,0,0.2)'
                  }}
                >
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-yellow-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <span className="text-yellow-100 font-semibold">Retrieve Results</span>
                  </div>
                </button>
                <Link
                  href="/assessment"
                  className="block w-full text-left px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
                  onClick={() => setMenuOpen(false)}
                >
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <span className="text-white/90">Start Assessment</span>
                  </div>
                </Link>
                <Link
                  href="/free-results"
                  className="block w-full text-left px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
                  onClick={() => setMenuOpen(false)}
                >
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-white/90">Free Results</span>
                  </div>
                </Link>
                <Link
                  href="/privacy"
                  className="block w-full text-left px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
                  onClick={() => setMenuOpen(false)}
                >
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <span className="text-white/90">Privacy & Methodology</span>
                  </div>
                </Link>
              </nav>
            </div>
          </div>
        </>
      )}

      {/* RETRIEVE RESULTS MODAL */}
      {showRetrieve && (
        <>
          <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
            onClick={() => setShowRetrieve(false)}
          />
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-lg z-50 p-4">
            <div className="bg-gradient-to-br from-[#1a1510] to-[#0f1419] border-2 border-yellow-500/40 rounded-2xl shadow-2xl p-6 relative overflow-hidden" style={{
              boxShadow: '0 0 40px rgba(234, 179, 8, 0.3), 0 0 80px rgba(234, 179, 8, 0.15), 0 10px 40px rgba(0,0,0,0.5)'
            }}>
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/5 via-amber-500/10 to-yellow-500/5 animate-pulse pointer-events-none" />
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-yellow-300 flex items-center gap-2">
                    <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Retrieve Your Results
                  </h2>
                  <button
                    onClick={() => setShowRetrieve(false)}
                    className="text-yellow-300/60 hover:text-yellow-300 transition"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <p className="text-sm text-yellow-100/70 mb-4">
                  Enter your result code to view your saved assessment results. You received this code after completing your assessment.
                </p>
                <div className="space-y-3">
                  <form onSubmit={handleRetrieve} className="relative">
                    <input
                      type="text"
                      className="w-full pl-4 pr-28 py-3 bg-white/10 border-2 border-white/20 rounded-xl focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none transition-all placeholder-white/50 text-yellow-100"
                      value={resultCode}
                      onChange={(e) => {
                        setResultCode(e.target.value);
                        setError(''); // Clear error when typing
                      }}
                      placeholder="Paste your result code or URL..."
                      disabled={loading}
                    />
                    <button
                      type="submit"
                      disabled={!resultCode.trim() || loading}
                      className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 bg-yellow-500/20 text-yellow-100 rounded-lg hover:bg-yellow-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Retrieving...' : 'View Results'}
                    </button>
                  </form>
                  
                  {error && (
                    <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-3">
                      <p className="text-sm text-red-300">{error}</p>
                    </div>
                  )}
                  
                </div>
                <div className="mt-4 pt-4 border-t border-yellow-500/20">
                  <p className="text-xs text-yellow-100/50">
                    Don't have a result code yet?{' '}
                    <Link href="/assessment" className="text-yellow-400 hover:text-yellow-300 font-semibold" onClick={() => setShowRetrieve(false)}>
                      Take the assessment
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
