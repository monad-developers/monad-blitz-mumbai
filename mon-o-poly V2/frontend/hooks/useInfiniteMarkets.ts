import { useInfiniteQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Market } from '@/types/market';

const GAMMA_API_URL = 'https://gamma-api.polymarket.com';

// Response type from API (simplified)
interface EventResponse {
  id: string;
  title: string;
  slug: string;
  image: string;
  description: string;
  active: boolean;
  closed: boolean;
  markets: {
      id: string;
      question: string;
      outcomePrices: string[];
      volume: string;
      outcomes: string[];
  }[];
}

const fetchMarkets = async ({ pageParam = 0 }) => {
  const limit = 10;
  const offset = pageParam * limit;
  const response = await axios.get<EventResponse[]>(`${GAMMA_API_URL}/events`, {
    params: {
      limit,
      offset,
      active: true,
      closed: false,
      order: 'volume',
      ascending: false
    }
  });
  return response.data;
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
