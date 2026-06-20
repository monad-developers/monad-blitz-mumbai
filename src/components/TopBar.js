'use client';

export default function TopBar({ isCollapsed, toggleSidebar, toggleMobile }) {
  return (
    <header className={`bg-[#0e0e0e]/80 backdrop-blur-xl border-b border-[#444748]/10 shadow-xl flex justify-between items-center px-8 h-20 fixed top-0 w-full z-50 transition-all duration-300 ease-in-out ${
      isCollapsed ? 'md:w-[calc(100%-5rem)] md:ml-20' : 'md:w-[calc(100%-16rem)] md:ml-64'
    }`}>
      <div className="flex items-center gap-4">
        {/* Desktop Hamburger */}
        <button 
          onClick={toggleSidebar}
          className="hidden md:flex text-[#a9cecc] hover:text-[#c4eae8] p-1.5 rounded-lg hover:bg-[#353434]/20 transition-all cursor-pointer items-center justify-center"
          title="Toggle Sidebar"
        >
          <span className="material-symbols-outlined text-[24px]">menu</span>
        </button>

        {/* Mobile Hamburger */}
        <button 
          onClick={toggleMobile}
          className="md:hidden flex text-[#a9cecc] hover:text-[#c4eae8] p-1.5 rounded-lg hover:bg-[#353434]/20 transition-all cursor-pointer items-center justify-center"
          title="Toggle Navigation"
        >
          <span className="material-symbols-outlined text-[24px]">menu</span>
        </button>
        
        {/* Mobile brand (hidden on desktop) */}
        <div className="flex items-center gap-4 md:hidden">
          <span className="text-[32px] font-bold tracking-tighter text-[#e5e2e1]" style={{ fontFamily: 'Lexend' }}>KIRMADA</span>
        </div>
      </div>

      <div className="flex items-center gap-4 ml-auto">
        <span className="text-[#c4c7c7] text-[14px] font-medium tracking-wider" style={{ fontFamily: 'JetBrains Mono' }}>12,450 Influence</span>
        <span className="text-[#c4c7c7] text-[14px] font-medium tracking-wider hidden sm:inline" style={{ fontFamily: 'JetBrains Mono' }}>Lv. 12</span>
        <span className="material-symbols-outlined text-[#a9cecc] cursor-pointer hover:text-[#c4eae8] transition-colors">notifications</span>
        <span className="material-symbols-outlined text-[#a9cecc] cursor-pointer hover:text-[#c4eae8] transition-colors">settings</span>
        <img
          alt="Cult Leader Profile"
          className="w-8 h-8 rounded-full border border-[#444748]/20 object-cover"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuAzYG38I_fru9qokK6Ye14hSfxfFyISLoLn3nK_Y34spihG2M2MIpx9_BmUPv7n9ySOMAlQSxhwBqrWoNkisn3XK43RN7lAWF-R1gigxBtGIBQpWI6Nf2dIvcW0Bzvw9W9f-SAbjE_rsZGx5PU3hkFhZL6wSlbyCQeOCFywmvYWRuU8bD7hOAWUNOJ4bBA9Q4vv_B0u7rV3TGtrgHL0qEZqHQiXQYK5h47H2SxWQ5a9SR8TWk6XCnej5xw0MbscZg9yWpctcHN9ts9q"
        />
      </div>
    </header>
  );
}
