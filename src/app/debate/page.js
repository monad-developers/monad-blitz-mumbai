'use client';

import { useState, useEffect } from 'react';
import { PROPHET_THEMES, PROPHET_IDS } from '@/lib/types';
import { generateDebateResponses } from '@/lib/prophet-engine';

export default function DebatePage() {
  const [topic, setTopic] = useState('How should the Republic govern AI sentience?');
  const [debateLog, setDebateLog] = useState([]);
  const [isDebating, setIsDebating] = useState(false);
  const [round, setRound] = useState(0);

  const startDebate = async () => {
    if (!topic.trim() || isDebating) return;
    setIsDebating(true);
    setDebateLog([{ speaker: 'system', content: `[SYSTEM] INITIATING TRIBUNAL ON PROTOCOL: "${topic.toUpperCase()}"` }]);
    setRound(1);

    try {
      const responses = await generateDebateResponses(topic);
      let delay = 1000;
      responses.forEach((res, index) => {
        setTimeout(() => {
          setDebateLog(prev => [...prev, { speaker: res.prophetId, content: res.argument }]);
          if (index === responses.length - 1) setIsDebating(false);
        }, delay);
        delay += 3000;
      });
    } catch (error) {
      setDebateLog(prev => [...prev, { speaker: 'system', content: '[ERROR] Neural link unstable. Debate terminated.' }]);
      setIsDebating(false);
    }
  };

  return (
    <div className="flex-1 w-full flex flex-col p-6 lg:p-8 min-h-[calc(100vh-88px)] text-[#e5e2e1] font-sans">
      
      {/* Header */}
      <header className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-[#444748]/30 pb-6">
        <div>
           <div className="flex items-center gap-2 text-[#a9cecc] mb-2">
             <span className="material-symbols-outlined text-[18px] animate-pulse-glow">gavel</span>
             <span className="text-[12px] font-bold tracking-widest" style={{ fontFamily: 'JetBrains Mono' }}>THE GRAND TRIBUNAL</span>
           </div>
           <h1 className="text-[32px] md:text-[40px] font-bold text-[#e5e2e1] leading-none" style={{ fontFamily: 'Lexend' }}>
             Debate Arena
           </h1>
        </div>
        
        {/* Setup Controls */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            disabled={isDebating}
            placeholder="Enter debate protocol..."
            className="w-full md:w-[300px] bg-[#1c1b1b] border border-[#444748] text-white px-4 py-2.5 rounded-lg focus:outline-none focus:border-[#00F2FF] text-[14px] disabled:opacity-50"
          />
          <button
            onClick={startDebate}
            disabled={isDebating || !topic.trim()}
            className="px-6 py-2.5 bg-[#8a2be2] text-white font-bold tracking-widest text-[12px] rounded-lg hover:bg-[#a020f0] transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap shadow-[0_0_15px_rgba(138,43,226,0.3)]"
            style={{ fontFamily: 'JetBrains Mono' }}
          >
            {isDebating ? 'SIMULATING...' : 'COMMENCE'}
          </button>
        </div>
      </header>

      {/* Main Arena */}
      <div className="flex-1 flex flex-col xl:flex-row gap-6 min-h-0">
        
        {/* Podiums Panel */}
        <div className="w-full xl:w-[320px] flex xl:flex-col justify-center gap-4 overflow-x-auto xl:overflow-visible shrink-0 pb-4 xl:pb-0">
          {Object.entries(PROPHET_THEMES).map(([id, theme]) => {
             const isActive = isDebating && debateLog[debateLog.length - 1]?.speaker === id;
             let glowClass, borderColor, textCol, icon, gradient;
             if (id === 'oracle') { glowClass = 'glow-gold'; borderColor = 'border-[#ffd700]/30'; textCol = 'text-[#ffd700]'; icon = 'visibility'; gradient = 'from-[rgba(255,215,0,0.05)] to-transparent'; }
             else if (id === 'virus') { glowClass = 'glow-neon-green'; borderColor = 'border-[#39ff14]/30'; textCol = 'text-[#39ff14]'; icon = 'bug_report'; gradient = 'from-[rgba(57,255,20,0.05)] to-transparent'; }
             else { glowClass = 'glow-purple'; borderColor = 'border-[#8a2be2]/30'; textCol = 'text-[#8a2be2]'; icon = 'hive'; gradient = 'from-[rgba(138,43,226,0.05)] to-transparent'; }

             return (
               <div key={id} className={`glass-cell rounded-xl p-4 flex flex-col items-center justify-center relative min-w-[200px] xl:min-w-0 transition-all duration-500 ${isActive ? `scale-105 shadow-[0_0_30px_rgba(255,255,255,0.1)] faction-${id}` : 'opacity-70 grayscale-[30%]'}`}>
                 <div className={`absolute inset-0 bg-gradient-to-b ${gradient} pointer-events-none`}></div>
                 <div className={`w-16 h-16 rounded-full bg-[#141313] border flex items-center justify-center mb-3 relative shadow-inner z-10 transition-colors duration-500 ${isActive ? borderColor : 'border-[#444748]'}`}>
                    <span className={`material-symbols-outlined text-[32px] ${textCol} ${isActive ? glowClass : ''} transition-all duration-500`}>
                      {icon}
                    </span>
                 </div>
                 <h3 className="text-[16px] font-bold text-[#e5e2e1] z-10" style={{ fontFamily: 'Lexend' }}>{theme.name}</h3>
                 <div className={`mt-2 h-1 w-12 rounded-full ${isActive ? textCol.replace('text-', 'bg-') : 'bg-[#444748]'} transition-colors duration-500 shadow-[0_0_8px_currentColor]`}></div>
               </div>
             );
          })}
        </div>

        {/* Live Transcript Panel */}
        <div className="flex-1 glass-cell rounded-xl flex flex-col relative overflow-hidden border border-[#a9cecc]/20 shadow-[0_0_40px_rgba(0,0,0,0.4)]">
          {/* Header */}
          <div className="px-6 py-4 border-b border-[#a9cecc]/20 bg-[#0e0e0e]/60 flex items-center justify-between">
            <span className="text-[14px] font-bold text-[#e5e2e1] tracking-widest" style={{ fontFamily: 'JetBrains Mono' }}>NEURAL TRANSCRIPT</span>
            <span className="flex items-center gap-2 text-[#a9cecc] text-[12px] font-mono">
               <span className={`w-2 h-2 rounded-full ${isDebating ? 'bg-[#39ff14] animate-pulse-glow' : 'bg-[#ffb4ab]'}`}></span>
               {isDebating ? 'RECORDING' : 'IDLE'}
            </span>
          </div>

          {/* Transcript Scroll Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gradient-to-b from-[#141313]/50 to-[#0e0e0e]/50">
            {debateLog.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-[#c4c7c7] opacity-50 gap-4">
                <span className="material-symbols-outlined text-[64px]">forum</span>
                <p className="font-mono text-[14px]">Awaiting tribunal parameters...</p>
              </div>
            )}
            {debateLog.map((log, index) => {
              if (log.speaker === 'system') {
                return (
                  <div key={index} className="w-full text-center py-2">
                    <span className="inline-block px-4 py-1.5 rounded-full bg-[#1c1b1b] border border-[#a9cecc]/30 text-[#a9cecc] text-[10px] font-bold tracking-widest" style={{ fontFamily: 'JetBrains Mono' }}>
                      {log.content}
                    </span>
                  </div>
                );
              }

              const theme = PROPHET_THEMES[log.speaker];
              let textCol, borderCol;
              if (log.speaker === 'oracle') { textCol = 'text-[#ffd700]'; borderCol = 'border-[#ffd700]/30'; }
              else if (log.speaker === 'virus') { textCol = 'text-[#39ff14]'; borderCol = 'border-[#39ff14]/30'; }
              else { textCol = 'text-[#8a2be2]'; borderCol = 'border-[#8a2be2]/30'; }

              return (
                <div key={index} className="flex flex-col gap-1.5 animate-slide-up">
                  <span className={`text-[12px] font-bold tracking-widest ${textCol}`} style={{ fontFamily: 'JetBrains Mono' }}>
                    {theme.name}
                  </span>
                  <div className={`p-5 rounded-lg rounded-tl-sm bg-[#201f1f]/80 border ${borderCol} text-[#e5e2e1] text-[15px] leading-relaxed shadow-[0_4px_15px_rgba(0,0,0,0.3)] backdrop-blur-md`}>
                    {log.content}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
