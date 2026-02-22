'use client';

import { useInfiniteMarkets } from '@/hooks/useInfiniteMarkets';
import MarketCard from './MarketCard';
import { useEffect } from 'react';
import { useInView } from 'react-intersection-observer';

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

  if (status === 'pending') return (
    <div className="h-screen w-full flex items-center justify-center">
      <span className="font-mono-brand text-white/60">Loading markets...</span>
    </div>
  );
  if (status === 'error') return (
    <div className="h-screen w-full flex items-center justify-center">
      <span className="font-mono-brand text-[#FF8EE4]">Error: {(error as any).message}</span>
    </div>
  );

  return (
    <div className="h-screen w-full overflow-y-scroll snap-y snap-mandatory scroll-smooth no-scrollbar">
      {data?.pages.flatMap((group) =>
        group.map((market) => (
          <MarketCard key={market.id} market={market} />
        ))
      )}
      
      <div ref={ref} className="h-10 w-full flex items-center justify-center snap-end text-white/40 font-mono-brand text-sm pb-20">
        {isFetchingNextPage ? 'Loading more...' : 'End of feed'}
      </div>
    </div>
  );
}
