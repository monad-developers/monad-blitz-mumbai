'use client';

import { useState } from 'react';
import { Liveline } from 'liveline';
import { BarChart3, BookOpen } from 'lucide-react';
import { Market } from '@/types/market';
import { usePrivy } from '@privy-io/react-auth';
import { createWalletClient, custom, parseEther } from 'viem';
import { MONAD_CHAIN, CONTRACT_ADDRESS, ABI } from '@/lib/monad';
import TradeModal from './TradeModal';
import { usePolymarketPrice } from '@/hooks/usePolymarketPrice';

interface MarketCardProps {
  market: Market;
}

type ViewMode = 'charts' | 'orderbook';

const parsePrice = (val: string | undefined): number => {
  const n = val != null ? parseFloat(val) : NaN;
  return Number.isFinite(n) ? n : 0.5;
};

const mockOrderbook = (yesPrice: number) => {
  const bids = [
    { price: yesPrice - 0.02, size: 120 },
    { price: yesPrice - 0.04, size: 85 },
    { price: yesPrice - 0.06, size: 200 },
    { price: yesPrice - 0.08, size: 45 },
    { price: yesPrice - 0.10, size: 90 },
  ];
  const asks = [
    { price: yesPrice + 0.02, size: 75 },
    { price: yesPrice + 0.04, size: 150 },
    { price: yesPrice + 0.06, size: 60 },
    { price: yesPrice + 0.08, size: 110 },
    { price: yesPrice + 0.10, size: 40 },
  ];
  return { bids, asks };
};

export default function MarketCard({ market }: MarketCardProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('charts');
  const [tradeModalOpen, setTradeModalOpen] = useState(false);
  const [pendingIsYes, setPendingIsYes] = useState(true);
  const { authenticated, login } = usePrivy();
  const [isProcessing, setIsProcessing] = useState(false);

  const initialYes = parsePrice(market.outcomePrices?.[0]);
  const initialNo = parsePrice(market.outcomePrices?.[1]);
  const yesTokenId = market.clobTokenIds?.[0];

  const { chartData, yesPrice, noPrice, isLoading } = usePolymarketPrice(
    yesTokenId,
    initialYes,
    initialNo
  );

  const handleYesNoClick = (isYes: boolean) => {
    if (!authenticated) {
      login();
      return;
    }
    setPendingIsYes(isYes);
    setTradeModalOpen(true);
  };

  const handleTrade = async (amount: string, isYes: boolean) => {
    if (!amount || isProcessing) return;

    try {
      setIsProcessing(true);
      if (!window.ethereum) {
        alert('No wallet found!');
        return;
      }

      const walletClient = createWalletClient({
        chain: MONAD_CHAIN as any,
        transport: custom(window.ethereum!),
      });

      const [address] = await walletClient.requestAddresses();

      try {
        await walletClient.switchChain({ id: MONAD_CHAIN.id });
      } catch (e) {
        console.error('Error switching chain', e);
      }

      const hash = await walletClient.writeContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: ABI,
        functionName: 'buyShares',
        args: [BigInt(market.id || 0), isYes],
        value: parseEther(amount),
        account: address,
      });

      console.log('Transaction sent:', hash);
      alert(`Transaction sent! Hash: ${hash}`);
      setTradeModalOpen(false);
    } catch (error) {
      console.error('Transaction failed:', error);
      alert('Transaction failed. Check console.');
    } finally {
      setIsProcessing(false);
    }
  };

  const { bids, asks } = mockOrderbook(yesPrice);

  return (
    <div className="h-screen w-full snap-start flex flex-col bg-[#0E091C] text-white pt-16">
      {/* Market Name */}
      <div className="px-4 pt-4 pb-3">
        <h2 className="font-display text-xl font-semibold leading-tight text-white">
          {market.question}
        </h2>
      </div>

      {/* View Toggle + Content Area */}
      <div className="flex-1 flex flex-col min-h-0 px-4">
        <div className="flex items-center gap-2 mb-3">
          <button
            onClick={() => setViewMode('charts')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono-brand text-sm transition-colors ${
              viewMode === 'charts'
                ? 'bg-[#6E54FF] text-white'
                : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10 border border-white/10'
            }`}
          >
            <BarChart3 size={16} />
            Charts
          </button>
          <button
            onClick={() => setViewMode('orderbook')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono-brand text-sm transition-colors ${
              viewMode === 'orderbook'
                ? 'bg-[#6E54FF] text-white'
                : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10 border border-white/10'
            }`}
          >
            <BookOpen size={16} />
            Orderbook
          </button>
        </div>

        <div className="flex-1 rounded-xl border border-white/10 bg-black/30 overflow-hidden min-h-[200px]">
          {viewMode === 'charts' ? (
            isLoading ? (
              <div className="h-[300px] flex items-center justify-center text-white/40 font-mono-brand text-sm">
                Loading chart...
              </div>
            ) : chartData.length > 0 && Number.isFinite(yesPrice) ? (
              <div className="w-full" style={{ height: 300 }}>
                <Liveline
                  data={chartData}
                  value={yesPrice}
                  color={yesPrice > 0.5 ? '#85E6FF' : '#FF8EE4'}
                  formatValue={(v) => `${(v * 100).toFixed(0)}%`}
                  showValue
                  valueMomentumColor
                  exaggerate
                  referenceLine={{ value: 0.5, label: '50%' }}
                  windows={[
                    { label: '1h', secs: 3600 },
                    { label: '6h', secs: 21600 },
                    { label: '1d', secs: 86400 },
                  ]}
                  windowStyle="rounded"
                  badgeVariant="minimal"
                  emptyText="No price data"
                />
              </div>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-white/40 font-mono-brand text-sm">
                No chart data
              </div>
            )
          ) : (
            <div className="h-full overflow-y-auto p-4">
              <div className="space-y-1 mb-4">
                <div className="font-mono-brand text-xs text-white/50 uppercase tracking-wider mb-2">
                  Asks
                </div>
                {asks.map((row, i) => (
                  <div
                    key={`ask-${i}`}
                    className="flex justify-between text-sm font-mono-brand"
                  >
                    <span className="text-[#FF8EE4]">{(row.price * 100).toFixed(1)}¢</span>
                    <span className="text-white/70">{row.size}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-white/10 py-2 my-2">
                <div className="flex justify-between font-mono-brand font-medium text-[#6E54FF]">
                  <span>{(yesPrice * 100).toFixed(1)}¢</span>
                  <span>YES</span>
                </div>
              </div>
              <div className="space-y-1">
                <div className="font-mono-brand text-xs text-white/50 uppercase tracking-wider mb-2">
                  Bids
                </div>
                {bids.map((row, i) => (
                  <div
                    key={`bid-${i}`}
                    className="flex justify-between text-sm font-mono-brand"
                  >
                    <span className="text-[#85E6FF]">{(row.price * 100).toFixed(1)}¢</span>
                    <span className="text-white/70">{row.size}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* YES / NO Buttons */}
      <div className="mt-auto p-4 pb-6 bg-gradient-to-t from-[#0E091C] via-[#0E091C]/80 to-transparent">
        <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
          <button
            onClick={() => handleYesNoClick(true)}
            className="py-4 rounded-xl bg-[#85E6FF]/20 hover:bg-[#85E6FF]/30 border border-[#85E6FF]/50 font-mono-brand font-semibold text-[#85E6FF] transition-colors"
          >
            YES {(Number.isFinite(yesPrice) ? yesPrice * 100 : 50).toFixed(0)}¢
          </button>
          <button
            onClick={() => handleYesNoClick(false)}
            className="py-4 rounded-xl bg-[#FF8EE4]/20 hover:bg-[#FF8EE4]/30 border border-[#FF8EE4]/50 font-mono-brand font-semibold text-[#FF8EE4] transition-colors"
          >
            NO {(Number.isFinite(noPrice) ? noPrice * 100 : 50).toFixed(0)}¢
          </button>
        </div>
      </div>

      <TradeModal
        isOpen={tradeModalOpen}
        onClose={() => setTradeModalOpen(false)}
        onTrade={handleTrade}
        isYes={pendingIsYes}
        isProcessing={isProcessing}
      />
    </div>
  );
}
