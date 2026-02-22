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
  // properties from event
  slug?: string;
  createdAt?: string;
}
