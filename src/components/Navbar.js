'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navLinks = [
  { href: '/', label: 'Prophets', icon: '◈' },
  { href: '/chat', label: 'Talk', icon: '💬' },
  { href: '/feed', label: 'Events', icon: '⚡' },
  { href: '/debate', label: 'Debate', icon: '⚔️' },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-bg-primary/85 backdrop-blur-xl border-b border-border-subtle">
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-16">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-oracle to-collective flex items-center justify-center text-sm font-bold text-white shadow-lg shadow-oracle/20 group-hover:shadow-oracle/40 transition-shadow">
            K
          </div>
          <span className="text-lg font-extrabold tracking-tight bg-gradient-to-r from-oracle-light to-collective-light bg-clip-text text-transparent">
            KIRMADA
          </span>
        </Link>

        {/* Nav Links — Desktop */}
        <div className="hidden sm:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || 
              (link.href !== '/' && pathname.startsWith(link.href));
            
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`
                  relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                  ${isActive
                    ? 'text-text-primary bg-bg-surface'
                    : 'text-text-secondary hover:text-text-primary hover:bg-bg-hover'
                  }
                `}
              >
                <span className="mr-1.5">{link.icon}</span>
                {link.label}
                {isActive && (
                  <span className="absolute -bottom-[1px] left-1/2 -translate-x-1/2 w-5 h-0.5 bg-oracle rounded-full" />
                )}
              </Link>
            );
          })}
        </div>

        {/* Mobile status */}
        <div className="sm:hidden flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-virus animate-pulse" />
          <span className="text-xs text-text-muted font-mono">LIVE</span>
        </div>
      </div>

      {/* Mobile Bottom Nav */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-bg-primary/95 backdrop-blur-xl border-t border-border-subtle">
        <div className="flex justify-around py-2">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || 
              (link.href !== '/' && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all
                  ${isActive ? 'text-text-primary' : 'text-text-muted'}
                `}
              >
                <span className="text-base">{link.icon}</span>
                {link.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
