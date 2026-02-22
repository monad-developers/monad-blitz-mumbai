import axios from 'axios';

const GAMMA_API_URL = 'https://gamma-api.polymarket.com';

export interface Market {
  id: string;
  question: string;
  conditionId: string;
  slug: string;
  resolutionSource: string;
  endDate: string;
  liquidity: string;
  startDate: string;
  image: string;
  icon: string;
  description: string;
  outcomes: string[];
  outcomePrices: string[];
  volume: string;
  active: boolean;
  closed: boolean;
  marketMakerAddress: string;
  createdAt: string;
  updatedAt: string;
  new: boolean;
  featured: boolean;
  submitted_by: string;
  archived: boolean;
  resolvedBy: string;
  restricted: boolean;
  groupItemTitle: string;
  groupItemThreshold: string;
  questionID: string;
  enableOrderBook: boolean;
  orderPriceMinTickSize: number;
  orderMinSize: number;
  volumeNum: number;
  liquidityNum: number;
  endDateIso: string;
  startDateIso: string;
  hasReviewedDates: boolean;
  volume24hr: number;
  clobTokenIds: string[];
  umaBond: string;
  umaReward: string;
  volume24hrClob: number;
  volumeClob: number;
  liquidityClob: number;
  acceptingOrders: boolean;
  negRisk: boolean;
  commentCount: number;
  _count?: {
      comments: number;
  };
}

export const getActiveMarkets = async (limit = 10, offset = 0): Promise<Market[]> => {
  try {
    const response = await axios.get(`${GAMMA_API_URL}/events`, {
      params: {
        limit,
        offset,
        active: true,
        closed: false,
        order: 'volume24hr',
        ascending: false
      }
    });
    // The API returns events which contain markets. For simplicity, we'll map events to a flat structure if needed, 
    // or just return the markets from within events.
    // However, looking at the previous API response, the endpoint returns an array of events, 
    // and each event has a 'markets' array. We probably want the main market of the event.
    
    // Let's inspect the structure again.
    // The previous response showed an array of objects which seem to be events.
    // Each event has a 'markets' array. 
    // But scrolling through feed usually shows one main market per "card".
    // We will return the events and let the UI decide how to display (likely the first market or the event itself).
    
    return response.data;
  } catch (error) {
    console.error('Error fetching markets:', error);
    return [];
  }
};
