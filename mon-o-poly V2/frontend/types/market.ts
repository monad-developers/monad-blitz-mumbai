export interface Market {
  id: string;
  question: string;
  image?: string;
  description?: string;
  outcomes?: string[];
  outcomePrices: string[];
  volume: string;
  endDate?: string;
  active: boolean;
  closed: boolean;
  slug?: string;
  createdAt?: string;
  /** CLOB token IDs for YES (index 0) and NO (index 1) - used for price history & WebSocket */
  clobTokenIds?: string[];
}
