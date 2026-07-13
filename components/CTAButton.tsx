'use client';

import Link from 'next/link';

export default function CTAButton({
  href,
  children,
  title,
  target,
  rel,
  tier,
  onClick,
}: {
  href: string;
  children: React.ReactNode;
  title?: string;
  target?: string;
  rel?: string;
  tier?: 'Free' | 'Paid';
  onClick?: (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => void;
}) {
  const isPremium = tier === 'Paid';

  return (
    <Link
      href={href}
      title={title}
      target={target}
      rel={rel}
      onClick={onClick}
      className="btn btn-gold relative inline-flex items-center"
    >
      {children}
      {isPremium && (
        <span className="ml-2 text-xs font-bold rounded-full px-2 py-0.5 bg-brand-soft text-ink border border-brand/30">
          Premium
        </span>
      )}
    </Link>
  );
}
