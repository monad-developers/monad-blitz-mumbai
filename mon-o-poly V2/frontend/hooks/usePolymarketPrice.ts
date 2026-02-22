import { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
const WS_URL = 'wss://ws-subscriptions-clob.polymarket.com/ws/market';
const POLL_INTERVAL_MS = 30_000;

export interface PricePoint {
  time: number;
  value: number;
}

export type WsStatus = 'connecting' | 'connected' | 'disconnected';

export function usePolymarketPrice(
  yesTokenId: string | undefined,
  noTokenId: string | undefined,
  initialYesPrice: number,
  initialNoPrice: number
) {
  const [chartData, setChartData] = useState<PricePoint[]>([]);
  // Mid prices — used for the % chance chart display
  const [yesPrice, setYesPrice] = useState(initialYesPrice);
  const [noPrice, setNoPrice] = useState(initialNoPrice);
  // Ask prices — what you actually pay to buy (shown on buttons)
  const [yesBuyPrice, setYesBuyPrice] = useState(initialYesPrice);
  const [noBuyPrice, setNoBuyPrice] = useState(initialNoPrice);
  const [isLoading, setIsLoading] = useState(true);
  const [wsStatus, setWsStatus] = useState<WsStatus>('disconnected');

  const wsRef = useRef<WebSocket | null>(null);
  const pingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── helpers ─────────────────────────────────────────────────────────────────

  const applyYesPrice = useCallback((mid: number) => {
    setYesPrice(mid);
    setChartData((prev) => {
      const next = [...prev, { time: Date.now() / 1000, value: mid }];
      return next.slice(-500);
    });
  }, []);

  // ── mock fallback ────────────────────────────────────────────────────────────

  const mockData = useCallback(() => {
    const nowSec = Date.now() / 1000;
    const fallback: PricePoint[] = [];
    for (let i = 1440; i >= 0; i--) {
      fallback.push({
        time: nowSec - i * 60,
        value: Math.max(0, Math.min(1, initialYesPrice + (Math.random() - 0.5) * 0.06)),
      });
    }
    fallback[fallback.length - 1].value = initialYesPrice;
    setChartData(fallback);
    setIsLoading(false);
  }, [initialYesPrice]);

  // ── historical price fetch ───────────────────────────────────────────────────

  const fetchHistory = useCallback(async () => {
    if (!yesTokenId) {
      mockData();
      return;
    }
    try {
      const res = await axios.get<{ t: number; p: number }[]>(
        `${BACKEND_URL}/api/markets/${yesTokenId}/price-history`,
        { params: { interval: 'max', fidelity: 1 } }
      );
      const data = res.data;
      if (Array.isArray(data) && data.length > 0) {
        const points: PricePoint[] = data
          .map((d) => ({
            time: typeof d.t === 'number' ? d.t : parseFloat(String(d.t)),
            value: typeof d.p === 'number' ? d.p : parseFloat(String(d.p)),
          }))
          .filter((p) => Number.isFinite(p.value) && p.value >= 0 && p.value <= 1)
          .sort((a, b) => a.time - b.time);
        if (points.length > 0) {
          setChartData(points);
          setYesPrice(points[points.length - 1].value);
          setNoPrice(1 - points[points.length - 1].value);
        } else {
          mockData();
        }
      } else {
        mockData();
      }
    } catch (err) {
      console.warn('[usePolymarketPrice] price-history fetch failed, using fallback:', err);
      mockData();
    } finally {
      setIsLoading(false);
    }
  }, [yesTokenId, mockData]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  // ── REST polling fallback (every 30 s) ──────────────────────────────────────
  // Polls YES mid (for chart), NO mid, and ask prices for both tokens.

  useEffect(() => {
    if (!yesTokenId) return;

    const poll = async () => {
      try {
        const [yesMidRes, noMidRes, yesBuyRes, noBuyRes] = await Promise.allSettled([
          axios.get<{ mid: string }>(`${BACKEND_URL}/api/markets/${yesTokenId}/midpoint`, { timeout: 6000 }),
          noTokenId
            ? axios.get<{ mid: string }>(`${BACKEND_URL}/api/markets/${noTokenId}/midpoint`, { timeout: 6000 })
            : Promise.reject('no noTokenId'),
          axios.get<{ price: string }>(`${BACKEND_URL}/api/markets/${yesTokenId}/best-price?side=BUY`, { timeout: 6000 }),
          noTokenId
            ? axios.get<{ price: string }>(`${BACKEND_URL}/api/markets/${noTokenId}/best-price?side=BUY`, { timeout: 6000 })
            : Promise.reject('no noTokenId'),
        ]);

        if (yesMidRes.status === 'fulfilled') {
          const mid = parseFloat(yesMidRes.value.data?.mid ?? '');
          if (Number.isFinite(mid) && mid > 0 && mid < 1) {
            applyYesPrice(mid);
          }
        }

        if (noMidRes.status === 'fulfilled') {
          const mid = parseFloat((noMidRes.value as { data: { mid: string } }).data?.mid ?? '');
          if (Number.isFinite(mid) && mid > 0 && mid < 1) {
            setNoPrice(mid);
          }
        }

        if (yesBuyRes.status === 'fulfilled') {
          const ask = parseFloat((yesBuyRes.value as { data: { price: string } }).data?.price ?? '');
          if (Number.isFinite(ask) && ask > 0 && ask <= 1) {
            setYesBuyPrice(ask);
          }
        }

        if (noBuyRes.status === 'fulfilled') {
          const ask = parseFloat((noBuyRes.value as { data: { price: string } }).data?.price ?? '');
          if (Number.isFinite(ask) && ask > 0 && ask <= 1) {
            setNoBuyPrice(ask);
          }
        }
      } catch (e) {
        console.warn('[usePolymarketPrice] poll failed:', e);
      }
    };

    poll();
    const id = setInterval(poll, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [yesTokenId, noTokenId, applyYesPrice]);

  // ── WebSocket live updates ───────────────────────────────────────────────────

  useEffect(() => {
    if (!yesTokenId || typeof window === 'undefined') return;

    const tokenIds = [yesTokenId, ...(noTokenId ? [noTokenId] : [])];
    let destroyed = false;

    const connect = () => {
      if (destroyed) return;
      setWsStatus('connecting');
      console.log('[usePolymarketPrice] WS connecting…');

      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('[usePolymarketPrice] WS connected, subscribing to', tokenIds);
        setWsStatus('connected');
        // Send subscription — no extra fields, just what Polymarket expects
        ws.send(
          JSON.stringify({
            assets_ids: tokenIds,
            type: 'market',
          })
        );
        pingIntervalRef.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) ws.send('PING');
        }, 10_000);
      };

      ws.onmessage = (event) => {
        if (event.data === 'PONG') return;
        try {
          const msg = JSON.parse(event.data as string);

          if (msg.event_type === 'price_change' && Array.isArray(msg.price_changes)) {
            for (const ch of msg.price_changes) {
              const assetId: string | undefined = ch.asset_id;
              const isYes = assetId === yesTokenId;
              const isNo = assetId === noTokenId;
              if (!isYes && !isNo) continue;

              const bid = ch.best_bid != null ? parseFloat(ch.best_bid) : NaN;
              const ask = ch.best_ask != null ? parseFloat(ch.best_ask) : NaN;
              const mid =
                Number.isFinite(bid) && Number.isFinite(ask)
                  ? (bid + ask) / 2
                  : Number.isFinite(bid)
                  ? bid
                  : Number.isFinite(ask)
                  ? ask
                  : NaN;

              if (isYes) {
                if (Number.isFinite(mid) && mid > 0 && mid < 1) applyYesPrice(mid);
                if (Number.isFinite(ask) && ask > 0 && ask <= 1) setYesBuyPrice(ask);
              } else {
                if (Number.isFinite(mid) && mid > 0 && mid < 1) setNoPrice(mid);
                if (Number.isFinite(ask) && ask > 0 && ask <= 1) setNoBuyPrice(ask);
              }
            }
          } else if (msg.event_type === 'last_trade_price' && msg.price != null) {
            const assetId: string | undefined = msg.asset_id;
            const isYes = !assetId || assetId === yesTokenId;
            const isNo = assetId === noTokenId;
            if (!isYes && !isNo) return;

            const p = parseFloat(msg.price);
            if (Number.isFinite(p) && p > 0 && p < 1) {
              if (isYes) applyYesPrice(p);
              else setNoPrice(p);
            }
          } else if (msg.event_type === 'book') {
            const assetId: string | undefined = msg.asset_id;
            const isYes = !assetId || assetId === yesTokenId;
            const isNo = assetId === noTokenId;
            if (!isYes && !isNo) return;

            const bids: { price: string; size: string }[] = msg.bids ?? [];
            const asks: { price: string; size: string }[] = msg.asks ?? [];
            // bids sorted high→low, asks sorted low→high
            const bestBid = bids.length ? parseFloat(bids[0].price ?? bids[0]) : NaN;
            const bestAsk = asks.length ? parseFloat(asks[0].price ?? asks[0]) : NaN;
            const mid =
              Number.isFinite(bestBid) && Number.isFinite(bestAsk)
                ? (bestBid + bestAsk) / 2
                : Number.isFinite(bestBid)
                ? bestBid
                : bestAsk;

            if (isYes) {
              if (Number.isFinite(mid) && mid > 0 && mid < 1) applyYesPrice(mid);
              if (Number.isFinite(bestAsk) && bestAsk > 0 && bestAsk <= 1) setYesBuyPrice(bestAsk);
            } else {
              if (Number.isFinite(mid) && mid > 0 && mid < 1) setNoPrice(mid);
              if (Number.isFinite(bestAsk) && bestAsk > 0 && bestAsk <= 1) setNoBuyPrice(bestAsk);
            }
          }
        } catch {
          /* ignore parse errors */
        }
      };

      ws.onerror = (e) => {
        console.warn('[usePolymarketPrice] WS error:', e);
        ws.close();
      };

      ws.onclose = () => {
        setWsStatus('disconnected');
        if (pingIntervalRef.current) {
          clearInterval(pingIntervalRef.current);
          pingIntervalRef.current = null;
        }
        wsRef.current = null;
        if (!destroyed) {
          console.log('[usePolymarketPrice] WS closed, reconnecting in 5 s…');
          setTimeout(connect, 5_000);
        }
      };
    };

    connect();

    return () => {
      destroyed = true;
      if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
      if (wsRef.current) wsRef.current.close();
      wsRef.current = null;
    };
  }, [yesTokenId, noTokenId, applyYesPrice]);

  return { chartData, yesPrice, noPrice, yesBuyPrice, noBuyPrice, isLoading, wsStatus };
}
