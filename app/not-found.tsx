import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
        <p className="text-gray-400 mb-8">The page you're looking for doesn't exist.</p>
        <Link 
          href="/" 
          className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-yellow-500 to-amber-600 px-5 py-3 text-base font-semibold text-black shadow-lg shadow-yellow-500/20 transition hover:from-yellow-400 hover:to-amber-500"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}
