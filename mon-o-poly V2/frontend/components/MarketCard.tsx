'use client';

import { useState, useEffect } from 'react';
import { Liveline } from 'liveline';
import { Market } from '@/types/market';
import { usePrivy } from '@privy-io/react-auth';
import { createWalletClient, custom, parseEther } from 'viem';
import { MONAD_CHAIN, CONTRACT_ADDRESS, ABI } from '@/lib/monad';

interface MarketCardProps {
  market: Market;
}

export default function MarketCard({ market }: MarketCardProps) {
  const [amount, setAmount] = useState('');
  const { authenticated, login, user } = usePrivy();
  const [isProcessing, setIsProcessing] = useState(false);

  // Parse prices safely
  const yesPrice = market.outcomePrices?.[0] ? parseFloat(market.outcomePrices[0]) : 0.5;
  const noPrice = market.outcomePrices?.[1] ? parseFloat(market.outcomePrices[1]) : 0.5;

  // Mock data for the chart
  const [chartData, setChartData] = useState<{ time: number; value: number }[]>([]);
  
  useEffect(() => {
    const now = Date.now();
    const history = [];
    let price = yesPrice;
    for (let i = 50; i >= 0; i--) {
      history.push({
        time: now - i * 1000,
        value: Math.max(0, Math.min(1, price + (Math.random() - 0.5) * 0.1))
      });
    }
    history[history.length - 1].value = yesPrice;
    setChartData(history);
  }, [yesPrice]);

  const handleBuy = async (isYes: boolean) => {
    if (!authenticated) {
      login();
      return;
    }
    
    if (!amount || isProcessing) return;

    try {
      setIsProcessing(true);
      if (!window.ethereum) {
        alert("No wallet found!");
        return;
      }

      const walletClient = createWalletClient({
        chain: MONAD_CHAIN as any,
        transport: custom(window.ethereum!)
      });

      const [address] = await walletClient.requestAddresses();
      
      try {
        await walletClient.switchChain({ id: MONAD_CHAIN.id });
      } catch (e) {
        console.error('Error switching chain', e);
        // Might need to add chain
      }

      const hash = await walletClient.writeContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: ABI,
        functionName: 'buyShares',
        args: [BigInt(market.id || 0), isYes], 
        value: parseEther(amount),
        account: address
      });

      console.log('Transaction sent:', hash);
      alert(`Transaction sent! Hash: ${hash}`);
      setAmount('');
    } catch (error) {
      console.error('Transaction failed:', error);
      alert('Transaction failed. Check console.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="h-screen w-full snap-start flex flex-col justify-end p-4 relative overflow-hidden bg-black text-white">
        {/* Background Chart */}
        <div className="absolute inset-0 z-0 opacity-40 pointer-events-none">
            {chartData.length > 0 && (
                 <Liveline 
                    data={chartData} 
                    value={yesPrice} 
                    // @ts-ignore: Liveline types might mismatch if color prop expects strict type
                    color={yesPrice > 0.5 ? '#10b981' : '#ef4444'}
                 />
            )}
        </div>

        {/* Content Overlay */}
        <div className="z-10 w-full max-w-md mx-auto mb-20 space-y-4">
            <div className="flex items-start gap-4">
                {market.image && (
                    <img src={market.image} alt="Market Icon" className="w-16 h-16 rounded-lg object-cover bg-gray-800" />
                )}
                <h2 className="text-2xl font-bold leading-tight drop-shadow-lg shadow-black">
                    {market.question}
                </h2>
            </div>
            
            <p className="text-gray-300 text-sm line-clamp-3 drop-shadow-md bg-black/20 p-2 rounded">
                {market.description}
            </p>

            <div className="flex justify-between text-lg font-mono font-bold bg-black/40 p-2 rounded-lg">
                <div className="text-green-400">YES: {(yesPrice * 100).toFixed(1)}%</div>
                <div className="text-red-400">NO: {(noPrice * 100).toFixed(1)}%</div>
            </div>

            <div className="flex flex-col gap-2 bg-black/60 p-4 rounded-xl backdrop-blur-md border border-white/10">
                <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Amount in MON"
                    className="w-full bg-transparent border-b border-white/20 p-2 outline-none focus:border-white transition-colors text-right font-mono text-lg"
                />
                <div className="grid grid-cols-2 gap-3">
                    <button
                        onClick={() => handleBuy(true)}
                        disabled={isProcessing}
                        className="bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white font-bold py-3 rounded-lg transition-all active:scale-95 shadow-lg shadow-green-900/50"
                    >
                        Buy YES
                    </button>
                    <button
                        onClick={() => handleBuy(false)}
                        disabled={isProcessing}
                        className="bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-bold py-3 rounded-lg transition-all active:scale-95 shadow-lg shadow-red-900/50"
                    >
                        Buy NO
                    </button>
                </div>
            </div>
        </div>
    </div>
  );
}
