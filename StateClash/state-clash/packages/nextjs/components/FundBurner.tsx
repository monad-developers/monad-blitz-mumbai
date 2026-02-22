"use client";

import { useState, useEffect } from "react";
import { useAccount, useBalance } from "wagmi";
import { formatEther } from "viem";

export default function FundBurner() {
  const { address } = useAccount();
  const { data: balance, refetch } = useBalance({ address });
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => refetch(), 10000);
    return () => clearInterval(interval);
  }, [refetch]);

  const balanceValue = balance ? parseFloat(formatEther(balance.value)) : 0;
  const isFunded = balanceValue > 0.01;

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (isFunded) return null;

  return (
    <div className="fund-burner">
      <div className="fund-burner-inner">
        <div className="fund-icon">💰</div>
        <div className="fund-content">
          <p className="fund-title">Fund Your Burner Wallet to Paint</p>
          <p className="fund-desc">
            Balance: <strong>{balanceValue.toFixed(4)} MON</strong> — send MON to this address from MetaMask or a faucet
          </p>
          <div className="fund-address">
            <code>{address}</code>
            <button className="fund-copy-btn" onClick={copyAddress}>
              {copied ? "✓ Copied!" : "📋 Copy Address"}
            </button>
          </div>
          <p className="fund-hint">Open MetaMask → Send → paste the address above → send 1 MON</p>
        </div>
      </div>
    </div>
  );
}
