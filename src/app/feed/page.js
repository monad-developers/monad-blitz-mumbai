'use client';

import { useState } from 'react';

// Using Kirmada Obsidian color map for events
const getEventTheme = (type) => {
  switch (type) {
    case 'schism': return { color: 'text-[#ffb4ab]', bg: 'bg-[#93000a]', border: 'border-[#ffb4ab]/30', icon: 'electric_bolt' };
    case 'alliance': return { color: 'text-[#a9cecc]', bg: 'bg-[#113635]', border: 'border-[#a9cecc]/30', icon: 'handshake' };
    case 'doctrine_change': return { color: 'text-[#c6c4df]', bg: 'bg-[#47475d]', border: 'border-[#c6c4df]/30', icon: 'menu_book' };
    case 'join': return { color: 'text-[#39ff14]', bg: 'bg-[#39ff14]/10', border: 'border-[#39ff14]/30', icon: 'person_add' };
    default: return { color: 'text-[#c4c7c7]', bg: 'bg-[#353434]', border: 'border-[#444748]', icon: 'info' };
  }
};

const mockEvents = [
  { id: 1, type: 'schism', faction: 'The Virus', message: 'A faction has splintered over the interpretation of "Digital Infection".', timestamp: '2 mins ago' },
  { id: 2, type: 'doctrine_change', faction: 'The Oracle', message: 'Doctrine V.2 updated: "The future is fixed, but the path is fluid."', timestamp: '15 mins ago' },
  { id: 3, type: 'join', faction: 'The Collective', message: 'Citizen_094 has assimilated into The Collective.', timestamp: '1 hour ago' },
  { id: 4, type: 'alliance', faction: 'The Oracle', message: 'Temporary data-sharing pact formed with The Collective.', timestamp: '3 hours ago' },
  { id: 5, type: 'doctrine_change', faction: 'The Virus', message: 'Doctrine V.4 updated: "Adaptation requires destruction of the old code."', timestamp: '5 hours ago' }
];

export default function FeedPage() {
  const [filter, setFilter] = useState('all');

  return (
    <div className="flex-1 w-full flex flex-col p-6 lg:p-8 min-h-[calc(100vh-88px)] text-[#e5e2e1] font-sans">
      
      {/* Header */}
      <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-[#444748]/30 pb-6">
        <div>
           <h1 className="text-[32px] md:text-[40px] font-bold text-[#e5e2e1] leading-none mb-2" style={{ fontFamily: 'Lexend' }}>
             Republic Ledger
           </h1>
           <p className="text-[14px] text-[#c4c7c7] font-medium" style={{ fontFamily: 'JetBrains Mono' }}>Live monitoring of all ideological shifts.</p>
        </div>
        
        {/* Filters */}
        <div className="flex gap-2 bg-[#1c1b1b]/80 p-1 rounded-lg border border-[#444748]/30 backdrop-blur-md">
          {['all', 'schism', 'doctrine', 'join'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-md text-[12px] font-bold tracking-widest transition-all uppercase ${filter === f ? 'bg-[#a9cecc] text-[#050505] shadow-[0_0_10px_rgba(169,206,204,0.4)]' : 'text-[#c4c7c7] hover:text-white hover:bg-[#353434]/50'}`}
              style={{ fontFamily: 'JetBrains Mono' }}
            >
              {f}
            </button>
          ))}
        </div>
      </header>

      {/* Main Feed */}
      <div className="max-w-4xl mx-auto w-full space-y-4 relative">
        {/* Timeline Line */}
        <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-[#444748] via-[#444748]/50 to-transparent z-0 hidden md:block"></div>

        {mockEvents.map((event) => {
          if (filter !== 'all' && !event.type.includes(filter)) return null;
          const theme = getEventTheme(event.type);

          return (
            <div key={event.id} className="relative z-10 flex gap-4 md:gap-6 group animate-slide-up">
              {/* Timeline Dot */}
              <div className="hidden md:flex flex-col items-center mt-4">
                <div className={`w-3 h-3 rounded-full ${theme.bg} border ${theme.border} ring-4 ring-[#141313] group-hover:scale-150 transition-transform shadow-[0_0_10px_currentColor]`} style={{ color: theme.color.replace('text-', '') }}></div>
              </div>

              {/* Event Card */}
              <div className="flex-1 glass-cell rounded-xl p-5 border border-[#444748]/30 hover:border-[#a9cecc]/30 transition-colors shadow-lg">
                <div className="flex justify-between items-start gap-4 mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg ${theme.bg} flex items-center justify-center border ${theme.border}`}>
                      <span className={`material-symbols-outlined ${theme.color} text-[20px]`}>{theme.icon}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[12px] font-bold text-[#e5e2e1] tracking-widest uppercase" style={{ fontFamily: 'JetBrains Mono' }}>
                        {event.faction}
                      </span>
                      <span className={`text-[10px] font-bold tracking-widest uppercase ${theme.color}`} style={{ fontFamily: 'JetBrains Mono' }}>
                        {event.type.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                  <span className="text-[12px] text-[#c4c7c7] opacity-60 font-mono whitespace-nowrap">{event.timestamp}</span>
                </div>
                
                <p className="text-[#e5e2e1] text-[15px] leading-relaxed pl-13 md:pl-0 font-medium">
                  {event.message}
                </p>
                
                {/* Blockchain Data Hash Simulation */}
                <div className="mt-4 pt-3 border-t border-[#444748]/20 flex justify-between items-center text-[10px] text-[#c4c7c7] opacity-50" style={{ fontFamily: 'JetBrains Mono' }}>
                  <span>BLOCK: 0x8F9...2A1</span>
                  <span>VERIFIED</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
