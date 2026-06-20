'use client';

import Link from 'next/link';
import { PROPHET_THEMES } from '@/lib/types';

export default function ChatIndex() {
  return (
    <div className="flex-1 w-full flex flex-col p-6 lg:p-10 min-h-[calc(100vh-88px)] text-[#e5e2e1] font-sans">
      
      <header className="mb-10 flex flex-col items-center text-center">
        <h1 className="text-[36px] md:text-[48px] font-bold text-[#e5e2e1] tracking-tight mb-4" style={{ fontFamily: 'Lexend' }}>
          Secure Channels
        </h1>
        <p className="text-[16px] text-[#c4c7c7] max-w-2xl font-medium">
          Establish a direct neural uplink with the Faction leaders. Your influence here dictates the evolution of their doctrines.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto w-full">
        {Object.entries(PROPHET_THEMES).map(([id, theme]) => {
          // Map to Obsidian Theme styling
          let glowClass, borderColor, textCol, icon, gradient;
          if (id === 'oracle') {
            glowClass = 'glow-gold'; borderColor = 'border-[#ffd700]/30'; textCol = 'text-[#ffd700]'; icon = 'visibility'; gradient = 'from-[rgba(255,215,0,0.05)] to-transparent';
          } else if (id === 'virus') {
            glowClass = 'glow-neon-green'; borderColor = 'border-[#39ff14]/30'; textCol = 'text-[#39ff14]'; icon = 'bug_report'; gradient = 'from-[rgba(57,255,20,0.05)] to-transparent';
          } else {
            glowClass = 'glow-purple'; borderColor = 'border-[#8a2be2]/30'; textCol = 'text-[#8a2be2]'; icon = 'hive'; gradient = 'from-[rgba(138,43,226,0.05)] to-transparent';
          }

          return (
            <Link key={id} href={`/chat/${id}`} className={`glass-cell rounded-xl p-8 flex flex-col items-center text-center gap-4 relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300 faction-${id}`}>
               <div className={`absolute inset-0 bg-gradient-to-b ${gradient} pointer-events-none`}></div>
               
               <div className="w-24 h-24 rounded-full bg-[#1c1b1b] border border-[#444748] flex items-center justify-center relative shadow-inner mb-2 z-10 group-hover:border-transparent transition-all">
                 <div className={`absolute inset-0 rounded-full opacity-0 group-hover:opacity-20 transition-opacity bg-current ${textCol}`}></div>
                 <span className={`material-symbols-outlined text-[48px] ${textCol} opacity-80 group-hover:${glowClass} transition-all duration-500`}>
                   {icon}
                 </span>
               </div>
               
               <h2 className="text-[24px] font-bold text-[#e5e2e1] z-10" style={{ fontFamily: 'Lexend' }}>{theme.name}</h2>
               <p className="text-[13px] text-[#a9cecc] tracking-widest font-bold z-10" style={{ fontFamily: 'JetBrains Mono' }}>{theme.theme}</p>
               
               <div className="mt-6 w-full py-3 bg-[#201f1f]/50 border border-[#444748]/50 group-hover:bg-[#201f1f] transition-all rounded flex items-center justify-center gap-2 z-10 text-[12px] tracking-widest text-[#e5e2e1] group-hover:text-white" style={{ fontFamily: 'JetBrains Mono' }}>
                 <span className={`material-symbols-outlined text-[18px] ${textCol}`}>wifi_tethering</span>
                 INITIATE UPLINK
               </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
