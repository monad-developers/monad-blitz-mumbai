import { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
const WS_URL = 'wss://ws-subscriptions-clob.polymarket.com/ws/market';

export interface PricePoint {
  time: number;
  value: number;
}

export function usePolymarketPrice(
  yesTokenId: string | undefined,
  initialYesPrice: number,
  initialNoPrice: number
) {
  const [chartData, setChartData] = useState<PricePoint[]>([]);
  const [yesPrice, setYesPrice] = useState(initialYesPrice);
  const [noPrice, setNoPrice] = useState(initialNoPrice);
  const [isLoading, setIsLoading] = useState(true);
  const wsRef = useRef<WebSocket | null>(null);
  const pingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Fallback mock data when no API/token available — 1-minute points over last 24h
  // Liveline expects time in Unix seconds
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

  // Fetch historical prices
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
        // Liveline expects time in Unix seconds; backend returns seconds already
        const points: PricePoint[] = data.map((d) => ({
          time: typeof d.t === 'number' ? d.t : parseFloat(String(d.t)),
          value: typeof d.p === 'number' ? d.p : parseFloat(String(d.p)),
        })).filter((p) => Number.isFinite(p.value) && p.value >= 0 && p.value <= 1)
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
      console.warn('Price history fetch failed, using fallback:', err);
      mockData();
    } finally {
      setIsLoading(false);
    }
  }, [yesTokenId, initialYesPrice, mockData]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  // WebSocket for live price updates
  useEffect(() => {
    if (!yesTokenId || typeof window === 'undefined') return;

    const connect = () => {
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        ws.send(JSON.stringify({
          assets_ids: [yesTokenId],
          type: 'market',
          custom_feature_enabled: true,
        }));
        pingIntervalRef.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) ws.send('PING');
        }, 10000);
      };

      ws.onmessage = (event) => {
        if (event.data === 'PONG') return;
        try {
          const msg = JSON.parse(event.data);
          if (msg.event_type === 'price_change' && msg.price_changes) {
            for (const ch of msg.price_changes) {
              const bid = ch.best_bid != null ? parseFloat(ch.best_bid) : NaN;
              const ask = ch.best_ask != null ? parseFloat(ch.best_ask) : NaN;
              const mid = Number.isFinite(bid) && Number.isFinite(ask)
                ? (bid + ask) / 2
                : Number.isFinite(bid) ? bid : Number.isFinite(ask) ? ask : NaN;
              if (Number.isFinite(mid) && mid >= 0 && mid <= 1) {
                setYesPrice(mid);
                setNoPrice(1 - mid);
                setChartData((prev) => {
                  const next = [...prev, { time: Date.now() / 1000, value: mid }];
                  return next.slice(-200);
                });
              }
            }
          } else if (msg.event_type === 'last_trade_price' && msg.price != null) {
            const p = parseFloat(msg.price);
            if (Number.isFinite(p) && p >= 0 && p <= 1) {
              setYesPrice(p);
              setNoPrice(1 - p);
              setChartData((prev) => {
                const next = [...prev, { time: Date.now() / 1000, value: p }];
                return next.slice(-200);
              });
            }
          } else if (msg.event_type === 'book' && msg.bids?.length) {
            const b = msg.bids[0];
            const bestBid = parseFloat(b?.price ?? (Array.isArray(b) ? b[0] : b));
            if (Number.isFinite(bestBid) && bestBid >= 0 && bestBid <= 1) {
              setYesPrice(bestBid);
              setNoPrice(1 - bestBid);
            }
          }
        } catch (e) {
          /* ignore parse errors */
        }
      };

      ws.onerror = () => ws.close();
      ws.onclose = () => {
        if (pingIntervalRef.current) {
          clearInterval(pingIntervalRef.current);
          pingIntervalRef.current = null;
        }
        wsRef.current = null;
        setTimeout(connect, 3000);
      };
    };

    connect();
    return () => {
      if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
      if (wsRef.current) wsRef.current.close();
      wsRef.current = null;
    };
  }, [yesTokenId]);

  return { chartData, yesPrice, noPrice, isLoading };
}
