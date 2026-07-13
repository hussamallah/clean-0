import type { ReactNode } from 'react';
import Link from 'next/link';

type Align = 'center' | 'start';

/** @deprecated Prefer SectionLabel — kept for gradual migration */
export function SystemLabel({
  children,
  className = '',
  align = 'center',
}: {
  children: ReactNode;
  className?: string;
  align?: Align;
}) {
  return (
    <SectionLabel align={align} className={className}>
      {children}
    </SectionLabel>
  );
}

export function SectionLabel({
  children,
  className = '',
  align = 'center',
}: {
  children: ReactNode;
  className?: string;
  align?: Align;
}) {
  const alignCls = align === 'start' ? 'text-left' : 'text-center';
  return (
    <p
      className={`text-sm font-medium uppercase tracking-[0.18em] text-ink-soft ${alignCls} ${className}`.trim()}
    >
      {children}
    </p>
  );
}

export function Surface({
  children,
  className = '',
  padding = 'md',
  accent,
}: {
  children: ReactNode;
  className?: string;
  padding?: 'sm' | 'md' | 'lg';
  /** Optional domain accent — thin top border, no neon glow */
  accent?: string;
}) {
  const pad =
    padding === 'sm' ? 'p-4 sm:p-5' : padding === 'lg' ? 'p-6 sm:p-8' : 'p-5 sm:p-6';

  return (
    <div
      className={`relative overflow-hidden rounded-panel border border-line bg-surface shadow-soft ${pad} ${className}`.trim()}
      style={accent ? { borderTopWidth: 3, borderTopColor: accent } : undefined}
    >
      {children}
    </div>
  );
}

/** @deprecated Prefer Surface */
export function GlowPanel({
  children,
  className = '',
  accent,
  padding = 'md',
}: {
  children: ReactNode;
  className?: string;
  accent?: string;
  padding?: 'sm' | 'md' | 'lg';
}) {
  return (
    <Surface className={className} accent={accent} padding={padding}>
      {children}
    </Surface>
  );
}

export function MicroBar({
  value,
  fillColor = '#C48A2A',
  trackClassName = 'bg-surface-muted',
}: {
  value: number;
  fillColor?: string;
  trackClassName?: string;
}) {
  const w = Math.max(0, Math.min(100, value));
  return (
    <div className={`h-1.5 w-full overflow-hidden rounded-full ${trackClassName}`}>
      <div
        className="h-full rounded-full transition-all duration-500 ease-out"
        style={{ width: `${w}%`, backgroundColor: fillColor }}
      />
    </div>
  );
}

export function SectionHeader({
  label,
  title,
  description,
  align = 'center',
  className = '',
}: {
  label?: string;
  title: string;
  description?: string;
  align?: Align;
  className?: string;
}) {
  const alignCls = align === 'start' ? 'text-left items-start' : 'text-center items-center';
  return (
    <div className={`flex flex-col gap-2 ${alignCls} ${className}`.trim()}>
      {label ? <SectionLabel align={align}>{label}</SectionLabel> : null}
      <h2 className="font-display text-2xl sm:text-3xl font-semibold text-ink tracking-tight">
        {title}
      </h2>
      {description ? (
        <p className="max-w-2xl text-base text-ink-muted leading-relaxed">{description}</p>
      ) : null}
    </div>
  );
}

type ButtonVariant = 'primary' | 'secondary' | 'ghost';

const buttonStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-brand text-white hover:bg-brand-deep shadow-soft border border-transparent',
  secondary:
    'bg-surface text-ink border border-line hover:bg-surface-muted shadow-soft',
  ghost: 'bg-transparent text-ink-muted border border-transparent hover:text-ink hover:bg-surface-muted',
};

export function Button({
  children,
  className = '',
  variant = 'primary',
  href,
  type = 'button',
  onClick,
  disabled,
  ...rest
}: {
  children: ReactNode;
  className?: string;
  variant?: ButtonVariant;
  href?: string;
  type?: 'button' | 'submit' | 'reset';
  onClick?: () => void;
  disabled?: boolean;
} & React.ButtonHTMLAttributes<HTMLButtonElement> &
  React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-base font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:opacity-50 disabled:cursor-not-allowed';
  const cls = `${base} ${buttonStyles[variant]} ${className}`.trim();

  if (href) {
    return (
      <Link href={href} className={cls} {...(rest as any)}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} className={cls} onClick={onClick} disabled={disabled} {...(rest as any)}>
      {children}
    </button>
  );
}
