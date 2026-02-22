'use client';

import { useInfiniteMarkets } from '@/hooks/useInfiniteMarkets';
import MarketCard from './MarketCard';
import { useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import { Market } from '@/types/market';

export default function Feed() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
    error
  } = useInfiniteMarkets();

  const { ref, inView } = useInView();

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, fetchNextPage, hasNextPage]);

  if (status === 'pending') return <div className="h-screen w-full flex items-center justify-center text-white">Loading markets...</div>;
  if (status === 'error') return <div className="h-screen w-full flex items-center justify-center text-red-500">Error: {(error as any).message}</div>;

  return (
    <div className="h-screen w-full overflow-y-scroll snap-y snap-mandatory scroll-smooth no-scrollbar">
      {data?.pages.map((group, groupIndex) => (
        // group is EventResponse[]
        group.map((event) => {
            const marketData = event.markets?.[0];
            if (!marketData) return null;
            
            const enrichedMarket: Market = {
                id: marketData.id,
                question: event.title || marketData.question, // Use event title often better for display
                image: event.image,
                description: event.description,
                outcomes: marketData.outcomes,
                outcomePrices: marketData.outcomePrices,
                volume: marketData.volume,
                active: event.active,
                closed: event.closed,
                slug: event.slug,
            };

            return (
                <MarketCard key={`${event.id}-${marketData.id}`} market={enrichedMarket} />
            );
        })
      ))}
      
      <div ref={ref} className="h-10 w-full flex items-center justify-center snap-end text-white/50 pb-20">
        {isFetchingNextPage ? 'Loading more...' : 'End of feed'}
      </div>
    </div>
  );
}
