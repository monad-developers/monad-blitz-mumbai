import { useInfiniteQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Market } from '@/types/market';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

export interface ApiMarket {
  id: string;
  question: string;
  slug: string;
  image?: string;
  description?: string;
  outcomePrices: string[] | string;
  outcomes: string[] | string;
  volume: string;
  active: boolean;
  closed: boolean;
  clobTokenIds?: string[] | string;
}

const parseJsonField = (val: string[] | string): string[] => {
  if (Array.isArray(val)) return val;
  if (typeof val === 'string') {
    try {
      const arr = JSON.parse(val);
      return Array.isArray(arr) ? arr : [];
    } catch {
      return [];
    }
  }
  return [];
};

const toMarket = (m: ApiMarket): Market => ({
  id: m.id,
  question: m.question,
  image: m.image,
  description: m.description,
  outcomes: parseJsonField(m.outcomes),
  outcomePrices: parseJsonField(m.outcomePrices),
  volume: m.volume,
  active: m.active,
  closed: m.closed,
  slug: m.slug,
  clobTokenIds: Array.isArray(m.clobTokenIds) ? m.clobTokenIds : parseJsonField(m.clobTokenIds as string),
});

const fetchMarkets = async ({ pageParam = 0 }): Promise<Market[]> => {
  const limit = 10;
  const offset = pageParam * limit;
  const response = await axios.get<ApiMarket[]>(`${BACKEND_URL}/api/markets`, {
    params: { limit, offset },
  });
  return response.data.map(toMarket);
};

export function useInfiniteMarkets() {
  return useInfiniteQuery({
    queryKey: ['markets'],
    queryFn: fetchMarkets,
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < 10) return undefined;
      return allPages.length;
    },
  });
}
