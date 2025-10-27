"use client";

import Link from "next/link";

export default function CTAButton({ href, children, title, target, rel, tier }: { href: string; children: React.ReactNode; title?: string; target?: string; rel?: string, tier?: 'Free' | 'Paid' }){
  return (
    <Link
      href={href}
      title={title}
      target={target}
      rel={rel}
      className="btn btn-gold relative"
      style={{ border: '1px solid #d4af37', paddingRight: tier === 'Free' ? '3.5rem' : undefined }}
    >
      {children}
      {tier === 'Free' && (
        <span
          className="absolute right-1 top-1/2 -translate-y-1/2 text-xs font-bold rounded-full px-2 py-0.5"
          style={{
            backgroundColor: tier === 'Free' ? '#2e7d32' : '#c62828',
            color: 'white',
            border: `1px solid ${tier === 'Free' ? '#66bb6a' : '#ef5350'}`
          }}
        >
          {tier}
        </span>
      )}
    </Link>
  );
}



