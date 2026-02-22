"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import PixelCanvas from "~~/components/PixelCanvas";
import EngineDashboard from "~~/components/EngineDashboard";
import TxPipeline from "~~/components/TxPipeline";
import FundBurner from "~~/components/FundBurner";
import type { TxItem } from "~~/components/PixelCanvas";
import type { NextPage } from "next";

const Home: NextPage = () => {
  const [collisionPixels, setCollisionPixels] = useState<Set<number>>(new Set());
  const [cleanCount, setCleanCount] = useState(0);
  const [collisionCount, setCollisionCount] = useState(0);
  const [transactions, setTransactions] = useState<TxItem[]>([]);
  const collisionTimers = useRef<Map<number, NodeJS.Timeout>>(new Map());

  const handleCollision = useCallback((pixelId: number) => {
    setCollisionPixels(prev => {
      const next = new Set(prev);
      next.add(pixelId);
      return next;
    });

    const existing = collisionTimers.current.get(pixelId);
    if (existing) clearTimeout(existing);

    const timer = setTimeout(() => {
      setCollisionPixels(prev => {
        const next = new Set(prev);
        next.delete(pixelId);
        return next;
      });
      collisionTimers.current.delete(pixelId);
    }, 1000);

    collisionTimers.current.set(pixelId, timer);
  }, []);

  // Only counted from on-chain events (not optimistic clicks)
  const handleCleanTx = useCallback(() => {
    setCleanCount(prev => prev + 1);
  }, []);

  const handleCollisionTx = useCallback(() => {
    setCollisionCount(prev => prev + 1);
  }, []);

  const handleTxStageChange = useCallback((tx: TxItem) => {
    // Stage weights to prevent backward transitions caused by fast WebSocket events
    const stageWeight: Record<string, number> = {
      "pending": 0,
      "confirmed": 1,
      "parallel": 2,
      "collision": 2,
      "failed": 2
    };

    setTransactions(prev => {
      const existing = prev.findIndex(t => t.id === tx.id);
      if (existing >= 0) {
        const currentTx = prev[existing];
        // Prevent downgrade from parallel/collision/failed back to confirmed
        if (stageWeight[tx.stage] < stageWeight[currentTx.stage]) {
          return prev;
        }
        const updated = [...prev];
        updated[existing] = tx;
        return updated;
      }
      return [...prev, tx].slice(-20);
    });
  }, []);

  useEffect(() => {
    return () => {
      collisionTimers.current.forEach(timer => clearTimeout(timer));
    };
  }, []);

  return (
    <div className="state-clash-container">
      {/* Hero */}
      <div className="hero-section">
        <div className="hero-badge">MONAD TESTNET • LIVE</div>
        <h1 className="hero-title">
          State<span className="hero-title-accent">Clash</span>
        </h1>
        <p className="hero-subtitle">
          A collaborative pixel canvas visualizing Monad&apos;s Optimistic Parallel EVM.
          <br />
          <span className="hero-hint">Click any pixel to paint — watch the execution engine react in real-time.</span>
        </p>
      </div>

      {/* Fund Burner Wallet Banner */}
      <FundBurner />

      {/* Canvas */}
      <PixelCanvas
        collisionPixels={collisionPixels}
        onCollision={handleCollision}
        onCleanTx={handleCleanTx}
        onCollisionTx={handleCollisionTx}
        onTxStageChange={handleTxStageChange}
      />

      {/* Transaction Pipeline */}
      <TxPipeline transactions={transactions} />

      {/* Engine Dashboard */}
      <EngineDashboard cleanCount={cleanCount} collisionCount={collisionCount} />
    </div>
  );
};

export default Home;
