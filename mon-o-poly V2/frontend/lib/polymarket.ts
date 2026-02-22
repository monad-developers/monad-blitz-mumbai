import axios from 'axios';
import { Market } from '@/types/market';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

export const getActiveMarkets = async (limit = 10, offset = 0): Promise<Market[]> => {
  try {
    const response = await axios.get(`${BACKEND_URL}/api/markets`, {
      params: {
        limit,
        offset
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching markets:', error);
    return [];
  }
};
