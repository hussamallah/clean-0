"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

export default function TopNav(){
  const pathname = usePathname() || "";
  const search = useSearchParams();
  const rid = search?.get('rid') || '';
  const showNav = [
    "/your-id",
    "/results",
    "/arctyps-duals",
    "/conflict-patterns",
    "/existential-circuits",
    "/summary"
  ].some(prefix => pathname.startsWith(prefix));
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
            padding: '8px 12px'
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
              gap: 'clamp(20px, 6vw, 100px)',
            background: 'linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))',
            border: '1px solid #333',
            borderRadius: 9999,
              padding: '4px 8px',
            boxShadow: '0 0 18px rgba(212,175,55,0.12)'
          }}
        >
          <Link
            href={{ pathname: "/your-id", query: rid ? { rid } : undefined }}
            style={{
              padding: '8px 16px',
              borderRadius: 9999,
              color: '#111',
              background: 'linear-gradient(90deg, #FFD36E, #E4B847)',
              fontSize: 13,
              fontWeight: 800,
              letterSpacing: 0.8,
              textDecoration: 'none',
              whiteSpace: 'nowrap',
              lineHeight: 1,
              display: 'inline-flex',
              alignItems: 'center'
            }}
          >
            ID CARD
          </Link>
          <Link
            href={{ pathname: "/results", query: rid ? { rid } : undefined }}
            style={{
              padding: '8px 16px',
              borderRadius: 9999,
              color: '#eaeaea',
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: 0.8,
              textDecoration: 'none',
              border: '1px solid #3a3a3a',
              background: 'rgba(255,255,255,0.03)',
              whiteSpace: 'nowrap',
              lineHeight: 1,
              display: 'inline-flex',
              alignItems: 'center'
            }}
          >
            FULL RESULTS
          </Link>
          <Link
            href={{ pathname: "/arctyps-duals", query: rid ? { rid } : undefined }}
            style={{
              padding: '8px 16px',
              borderRadius: 9999,
              color: '#eaeaea',
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: 0.8,
              textDecoration: 'none',
              border: '1px solid #3a3a3a',
              background: 'rgba(255,255,255,0.03)',
              whiteSpace: 'nowrap',
              lineHeight: 1,
              display: 'inline-flex',
              alignItems: 'center'
            }}
          >
            ARCTYPS DUALS
          </Link>
          <Link
            href={{ pathname: "/conflict-patterns", query: rid ? { rid } : undefined }}
            style={{
              padding: '8px 16px',
              borderRadius: 9999,
              color: '#eaeaea',
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: 0.8,
              textDecoration: 'none',
              border: '1px solid #3a3a3a',
              background: 'rgba(255,255,255,0.03)',
              whiteSpace: 'nowrap',
              lineHeight: 1,
              display: 'inline-flex',
              alignItems: 'center'
            }}
          >
            CONFLICT PATTERNS
          </Link>
          <Link
            href={{ pathname: "/existential-circuits", query: rid ? { rid } : undefined }}
            style={{
              padding: '8px 16px',
              borderRadius: 9999,
              color: '#eaeaea',
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: 0.8,
              textDecoration: 'none',
              border: '1px solid #3a3a3a',
              background: 'rgba(255,255,255,0.03)',
              whiteSpace: 'nowrap',
              lineHeight: 1,
              display: 'inline-flex',
              alignItems: 'center'
            }}
          >
            EXISTENTIAL CIRCUITS
          </Link>
          <Link
            href={{ pathname: "/summary", query: rid ? { rid } : undefined }}
            style={{
              padding: '8px 16px',
              borderRadius: 9999,
              color: '#eaeaea',
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: 0.8,
              textDecoration: 'none',
              border: '1px solid #3a3a3a',
              background: 'rgba(255,255,255,0.03)',
              whiteSpace: 'nowrap',
              lineHeight: 1,
              display: 'inline-flex',
              alignItems: 'center'
            }}
          >
            SUMMARY
          </Link>
        </div>
      </div>
    </nav>
  );
}


