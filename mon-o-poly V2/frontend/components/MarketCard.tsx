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
  // Asks sorted high→low (approaching mid from above); all prices must be > 0
  const rawAsks = [
    { price: yesPrice + 0.10, size: 30.00 },
    { price: yesPrice + 0.06, size: 5.00 },
    { price: yesPrice + 0.04, size: 185.00 },
    { price: yesPrice + 0.02, size: 75.00 },
    { price: yesPrice + 0.01, size: 18.57 },
  ]
    .filter((r) => r.price > 0 && r.price < 1)
    .map((r) => ({ ...r, total: r.price * r.size }));

  // Bids sorted high→low; filter out non-positive prices
  const rawBids = [
    { price: yesPrice - 0.01, size: 0.92 },
    { price: yesPrice - 0.02, size: 50.00 },
    { price: yesPrice - 0.04, size: 117.94 },
    { price: yesPrice - 0.06, size: 45.00 },
    { price: yesPrice - 0.08, size: 90.00 },
  ]
    .filter((r) => r.price > 0 && r.price < 1)
    .map((r) => ({ ...r, total: r.price * r.size }));

  const maxAskTotal = rawAsks.length ? Math.max(...rawAsks.map((a) => a.total)) : 1;
  const maxBidTotal = rawBids.length ? Math.max(...rawBids.map((b) => b.total)) : 1;

  const asks = rawAsks.map((r) => ({ ...r, depthPct: (r.total / maxAskTotal) * 80 }));
  const bids = rawBids.map((r) => ({ ...r, depthPct: (r.total / maxBidTotal) * 80 }));

  const spread =
    asks.length && bids.length ? asks[asks.length - 1].price - bids[0].price : 0;
  return { bids, asks, spread };
};

export default function MarketCard({ market }: MarketCardProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('charts');
  const [activeChart, setActiveChart] = useState<'yes' | 'no'>('yes');
  const [chartSwitching, setChartSwitching] = useState(false);
  const [tradeModalOpen, setTradeModalOpen] = useState(false);
  const [pendingIsYes, setPendingIsYes] = useState(true);
  const { authenticated, login } = usePrivy();
  const [isProcessing, setIsProcessing] = useState(false);

  const initialYes = parsePrice(market.outcomePrices?.[0]);
  const initialNo = parsePrice(market.outcomePrices?.[1]);
  const yesTokenId = market.clobTokenIds?.[0];
  const noTokenId = market.clobTokenIds?.[1];

  const { chartData, yesPrice, noPrice, yesBuyPrice, noBuyPrice, isLoading, wsStatus } = usePolymarketPrice(
    yesTokenId,
    noTokenId,
    initialYes,
    initialNo
  );

  const handleChartSwitch = (chart: 'yes' | 'no') => {
    if (chart === activeChart || chartSwitching) return;
    setChartSwitching(true);
    setTimeout(() => {
      setActiveChart(chart);
      setChartSwitching(false);
    }, 600);
  };

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

  const noChartData = chartData.map((p) => ({ time: p.time, value: 1 - p.value }));
  const displayChartData = activeChart === 'yes' ? chartData : noChartData;
  const displayPrice = activeChart === 'yes' ? yesPrice : noPrice;
  const chartColor = activeChart === 'yes' ? '#85E6FF' : '#FF8EE4';

  const [obSide, setObSide] = useState<'yes' | 'no'>('yes');
  const { bids, asks, spread } = mockOrderbook(yesPrice);

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
          {/* Live / polling status indicator */}
          <div className="ml-auto flex items-center gap-1.5 font-mono-brand text-[10px] text-white/40">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                wsStatus === 'connected'
                  ? 'bg-[#85E6FF] shadow-[0_0_4px_#85E6FF]'
                  : wsStatus === 'connecting'
                  ? 'bg-yellow-400 animate-pulse'
                  : 'bg-white/20'
              }`}
            />
            {wsStatus === 'connected' ? 'LIVE' : wsStatus === 'connecting' ? 'CONNECTING' : 'POLLING'}
          </div>
        </div>

        <div className="flex-1 rounded-xl border border-white/10 bg-black/30 overflow-hidden min-h-[200px]">
          {viewMode === 'charts' ? (
            <div className="relative w-full h-full">
              {/* Custom percentage display — top-left */}
              <div className="absolute top-3 left-4 z-10 flex flex-col gap-0.5">
                <span
                  className="font-mono-brand font-bold leading-none tabular-nums"
                  style={{ fontSize: '2.25rem', color: chartColor }}
                >
                  {(displayPrice * 100).toFixed(0)}%
                </span>
                <span className="font-mono-brand text-xs text-white/40 uppercase tracking-widest">
                  {activeChart === 'yes' ? 'YES' : 'NO'} chance
                </span>
              </div>

              {/* YES / NO toggle — top-right */}
              <div className="absolute top-3 right-3 z-10 flex rounded-full bg-white/5 border border-white/10 p-0.5 gap-0.5">
                <button
                  onClick={() => handleChartSwitch('yes')}
                  className={`px-4 py-1.5 rounded-full font-mono-brand text-sm font-semibold transition-all duration-200 ${
                    activeChart === 'yes'
                      ? 'bg-[#85E6FF]/20 text-[#85E6FF] border border-[#85E6FF]/50'
                      : 'text-white/40 hover:text-white/70'
                  }`}
                >
                  YES
                </button>
                <button
                  onClick={() => handleChartSwitch('no')}
                  className={`px-4 py-1.5 rounded-full font-mono-brand text-sm font-semibold transition-all duration-200 ${
                    activeChart === 'no'
                      ? 'bg-[#FF8EE4]/20 text-[#FF8EE4] border border-[#FF8EE4]/50'
                      : 'text-white/40 hover:text-white/70'
                  }`}
                >
                  NO
                </button>
              </div>

              {isLoading ? (
                <div className="h-[300px] flex items-center justify-center text-white/40 font-mono-brand text-sm">
                  Loading chart...
                </div>
              ) : displayChartData.length > 0 && Number.isFinite(displayPrice) ? (
                <div className="liveline-chart w-full" style={{ height: 300, paddingTop: '72px' }}>
                  <Liveline
                    data={displayChartData}
                    value={displayPrice}
                    color={chartColor}
                    loading={chartSwitching}
                    formatValue={(v) => `${(v * 100).toFixed(0)}%`}
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
              )}
            </div>
          ) : (
            <div className="h-full flex flex-col overflow-hidden">
              {/* Header */}
              <div className="flex items-center px-3 py-2 border-b border-white/10 shrink-0">
                <button
                  onClick={() => setObSide(obSide === 'yes' ? 'no' : 'yes')}
                  className="flex items-center gap-1.5 font-mono-brand text-xs font-semibold text-white/80 hover:text-white transition-colors mr-auto"
                >
                  TRADE {obSide === 'yes' ? 'YES' : 'NO'}
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="opacity-50">
                    <path d="M6 2L6 10M3 4.5L6 2L9 4.5M3 7.5L6 10L9 7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                <div className="grid grid-cols-3 w-[62%] text-right">
                  <span className="font-mono-brand text-[10px] text-white/40 uppercase tracking-wider">Price</span>
                  <span className="font-mono-brand text-[10px] text-white/40 uppercase tracking-wider">Shares</span>
                  <span className="font-mono-brand text-[10px] text-white/40 uppercase tracking-wider">Total</span>
                </div>
              </div>

              {/* Asks — independent scroll, rows anchor to bottom */}
              <div className="flex-1 overflow-y-auto flex flex-col justify-end min-h-0">
                {asks.map((row, i) => (
                  <div key={`ask-${i}`} className="relative flex items-center px-3 py-[7px] shrink-0">
                    {/* depth bar — absolute so it never affects column alignment */}
                    <div
                      className="absolute left-0 top-0 bottom-0 bg-[#FF8EE4]/10"
                      style={{ width: `${row.depthPct}%` }}
                    />
                    {/* badge — absolute so it never shifts the grid */}
                    {i === asks.length - 1 && (
                      <span className="absolute left-3 z-20 bg-[#FF8EE4] text-[#0E091C] text-[9px] font-bold px-1.5 py-0.5 rounded">
                        Asks
                      </span>
                    )}
                    {/* grid always the same width on every row */}
                    <div className="grid grid-cols-3 text-right z-10 w-[62%] ml-auto relative">
                      <span className="font-mono-brand text-sm text-[#FF8EE4]">
                        {(row.price * 100).toFixed(1)}¢
                      </span>
                      <span className="font-mono-brand text-sm text-white/70">
                        {row.size.toFixed(2)}
                      </span>
                      <span className="font-mono-brand text-sm text-white/70">
                        ${row.total.toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Spread — always visible, pinned between the two halves */}
              <div className="flex items-center justify-between px-3 py-2 border-y border-white/10 shrink-0">
                <span className="font-mono-brand text-xs text-white/50">
                  Last: {(yesPrice * 100).toFixed(1)}¢
                </span>
                <span className="font-mono-brand text-xs text-white/50">
                  Spread: {(spread * 100).toFixed(1)}¢
                </span>
              </div>

              {/* Bids — independent scroll */}
              <div className="flex-1 overflow-y-auto min-h-0">
                {bids.map((row, i) => (
                  <div key={`bid-${i}`} className="relative flex items-center px-3 py-[7px] shrink-0">
                    {/* depth bar — absolute */}
                    <div
                      className="absolute left-0 top-0 bottom-0 bg-[#85E6FF]/10"
                      style={{ width: `${row.depthPct}%` }}
                    />
                    {/* badge — absolute */}
                    {i === 0 && (
                      <span className="absolute left-3 z-20 bg-[#85E6FF] text-[#0E091C] text-[9px] font-bold px-1.5 py-0.5 rounded">
                        Bids
                      </span>
                    )}
                    {/* grid always the same width on every row */}
                    <div className="grid grid-cols-3 text-right z-10 w-[62%] ml-auto relative">
                      <span className="font-mono-brand text-sm text-[#85E6FF]">
                        {(row.price * 100).toFixed(1)}¢
                      </span>
                      <span className="font-mono-brand text-sm text-white/70">
                        {row.size.toFixed(2)}
                      </span>
                      <span className="font-mono-brand text-sm text-white/70">
                        ${row.total.toFixed(2)}
                      </span>
                    </div>
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
            YES {(Number.isFinite(yesBuyPrice) ? yesBuyPrice * 100 : 50).toFixed(0)}¢
          </button>
          <button
            onClick={() => handleYesNoClick(false)}
            className="py-4 rounded-xl bg-[#FF8EE4]/20 hover:bg-[#FF8EE4]/30 border border-[#FF8EE4]/50 font-mono-brand font-semibold text-[#FF8EE4] transition-colors"
          >
            NO {(Number.isFinite(noBuyPrice) ? noBuyPrice * 100 : 50).toFixed(0)}¢
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
