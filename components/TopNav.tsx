"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

const NavLink = ({ href, pathname, children }: { href: string, pathname: string, children: React.ReactNode }) => {
  const isActive = pathname === href.split('?')[0];
  return (
    <Link
      href={href}
      className={`px-3 py-2 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-bold transition-all duration-200 ease-in-out whitespace-nowrap inline-flex items-center
        ${isActive
          ? 'bg-gradient-to-r from-yellow-400 to-amber-500 text-black shadow-lg shadow-yellow-500/30 ring-1 ring-yellow-500'
          : 'bg-white/5 hover:bg-white/10 text-white/80 hover:text-white'
        }`}
    >
      {children}
    </Link>
  );
};

export default function TopNav() {
  const pathname = usePathname() || "";
  const search = useSearchParams();
  const rid = search?.get('rid') || '';
  const showNav = [
    "/your-id",
    "/results",
    "/arctyps-duals",
    "/conflict-patterns",
    "/existential-circuits",
    "/summary",
    "/upgrades"
  ].some(prefix => pathname.startsWith(prefix));
  if (!showNav) return null;

  const navLinks = [
    { href: "/your-id", label: "ID Card" },
    { href: "/summary", label: "Summary" },
    { href: "/results", label: "Results" },
    { href: "/arctyps-duals", label: "Archetype Duals" },
    { href: "/upgrades", label: "Upgrades" },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/10 shadow-lg">
      <div className="max-w-7xl mx-auto px-2 sm:px-4">
        <div className="flex items-center justify-start sm:justify-center overflow-x-auto py-2 scrollbar-hide">
          <div className="inline-flex items-center gap-2 p-1 bg-white/5 rounded-full">
            {navLinks.map(link => (
              <NavLink
                key={link.href}
                href={`${link.href}${rid ? `?rid=${rid}` : ''}`}
                pathname={pathname}
              >
                {link.label}
              </NavLink>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}


