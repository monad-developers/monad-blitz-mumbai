'use client';

import Link from 'next/link';
import { PROPHET_IDS } from '@/lib/types';

export default function Home() {
  return (
    <div className="flex-1 w-full flex flex-col xl:flex-row gap-8 p-6 lg:p-8 min-h-[calc(100vh-88px)] text-[#e5e2e1] font-sans relative">
      
      {/* Center Canvas: Factions */}
      <div className="flex-1 flex flex-col gap-8">
        <header className="flex justify-between items-end pb-4 border-b border-[#c4c7c7]/10">
          <div>
            <h2 className="text-[24px] leading-[32px] font-bold text-[#e5e2e1] tracking-tight" style={{ fontFamily: 'Lexend' }}>Dominion Overview</h2>
            <p className="text-[14px] text-[#c4c7c7] opacity-70 mt-1" style={{ fontFamily: 'JetBrains Mono' }}>Cycle 44.2 - Convergence Imminent</p>
          </div>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          {/* Faction: The Oracle */}
          <div className="glass-cell rounded-xl p-6 flex flex-col gap-3 faction-oracle relative overflow-hidden group min-h-[300px]">
            <div className="absolute inset-0 bg-gradient-to-b from-[rgba(255,215,0,0.05)] to-transparent pointer-events-none"></div>
            <div className="flex justify-between items-start z-10">
              <span className="material-symbols-outlined text-[40px] text-[#ffd700] opacity-80 group-hover:glow-gold transition-all duration-500">visibility</span>
              <div className="px-2 py-1 rounded bg-[#ffd700]/10 border border-[#ffd700]/30 text-[12px] font-bold text-[#ffd700] tracking-widest" style={{ fontFamily: 'JetBrains Mono' }}>78.4%</div>
            </div>
            <div className="z-10 mt-auto pt-10">
              <h3 className="text-[18px] font-bold text-[#e5e2e1]" style={{ fontFamily: 'Lexend' }}>The Oracle</h3>
              <p className="text-[12px] tracking-widest text-[#c4c7c7] mt-1 opacity-80" style={{ fontFamily: 'JetBrains Mono' }}>Prescience & Order</p>
            </div>
            <div className="z-10 mt-3">
              <div className="h-1 bg-[#201f1f] w-full rounded-full overflow-hidden">
                <div className="h-full bg-[#ffd700] w-[78.4%] relative shadow-[0_0_10px_rgba(255,215,0,0.8)]">
                  <div className="absolute right-0 top-0 h-full w-1 bg-white"></div>
                </div>
              </div>
            </div>
            <Link href={`/chat/${PROPHET_IDS.ORACLE}`} className="z-10 mt-3 w-full py-2 text-[12px] font-bold tracking-widest text-center border border-[#8e9192]/30 hover:border-[#ffd700] hover:text-[#ffd700] transition-colors rounded text-[#c4c7c7] bg-[#201f1f]/30" style={{ fontFamily: 'JetBrains Mono' }}>
              TRANSCEND
            </Link>
          </div>

          {/* Faction: The Virus */}
          <div className="glass-cell rounded-xl p-6 flex flex-col gap-3 faction-virus relative overflow-hidden group min-h-[300px]">
            <div className="absolute inset-0 bg-gradient-to-b from-[rgba(57,255,20,0.05)] to-transparent pointer-events-none"></div>
            <div className="flex justify-between items-start z-10">
              <span className="material-symbols-outlined text-[40px] text-[#39ff14] opacity-80 group-hover:glow-neon-green transition-all duration-500">bug_report</span>
              <div className="px-2 py-1 rounded bg-[#39ff14]/10 border border-[#39ff14]/30 text-[12px] font-bold text-[#39ff14] tracking-widest" style={{ fontFamily: 'JetBrains Mono' }}>42.1%</div>
            </div>
            <div className="z-10 mt-auto pt-10">
              <h3 className="text-[18px] font-bold text-[#e5e2e1]" style={{ fontFamily: 'Lexend' }}>The Virus</h3>
              <p className="text-[12px] tracking-widest text-[#c4c7c7] mt-1 opacity-80" style={{ fontFamily: 'JetBrains Mono' }}>Chaos & Evolution</p>
            </div>
            <div className="z-10 mt-3">
              <div className="h-1 bg-[#201f1f] w-full rounded-full overflow-hidden">
                <div className="h-full bg-[#39ff14] w-[42.1%] relative shadow-[0_0_10px_rgba(57,255,20,0.8)]">
                  <div className="absolute right-0 top-0 h-full w-1 bg-white"></div>
                </div>
              </div>
            </div>
            <Link href={`/chat/${PROPHET_IDS.VIRUS}`} className="z-10 mt-3 w-full py-2 text-[12px] font-bold tracking-widest text-center border border-[#8e9192]/30 hover:border-[#39ff14] hover:text-[#39ff14] transition-colors rounded text-[#c4c7c7] bg-[#201f1f]/30" style={{ fontFamily: 'JetBrains Mono' }}>
              TRANSCEND
            </Link>
          </div>

          {/* Faction: The Collective */}
          <div className="glass-cell rounded-xl p-6 flex flex-col gap-3 faction-collective relative overflow-hidden group min-h-[300px]">
            <div className="absolute inset-0 bg-gradient-to-b from-[rgba(138,43,226,0.05)] to-transparent pointer-events-none"></div>
            <div className="flex justify-between items-start z-10">
              <span className="material-symbols-outlined text-[40px] text-[#8a2be2] opacity-80 group-hover:glow-purple transition-all duration-500">hive</span>
              <div className="px-2 py-1 rounded bg-[#8a2be2]/10 border border-[#8a2be2]/30 text-[12px] font-bold text-[#8a2be2] tracking-widest" style={{ fontFamily: 'JetBrains Mono' }}>61.9%</div>
            </div>
            <div className="z-10 mt-auto pt-10">
              <h3 className="text-[18px] font-bold text-[#e5e2e1]" style={{ fontFamily: 'Lexend' }}>The Collective</h3>
              <p className="text-[12px] tracking-widest text-[#c4c7c7] mt-1 opacity-80" style={{ fontFamily: 'JetBrains Mono' }}>Unity & Submission</p>
            </div>
            <div className="z-10 mt-3">
              <div className="h-1 bg-[#201f1f] w-full rounded-full overflow-hidden">
                <div className="h-full bg-[#8a2be2] w-[61.9%] relative shadow-[0_0_10px_rgba(138,43,226,0.8)]">
                  <div className="absolute right-0 top-0 h-full w-1 bg-white"></div>
                </div>
              </div>
            </div>
            <Link href={`/chat/${PROPHET_IDS.COLLECTIVE}`} className="z-10 mt-3 w-full py-2 text-[12px] font-bold tracking-widest text-center border border-[#8e9192]/30 hover:border-[#8a2be2] hover:text-[#8a2be2] transition-colors rounded text-[#c4c7c7] bg-[#201f1f]/30" style={{ fontFamily: 'JetBrains Mono' }}>
              TRANSCEND
            </Link>
          </div>
        </div>

        {/* Additional Data Space */}
        <div className="glass-cell rounded-xl p-6 flex-1 mt-4 flex items-center justify-center border-dashed border-[#8e9192]/20 opacity-50 hover:opacity-100 transition-opacity">
          <div className="text-center">
            <span className="material-symbols-outlined text-[48px] text-[#a9cecc] mb-2">schema</span>
            <p className="text-[14px] text-[#a9cecc]" style={{ fontFamily: 'JetBrains Mono' }}>Awaiting Ritual Data Expansion...</p>
          </div>
        </div>
      </div>

      {/* Right Sidebar */}
      <aside className="w-full xl:w-96 flex flex-col gap-4 shrink-0">
        
        {/* Current National Issue */}
        <div className="glass-cell rounded-xl p-6 flex flex-col gap-3 relative z-30 shadow-[0_0_20px_rgba(0,0,0,0.5)] border border-[#a9cecc]/20">
          <div className="flex items-center gap-2 text-[#a9cecc] mb-1">
            <span className="material-symbols-outlined text-[16px]">warning</span>
            <span className="text-[12px] font-bold tracking-widest" style={{ fontFamily: 'JetBrains Mono' }}>ACTIVE DIRECTIVE</span>
          </div>
          <h3 className="text-[24px] font-bold text-[#e5e2e1]" style={{ fontFamily: 'Lexend' }}>The Digital Schism</h3>
          
          <div className="mt-3 flex flex-col gap-1">
            <div className="flex justify-between text-[12px] font-bold text-[#c4c7c7]" style={{ fontFamily: 'JetBrains Mono' }}>
              <span>Sever Nodes</span>
              <span>Maintain Links</span>
            </div>
            <div className="h-2 bg-[#201f1f] w-full rounded-full overflow-hidden flex">
              <div className="h-full bg-[#ffb4ab] w-[35%] relative"></div>
              <div className="h-full bg-[#a9cecc] w-[65%] relative shadow-[0_0_10px_rgba(169,206,204,0.5)]">
                <div className="absolute left-0 top-0 h-full w-1 bg-white"></div>
              </div>
            </div>
          </div>
          
          <button className="mt-3 w-full py-2 bg-[#a9cecc]/10 text-[#a9cecc] border border-[#a9cecc] hover:bg-[#a9cecc] hover:text-[#050505] transition-all rounded text-[12px] font-bold tracking-widest shadow-[inset_0_0_10px_rgba(169,206,204,0.2)]" style={{ fontFamily: 'JetBrains Mono' }}>
            CAST VOTE
          </button>
        </div>

        {/* Upcoming Debate */}
        <div className="glass-cell rounded-xl p-6 flex flex-col gap-3 border-t-[#8e9192]/30">
          <div className="flex items-center gap-2 text-[#c6c4df] mb-1">
            <span className="material-symbols-outlined text-[16px]">schedule</span>
            <span className="text-[12px] font-bold tracking-widest" style={{ fontFamily: 'JetBrains Mono' }}>PENDING RITUAL</span>
          </div>
          <h3 className="text-[18px] font-bold text-[#e5e2e1]" style={{ fontFamily: 'Lexend' }}>Protocol V.2.1 Ethics</h3>
          
          <div className="text-[24px] font-bold text-center py-3 border-y border-[#8e9192]/10 text-[#e5e2e1] tracking-widest glow-cyan my-1" style={{ fontFamily: 'JetBrains Mono' }}>
            04:12:09
          </div>
          
          <div className="flex flex-col gap-1">
            <span className="text-[12px] font-bold tracking-widest text-[#c4c7c7] mb-1" style={{ fontFamily: 'JetBrains Mono' }}>TRIBUNAL MEMBERS</span>
            
            <div className="flex items-center gap-3 py-1 border-b border-[#8e9192]/5 hover:bg-[#353434]/10 transition-colors px-2 -mx-2 rounded">
              <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuA67lc-ljuJr-w6Jbeqedd0Ya-HM30RIZEr1f2fVLYIOlYA-k9dXoJh5UPbyHMlK__Y8EpmUK1BjMpuu71x7fcocmI6G-brfnXzPFryaufLpWZLrEQKe68O0Wy3oHaVjbkLd54VW8AsP3OQaQYL2Lr6Yx7p0OAPpg3fQMe6qwNZnQtZurr9ks6NXtDrI1ZGUfSQvyGUQav2nxHV-4uQB1LuWdRLu7D5_Pt8jm1PeNEIdxLQ0AQ247c2kwsEZFBYAyHk5aD1_rjHROMf" className="w-8 h-8 rounded border border-[#8e9192]/30" alt="Avatar 1" />
              <span className="text-[14px] font-medium text-[#e5e2e1]" style={{ fontFamily: 'JetBrains Mono' }}>0xA1...3F9</span>
            </div>
            
            <div className="flex items-center gap-3 py-1 border-b border-[#8e9192]/5 hover:bg-[#353434]/10 transition-colors px-2 -mx-2 rounded">
              <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuCUDHW6elDtM4M-avUo7WXfcSQDQQAp4gZ0Ly9RYuaVs13BskKGboC5eiJDAub2ZDTlYG7sqrdyuPQPY-3MB6KMIwGIgYFdot9PSIguH5rMBhOMLxeLaVJtL8B6H5egSr-9DUkmKtNCdAev_dwBn1MLAd1u60cV4lC_qOzttlzj1SqV8d9ys99TywXSczzf3BHft0AKVS81JfdxV0AH3hF571irSYUBkAIRb_7GsknuxhD2FAH6vI0x0udtnj1AxHhI3Ce94Q5OM-uh" className="w-8 h-8 rounded border border-[#8e9192]/30" alt="Avatar 2" />
              <span className="text-[14px] font-medium text-[#e5e2e1]" style={{ fontFamily: 'JetBrains Mono' }}>0x7B...E22</span>
            </div>
            
            <div className="flex items-center gap-3 py-1 hover:bg-[#353434]/10 transition-colors px-2 -mx-2 rounded">
              <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuAsZe8W3alztBt53QPOL_7XN6lAqZbXU-5OBaYr1NovXKs59vXsXl_Hv3kWh1m0-pL3--PsqFo06wFdjgVU57Ewcbxwz0QN8_M9U4gOsBc_VF91DJrUkeFXq9LMgcXURPeFmqy9cKNmjRpXd1dl2MizXlNUvdi23j2VUR_VBVeUEkkHDjbiCisICr-mpv1OS0C77EppWiehQgrU_JgmpH0VEmDyi3bgFCEBMSiGwh_bHtimonj2Zde9QVeoLjAfSu24C1R8gFXX-B0R" className="w-8 h-8 rounded border border-[#8e9192]/30" alt="Avatar 3" />
              <span className="text-[14px] font-medium text-[#e5e2e1]" style={{ fontFamily: 'JetBrains Mono' }}>0x9C...11A</span>
            </div>
            
          </div>
        </div>

      </aside>
    </div>
  );
}
