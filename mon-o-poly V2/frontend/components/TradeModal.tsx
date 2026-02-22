'use client';

import { useState } from 'react';
import { X } from 'lucide-react';

interface TradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTrade: (amount: string, isYes: boolean) => void;
  isYes: boolean;
  isProcessing: boolean;
}

const QUICK_AMOUNTS = [1, 5, 10, 100];

export default function TradeModal({
  isOpen,
  onClose,
  onTrade,
  isYes,
  isProcessing,
}: TradeModalProps) {
  const [amount, setAmount] = useState('0');

  if (!isOpen) return null;

  const addAmount = (val: number) => {
    setAmount((prev) => String(Number(prev || 0) + val));
  };

  const setMax = () => {
    setAmount('999'); // Placeholder - could integrate wallet balance
  };

  const handleTrade = () => {
    const num = Number(amount);
    if (Number.isFinite(num) && num > 0) {
      onTrade(amount, isYes);
      setAmount('0');
      // Parent closes modal on success
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <div className="relative w-full max-w-sm rounded-2xl bg-[#0E091C] border border-white/10 p-6 mx-4 mb-8 sm:mb-0 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        <h3 className="font-display text-lg font-semibold text-white mb-4">
          {isYes ? 'Buy YES' : 'Buy NO'}
        </h3>

        <div className="space-y-2 mb-4">
          <label className="text-sm font-mono-brand text-white/70">
            Amount
          </label>
          <div className="flex items-center justify-between rounded-xl bg-black/40 border border-white/10 px-4 py-3">
            <span className="font-mono-brand text-white/50">MON</span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="0"
              step="0.01"
              placeholder="0"
              className="flex-1 bg-transparent text-right text-xl font-mono-brand text-white outline-none placeholder:text-white/30"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {QUICK_AMOUNTS.map((val) => (
            <button
              key={val}
              onClick={() => addAmount(val)}
              className="px-4 py-2 rounded-lg bg-white/5 hover:bg-[#6E54FF]/20 border border-white/10 hover:border-[#6E54FF]/50 font-mono-brand text-sm text-white transition-colors"
            >
              +{val}
            </button>
          ))}
          <button
            onClick={setMax}
            className="px-4 py-2 rounded-lg bg-white/5 hover:bg-[#6E54FF]/20 border border-white/10 hover:border-[#6E54FF]/50 font-mono-brand text-sm text-[#6E54FF] transition-colors"
          >
            Max
          </button>
        </div>

        <button
          onClick={handleTrade}
          disabled={isProcessing || !amount || Number(amount) <= 0}
          className="w-full py-4 rounded-xl bg-[#6E54FF] hover:bg-[#7d65ff] disabled:opacity-50 disabled:cursor-not-allowed font-mono-brand font-medium text-white transition-colors"
        >
          {isProcessing ? 'Processing...' : 'Trade'}
        </button>
      </div>
    </div>
  );
}
