"use client";

import Link from "next/link";

export default function CTAButton({ href, children, title, target, rel }: { href: string; children: React.ReactNode; title?: string; target?: string; rel?: string }){
  return (
    <Link
      href={href}
      title={title}
      target={target}
      rel={rel}
      className="btn btn-gold"
      style={{ border: '1px solid #d4af37' }}
    >
      {children}
    </Link>
  );
}



