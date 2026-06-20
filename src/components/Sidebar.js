'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar({ isCollapsed, isMobileOpen, toggleSidebar, toggleMobile }) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300"
          onClick={toggleMobile}
        />
      )}

      <nav className={`fixed left-0 top-0 h-screen z-50 flex flex-col py-10 gap-2 border-r border-[#444748]/10 bg-gradient-to-b from-[#0e0e0e]/95 to-[#141313]/95 shadow-[20px_0_40px_rgba(0,0,0,0.6)] transition-all duration-300 ease-in-out md:translate-x-0 ${
        isMobileOpen ? 'translate-x-0' : '-translate-x-full'
      } ${isCollapsed ? 'md:w-20' : 'md:w-64 w-64'}`}>

        {/* Brand */}
        <div className={`flex flex-col items-center justify-center px-4 mb-3 transition-all duration-300 ${
          isCollapsed ? 'md:mb-6' : 'mb-3'
        }`}>
          <img
            alt="Oracle Sigil"
            className={`rounded-full border border-[#a9cecc]/20 shadow-[0_0_15px_rgba(169,206,204,0.2)] object-cover transition-all duration-300 ${
              isCollapsed ? 'md:w-10 md:h-10 md:mb-0' : 'w-16 h-16 mb-2'
            }`}
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAhCmeZGpgh-0BGIyluILqYDE_VoBm72pd5B8x4rAYnK0a54J9hgRB9d7GIa3DTYcZjQgElgNChdePmGG7AwuEHZfne2HjNxv9q7S9rJEiUH8Oiz4knsxihjyaKjfOhrGACasylW3wbEvYFLerBwHNg-qnykPPncH1UQ42Yd808DQv1KDEHGoXnE9OwTvFr2s0Wvy8kYfOGDvG-SokuBC81yyJQRajOFBUqpOSiDgcZTM8MrmNpzKGDSeSHgspz1N3jAyklTsysT2f4"
          />
          <div className={`transition-all duration-300 flex flex-col items-center justify-center mt-2 ${
            isCollapsed ? 'md:opacity-0 md:h-0 md:overflow-hidden' : 'opacity-100'
          }`}>
            <h1 className="text-[24px] text-[#e5e2e1] font-bold tracking-tighter" style={{ fontFamily: 'Lexend' }}>KIRMADA</h1>
            <p className="text-[12px] text-[#a9cecc] opacity-80 tracking-widest font-bold mt-1" style={{ fontFamily: 'JetBrains Mono' }}>Protocol V.2.0</p>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="flex flex-col gap-1 flex-1 mt-3">
          <Link
            href="/"
            onClick={() => { if (window.innerWidth < 768) toggleMobile(); }}
            className={`flex items-center gap-3 py-2 transition-all duration-200 ease-in-out font-bold tracking-widest text-[12px] ${
              isCollapsed ? 'md:px-0 md:justify-center px-6' : 'px-6'
            } ${pathname === '/' ? 'text-[#a9cecc] bg-[#000606]/30 border-l-2 border-[#a9cecc] shadow-[0_0_15px_rgba(169,206,204,0.2)]' : 'text-[#c4c7c7] opacity-70 hover:opacity-100 hover:bg-[#353434]/20 hover:text-[#e5e2e1]'}`}
            style={{ fontFamily: 'JetBrains Mono' }}
          >
            <span className="material-symbols-outlined" style={pathname === '/' ? { fontVariationSettings: "'FILL' 1" } : {}}>home</span>
            <span className={`transition-all duration-300 ${isCollapsed ? 'md:hidden' : 'block'}`}>Home</span>
          </Link>
          <Link
            href="/chat"
            onClick={() => { if (window.innerWidth < 768) toggleMobile(); }}
            className={`flex items-center gap-3 py-2 transition-all duration-200 ease-in-out font-bold tracking-widest text-[12px] ${
              isCollapsed ? 'md:px-0 md:justify-center px-6' : 'px-6'
            } ${pathname.startsWith('/chat') ? 'text-[#a9cecc] bg-[#000606]/30 border-l-2 border-[#a9cecc] shadow-[0_0_15px_rgba(169,206,204,0.2)]' : 'text-[#c4c7c7] opacity-70 hover:opacity-100 hover:bg-[#353434]/20 hover:text-[#e5e2e1]'}`}
            style={{ fontFamily: 'JetBrains Mono' }}
          >
            <span className="material-symbols-outlined">groups</span>
            <span className={`transition-all duration-300 ${isCollapsed ? 'md:hidden' : 'block'}`}>Parties</span>
          </Link>
          <Link
            href="/debate"
            onClick={() => { if (window.innerWidth < 768) toggleMobile(); }}
            className={`flex items-center gap-3 py-2 transition-all duration-200 ease-in-out font-bold tracking-widest text-[12px] ${
              isCollapsed ? 'md:px-0 md:justify-center px-6' : 'px-6'
            } ${pathname.startsWith('/debate') ? 'text-[#a9cecc] bg-[#000606]/30 border-l-2 border-[#a9cecc] shadow-[0_0_15px_rgba(169,206,204,0.2)]' : 'text-[#c4c7c7] opacity-70 hover:opacity-100 hover:bg-[#353434]/20 hover:text-[#e5e2e1]'}`}
            style={{ fontFamily: 'JetBrains Mono' }}
          >
            <span className="material-symbols-outlined">forum</span>
            <span className={`transition-all duration-300 ${isCollapsed ? 'md:hidden' : 'block'}`}>Debates</span>
          </Link>
          <Link
            href="/feed"
            onClick={() => { if (window.innerWidth < 768) toggleMobile(); }}
            className={`flex items-center gap-3 py-2 transition-all duration-200 ease-in-out font-bold tracking-widest text-[12px] ${
              isCollapsed ? 'md:px-0 md:justify-center px-6' : 'px-6'
            } ${pathname.startsWith('/feed') ? 'text-[#a9cecc] bg-[#000606]/30 border-l-2 border-[#a9cecc] shadow-[0_0_15px_rgba(169,206,204,0.2)]' : 'text-[#c4c7c7] opacity-70 hover:opacity-100 hover:bg-[#353434]/20 hover:text-[#e5e2e1]'}`}
            style={{ fontFamily: 'JetBrains Mono' }}
          >
            <span className="material-symbols-outlined">how_to_vote</span>
            <span className={`transition-all duration-300 ${isCollapsed ? 'md:hidden' : 'block'}`}>Vote</span>
          </Link>
          <Link
            href="#"
            className={`flex items-center gap-3 py-2 transition-all duration-200 ease-in-out font-bold tracking-widest text-[12px] ${
              isCollapsed ? 'md:px-0 md:justify-center px-6' : 'px-6'
            } text-[#c4c7c7] opacity-70 hover:opacity-100 hover:bg-[#353434]/20 hover:text-[#e5e2e1]`}
            style={{ fontFamily: 'JetBrains Mono' }}
          >
            <span className="material-symbols-outlined">gavel</span>
            <span className={`transition-all duration-300 ${isCollapsed ? 'md:hidden' : 'block'}`}>Laws</span>
          </Link>
        </div>

        {/* CTA Button */}
        <div className={`mt-auto pb-4 transition-all duration-300 ${
          isCollapsed ? 'md:px-0 mx-auto' : 'px-6'
        }`}>
          <button className={`bg-[#a9cecc]/20 text-[#a9cecc] border border-[#a9cecc]/50 hover:bg-[#a9cecc] hover:text-[#050505] hover:shadow-[0_0_20px_rgba(169,206,204,0.4)] transition-all py-2 rounded font-bold tracking-widest flex items-center justify-center ${
            isCollapsed ? 'md:w-10 md:h-10 md:p-0 md:rounded-full' : 'w-full px-4 text-[12px] gap-2'
          }`} style={{ fontFamily: 'JetBrains Mono' }}>
            <span className="material-symbols-outlined">bolt</span>
            <span className={`transition-all duration-300 ${isCollapsed ? 'md:hidden' : 'block'}`}>Initiate Ritual</span>
          </button>
        </div>
      </nav>
    </>
  );
}
