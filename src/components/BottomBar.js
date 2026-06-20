'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const desktopTabs = [
  { href: '/', label: 'REPUBLIC', icon: 'map', active: true },
  { href: '#', label: 'MISSIONS', icon: 'track_changes', badge: '2' },
  { href: '#', label: 'RANKINGS', icon: 'emoji_events' },
  { href: '#', label: 'TREASURY', icon: 'account_balance' },
  { href: '#', label: 'MARKETPLACE', icon: 'storefront' },
];

export default function BottomBar() {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop Persistent Bottom Bar */}
      <div className="hidden lg:flex fixed bottom-0 left-[260px] right-0 z-40 h-[88px] bg-[#1A1D2D] border-t border-white/5 items-center justify-between pl-0 pr-8 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
        
        {/* Horizontal Navigation Tabs */}
        <div className="flex h-full items-center">
          {desktopTabs.map((tab, idx) => (
            <Link
              key={tab.label}
              href={tab.href}
              className={`
                relative h-full flex flex-col items-center justify-center min-w-[130px] transition-all
                ${tab.active 
                  ? 'bg-gradient-to-b from-purple-600 to-purple-500 text-white rounded-r-3xl' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
                }
                ${idx === 0 ? 'rounded-tl-none rounded-bl-none' : ''}
              `}
            >
              <span className="material-symbols-outlined text-[28px] mb-0.5 relative z-10">
                {tab.icon}
                {tab.badge && (
                  <span className="absolute -top-1 -right-2 w-4 h-4 rounded-full bg-red-500 text-[10px] font-bold text-white flex items-center justify-center border-2 border-[#1A1D2D] z-20">
                    {tab.badge}
                  </span>
                )}
              </span>
              <span className="text-[10px] font-bold tracking-widest relative z-10">{tab.label}</span>
            </Link>
          ))}
        </div>

        {/* Play Arena CTA */}
        <Link href="/debate" className="h-[64px] px-8 rounded-[32px] bg-gradient-to-r from-[#4C2A96] to-[#361975] flex items-center justify-between gap-6 cursor-pointer hover:from-[#5D37B5] hover:to-[#432092] transition-all min-w-[320px] shadow-lg">
          <div className="flex items-center gap-4">
            <div className="w-[42px] h-[42px] rounded-full bg-gradient-to-b from-yellow-400 to-orange-500 flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.5)]">
              <span className="material-symbols-outlined text-white text-[24px]">emoji_events</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[15px] font-bold text-white tracking-wide leading-tight">PLAY ARENA</span>
              <span className="text-[11px] text-[#A78BFA]">Debate to Earn Rewards</span>
            </div>
          </div>
          <span className="material-symbols-outlined text-[#A78BFA] text-[24px]">chevron_right</span>
        </Link>
      </div>

      {/* Mobile Bottom Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#1A1D2D]/95 backdrop-blur-xl border-t border-white/5 safe-area-bottom h-[72px]">
        <div className="flex justify-around items-center h-full">
          {desktopTabs.slice(0,4).map((tab) => (
            <Link
              key={tab.label}
              href={tab.href}
              className={`relative flex flex-col items-center justify-center w-full h-full ${tab.active ? 'text-white bg-gradient-to-t from-purple-600/20 to-transparent' : 'text-gray-400'}`}
            >
              <span className="material-symbols-outlined text-[24px] mb-0.5 relative">
                {tab.icon}
                {tab.badge && <span className="absolute -top-1 -right-2 w-4 h-4 rounded-full bg-red-500 text-[10px] text-white flex items-center justify-center border-2 border-[#1A1D2D]">{tab.badge}</span>}
              </span>
              <span className="text-[9px] font-bold tracking-wider">{tab.label}</span>
            </Link>
          ))}
          <Link href="/debate" className="relative flex flex-col items-center justify-center w-full h-full text-yellow-500">
             <span className="material-symbols-outlined text-[24px] mb-0.5">emoji_events</span>
             <span className="text-[9px] font-bold tracking-wider">ARENA</span>
          </Link>
        </div>
      </div>
    </>
  );
}
