'use client';

import { useState, useRef, useEffect } from 'react';
import { PROPHET_THEMES, PROPHET_IDS } from '@/lib/types';
import { use } from 'react';

// Enhanced UI Themes based on Kirmada Obsidian Design System
const UI_THEMES = {
  [PROPHET_IDS.ORACLE]: {
    name: 'THE ORACLE',
    glow: 'glow-gold',
    border: 'border-[#ffd700]/30',
    text: 'text-[#ffd700]',
    bg: 'bg-[#ffd700]/10',
    avatar: 'visibility',
    gradient: 'from-[rgba(255,215,0,0.05)] to-transparent',
    msgBg: 'bg-[#ffd700]/5 border-[#ffd700]/20'
  },
  [PROPHET_IDS.VIRUS]: {
    name: 'THE VIRUS',
    glow: 'glow-neon-green',
    border: 'border-[#39ff14]/30',
    text: 'text-[#39ff14]',
    bg: 'bg-[#39ff14]/10',
    avatar: 'bug_report',
    gradient: 'from-[rgba(57,255,20,0.05)] to-transparent',
    msgBg: 'bg-[#39ff14]/5 border-[#39ff14]/20'
  },
  [PROPHET_IDS.COLLECTIVE]: {
    name: 'THE COLLECTIVE',
    glow: 'glow-purple',
    border: 'border-[#8a2be2]/30',
    text: 'text-[#8a2be2]',
    bg: 'bg-[#8a2be2]/10',
    avatar: 'hive',
    gradient: 'from-[rgba(138,43,226,0.05)] to-transparent',
    msgBg: 'bg-[#8a2be2]/5 border-[#8a2be2]/20'
  }
};

export default function ChatPage({ params }) {
  const unwrappedParams = use(params);
  const prophetId = unwrappedParams.id;
  const prophetDef = PROPHET_THEMES[prophetId] || PROPHET_THEMES[PROPHET_IDS.ORACLE];
  const uiTheme = UI_THEMES[prophetId] || UI_THEMES[PROPHET_IDS.ORACLE];

  const [messages, setMessages] = useState([
    { role: 'system', content: `Connection established with ${uiTheme.name}. Awaiting input...` }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prophetId,
          messages: [{ role: 'user', content: userMsg }]
        })
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'prophet', content: data.reply }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'system', content: 'ERROR: Connection to the host was lost.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 w-full flex flex-col xl:flex-row gap-8 p-6 lg:p-8 min-h-[calc(100vh-88px)] text-[#e5e2e1] font-sans">
      
      {/* Left Panel: Prophet Identity */}
      <div className="w-full xl:w-80 shrink-0 flex flex-col gap-6">
        <div className={`glass-cell rounded-xl p-6 flex flex-col gap-4 relative overflow-hidden faction-${prophetId === PROPHET_IDS.ORACLE ? 'oracle' : prophetId === PROPHET_IDS.VIRUS ? 'virus' : 'collective'}`}>
          <div className={`absolute inset-0 bg-gradient-to-b ${uiTheme.gradient} pointer-events-none`}></div>
          
          <div className="flex justify-between items-start z-10">
            <span className={`material-symbols-outlined text-[48px] ${uiTheme.text} ${uiTheme.glow}`}>
              {uiTheme.avatar}
            </span>
            <div className={`px-3 py-1 rounded ${uiTheme.bg} border ${uiTheme.border} text-[12px] font-bold ${uiTheme.text} tracking-widest`} style={{ fontFamily: 'JetBrains Mono' }}>
              SECURE COMM
            </div>
          </div>
          
          <div className="z-10 mt-4">
            <h1 className="text-[28px] font-bold text-[#e5e2e1] leading-none mb-1" style={{ fontFamily: 'Lexend' }}>{uiTheme.name}</h1>
            <p className="text-[12px] text-[#c4c7c7] opacity-80" style={{ fontFamily: 'JetBrains Mono' }}>{prophetDef.theme}</p>
          </div>

          <div className="z-10 mt-6 pt-6 border-t border-[#444748]/30 space-y-4">
             <div>
                <span className="text-[10px] tracking-widest text-[#a9cecc] mb-1 block" style={{ fontFamily: 'JetBrains Mono' }}>SYS_GOAL</span>
                <p className="text-[14px] text-[#e5e2e1] leading-snug">{prophetDef.goal}</p>
             </div>
             <div>
                <span className="text-[10px] tracking-widest text-[#a9cecc] mb-1 block" style={{ fontFamily: 'JetBrains Mono' }}>NETWORK_INFLUENCE</span>
                <div className="flex items-center gap-3">
                   <div className="h-1.5 bg-[#201f1f] flex-1 rounded-full overflow-hidden">
                      <div className={`h-full bg-white w-[65%] ${uiTheme.bg.replace('/10', '')} shadow-[0_0_10px_currentColor]`} style={{ color: uiTheme.text.split('-')[1].replace(']', '') }}></div>
                   </div>
                   <span className="text-[14px] font-bold text-[#e5e2e1]" style={{ fontFamily: 'JetBrains Mono' }}>65%</span>
                </div>
             </div>
          </div>
        </div>

        {/* Action Panel */}
        <div className="glass-cell rounded-xl p-6 border border-[#a9cecc]/20">
           <h3 className="text-[14px] font-bold text-[#e5e2e1] mb-4" style={{ fontFamily: 'Lexend' }}>Ritual Actions</h3>
           <button className="w-full py-3 mb-3 bg-[#00F2FF]/10 text-[#00F2FF] border border-[#00F2FF]/50 hover:bg-[#00F2FF] hover:text-[#050505] hover:shadow-[0_0_20px_rgba(0,242,255,0.4)] transition-all rounded text-[12px] font-bold tracking-widest flex items-center justify-center gap-2" style={{ fontFamily: 'JetBrains Mono' }}>
             <span className="material-symbols-outlined">payments</span>
             Offer Tribute
           </button>
           <button className="w-full py-3 bg-[#a9cecc]/10 text-[#a9cecc] border border-[#a9cecc]/30 hover:bg-[#a9cecc] hover:text-[#050505] transition-all rounded text-[12px] font-bold tracking-widest flex items-center justify-center gap-2" style={{ fontFamily: 'JetBrains Mono' }}>
             <span className="material-symbols-outlined">how_to_vote</span>
             Align Doctrine
           </button>
        </div>
      </div>

      {/* Right Panel: Chat Interface */}
      <div className="flex-1 glass-cell rounded-xl flex flex-col border border-[#444748]/30 overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.5)]">
        {/* Chat Header */}
        <div className="h-16 border-b border-[#444748]/30 flex items-center px-6 justify-between bg-[#0e0e0e]/50">
           <div className="flex items-center gap-3">
              <span className={`w-2 h-2 rounded-full ${uiTheme.bg.replace('/10', '')} animate-pulse-glow`} style={{ backgroundColor: uiTheme.text.replace('text-', '') }}></span>
              <span className="text-[14px] font-bold tracking-widest text-[#e5e2e1]" style={{ fontFamily: 'JetBrains Mono' }}>UPLINK_ACTIVE</span>
           </div>
           <span className="text-[12px] text-[#c4c7c7] opacity-60 font-mono">ENCRYPTED_P2P</span>
        </div>

        {/* Messages Log */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 flex flex-col bg-gradient-to-b from-[#0e0e0e]/30 to-[#141313]/30">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`
                max-w-[80%] rounded-xl px-5 py-4 text-[15px] leading-relaxed relative
                ${msg.role === 'system' ? 'w-full !max-w-full bg-[#201f1f] border border-[#444748]/50 text-[#c4c7c7] font-mono text-[12px] flex items-center gap-3' : ''}
                ${msg.role === 'user' ? 'bg-[#0F3433]/40 border border-[#00F2FF]/30 text-white rounded-tr-sm shadow-[0_0_15px_rgba(0,242,255,0.1)]' : ''}
                ${msg.role === 'prophet' ? `${uiTheme.msgBg} border text-white rounded-tl-sm shadow-[0_4px_20px_rgba(0,0,0,0.3)]` : ''}
              `}>
                {msg.role === 'system' && <span className="material-symbols-outlined text-[16px] text-[#a9cecc]">info</span>}
                {msg.content}
                
                {/* Decorative Tech Corners for Prophet Messages */}
                {msg.role === 'prophet' && (
                  <>
                    <div className={`absolute top-0 left-0 w-2 h-2 border-t border-l ${uiTheme.border}`}></div>
                    <div className={`absolute bottom-0 right-0 w-2 h-2 border-b border-r ${uiTheme.border}`}></div>
                  </>
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className={`${uiTheme.msgBg} border text-[#e5e2e1] px-5 py-4 rounded-xl rounded-tl-sm text-[14px] flex items-center gap-3`}>
                <span className={`material-symbols-outlined animate-spin ${uiTheme.text}`}>sync</span>
                <span style={{ fontFamily: 'JetBrains Mono' }}>Processing query...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-6 border-t border-[#444748]/30 bg-[#0e0e0e]/80">
          <form onSubmit={handleSubmit} className="flex gap-4">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Transmit your message to the network..."
              className="flex-1 bg-[#201f1f] border border-[#444748] text-[#e5e2e1] rounded-lg px-5 py-3.5 focus:outline-none focus:border-[#00F2FF] focus:shadow-[0_0_15px_rgba(0,242,255,0.2)] transition-all text-[15px]"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="px-8 bg-[#00F2FF] text-[#050505] rounded-lg font-bold text-[14px] tracking-widest hover:bg-[#81D4FA] hover:shadow-[0_0_20px_rgba(0,242,255,0.4)] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              style={{ fontFamily: 'JetBrains Mono' }}
            >
              TRANSMIT <span className="material-symbols-outlined text-[18px]">send</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
