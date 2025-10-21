"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

export default function TopNav(){
  const pathname = usePathname() || "";
  const search = useSearchParams();
  const rid = search?.get('rid') || '';
  const showNav = pathname.startsWith("/your-id") || pathname.startsWith("/results") || pathname.startsWith("/arctyps-duals");
  if (!showNav) return null;

  return (
    <nav
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: 'rgba(10,10,12,0.85)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        borderBottom: '1px solid #2a2a2a',
        boxShadow: '0 6px 24px rgba(0,0,0,0.35)'
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '14px 16px'
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 140,
            background: 'linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))',
            border: '1px solid #333',
            borderRadius: 9999,
            padding: '8px 10px',
            boxShadow: '0 0 18px rgba(212,175,55,0.12)'
          }}
        >
          <Link
            href={{ pathname: "/your-id", query: rid ? { rid } : undefined }}
            style={{
              padding: '12px 22px',
              borderRadius: 9999,
              color: '#111',
              background: 'linear-gradient(90deg, #FFD36E, #E4B847)',
              fontSize: 14,
              fontWeight: 800,
              letterSpacing: 0.8,
              textDecoration: 'none'
            }}
          >
            ID CARD
          </Link>
          <Link
            href={{ pathname: "/results", query: rid ? { rid } : undefined }}
            style={{
              padding: '12px 22px',
              borderRadius: 9999,
              color: '#eaeaea',
              fontSize: 14,
              fontWeight: 700,
              letterSpacing: 0.8,
              textDecoration: 'none',
              border: '1px solid #3a3a3a',
              background: 'rgba(255,255,255,0.03)'
            }}
          >
            FULL RESULTS
          </Link>
          <Link
            href={{ pathname: "/arctyps-duals", query: rid ? { rid } : undefined }}
            style={{
              padding: '12px 22px',
              borderRadius: 9999,
              color: '#eaeaea',
              fontSize: 14,
              fontWeight: 700,
              letterSpacing: 0.8,
              textDecoration: 'none',
              border: '1px solid #3a3a3a',
              background: 'rgba(255,255,255,0.03)'
            }}
          >
            ARCTYPS DUALS......
          </Link>
        </div>
      </div>
    </nav>
  );
}


