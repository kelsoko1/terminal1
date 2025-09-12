import React, { useState, useRef, useEffect, useCallback } from 'react';
import { KelsokoChallengeCard } from './KelsokoChallengeCard';
import { KelsokoChallengeModal } from './KelsokoChallengeModal';
import { KelsokoTopNavBar } from './KelsokoTopNavBar';
import { getChallenges, UnifiedChallenge } from '@/lib/services/challengeService';
import { AnimatePresence } from 'framer-motion';
import { formatLargeNumber } from '@/lib/utils/currency';

// Simulate paginated data
const PAGE_SIZE = 6;

// Add a compact formatter for numbers
function compactNumber(n: number): string {
  if (n >= 1_000_000_000) {
    return (n / 1_000_000_000).toFixed(1).replace(/\.0$/, '') + 'B';
  } else if (n >= 1_000_000) {
    return (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  } else if (n >= 1_000) {
    return (n / 1_000).toFixed(0) + 'K';
  } else {
    return n.toString();
  }
}

export const KelsokoChallengeList = () => {
  const [challenges, setChallenges] = useState<UnifiedChallenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedChallenge, setSelectedChallenge] = useState<UnifiedChallenge | null>(null);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('recent');
  const [view, setView] = useState('list');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const loader = useRef(null);

  useEffect(() => {
    setLoading(true);
    getChallenges()
      .then((data) => {
        setChallenges(data);
        setLoading(false);
      })
      .catch((err) => {
        setError('Failed to load challenges');
        setLoading(false);
      });
  }, []);

  // Filter and sort
  const filtered = challenges.filter((c: any) =>
    c.title.toLowerCase().includes(search.toLowerCase())
  );

  // Optionally sort by recent or payout, etc.
  const sorted = [...filtered].sort((a, b) => {
    if (sort === 'recent') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    // Add more sort logic if needed
    return 0;
  });

  // Infinite scroll
  const handleObserver = useCallback((entries: IntersectionObserverEntry[]) => {
    const target = entries[0];
    if (target.isIntersecting && hasMore && !loading) {
      setLoading(true);
      setTimeout(() => {
        setPage(prev => {
          const next = prev + 1;
          if (next * PAGE_SIZE >= sorted.length) setHasMore(false);
          return next;
        });
        setLoading(false);
      }, 600);
    }
  }, [hasMore, loading, sorted.length]);

  useEffect(() => {
    const option = {
      root: null,
      rootMargin: '20px',
      threshold: 1.0
    };
    const observer = new IntersectionObserver(handleObserver, option);
    if (loader.current) observer.observe(loader.current);
    return () => observer.disconnect();
  }, [handleObserver]);

  return (
    <div className="relative min-h-screen bg-[#18181b] text-white px-2 py-4 overflow-x-hidden">
      <KelsokoTopNavBar
        search={search}
        setSearch={setSearch}
        sort={sort}
        setSort={setSort}
        view={view}
        setView={setView}
      />
      {/* Timeline vertical line */}
      <div className="relative flex flex-col items-center mt-4" style={{ minHeight: '70vh' }}>
        {/* Centered vertical timeline with glow and gradient */}
        <div className="absolute left-1/2 top-0 bottom-0 w-2 bg-gradient-to-b from-red-500 via-red-700 to-red-900 border border-white/30 z-0 shadow-[0_0_32px_8px_rgba(239,68,68,0.25)]" style={{ transform: 'translateX(-50%)', filter: 'blur(0.5px)' }} />
        <div className="w-full max-w-md mx-auto relative z-10">
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <span className="animate-spin rounded-full h-12 w-12 border-b-2 investor-danger"></span>
            </div>
          ) : error ? (
            <div className="text-center investor-danger py-8">{error}</div>
          ) : sorted.length === 0 ? (
            <div className="text-center text-gray-400 py-8">No challenges found.</div>
          ) : (
            sorted.slice(0, page * PAGE_SIZE).map((challenge, idx) => {
              const isLeft = idx % 2 === 0;
              return (
                <div key={challenge.id + '-' + idx} className="relative flex items-center mb-10" style={{ minHeight: 80 }}>
                  {/* Timeline payout dot as node on the timeline, now larger and glowing */}
                  <div className="relative flex flex-col items-center justify-center" style={{ width: '80px', zIndex: 2, height: '100%' }}>
                    <div className="absolute left-1/2 top-1/2" style={{ transform: 'translate(-50%, -50%)' }}>
                      <span className="w-14 h-14 flex flex-col items-center justify-center rounded-full bg-gradient-to-br from-red-500 via-red-700 to-red-900 border-4 border-white/80 text-white z-20 transition-transform duration-200 hover:scale-105" style={{ boxShadow: '0 0 24px 4px rgba(239,68,68,0.18)', fontSize: '0.95rem', minWidth: '56px', lineHeight: 1.1, padding: '6px 0' }}>
                        {(() => {
                          let reward = challenge.reward || 'TSh';
                          let num = null;
                          if (typeof reward === 'number') {
                            num = reward;
                          } else if (typeof reward === 'string' && reward.match(/^[\d,]+ TZS$/)) {
                            num = parseInt(reward.replace(/[^\d]/g, ''));
                          }
                          if (num !== null) {
                            return (
                              <>
                                <span className="truncate w-full text-base font-semibold tracking-wide leading-tight" style={{lineHeight: 1.1, letterSpacing: '0.04em'}}>{compactNumber(num)}</span>
                                <span className="text-[10px] font-light mt-0.5 tracking-widest" style={{lineHeight: 1.1, letterSpacing: '0.08em'}}>TZS</span>
                              </>
                            );
                          }
                          // fallback for other string rewards
                          return <span className="truncate w-full text-sm font-normal" style={{fontSize: '0.95em'}}>{typeof reward === 'string' ? reward.replace(/^TSh|TZS/gi, '').trim() : reward}</span>;
                        })()}
                      </span>
                    </div>
                  </div>
                  {/* Connector and card, perfectly horizontal from dot to card, with gradient/glow */}
                  {isLeft ? (
                    <div className="flex-1 flex items-center" style={{ position: 'relative', zIndex: 1, height: '80px' }}>
                      <div style={{ position: 'relative', width: '100%', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                        <span className="rounded-full" style={{ height: 6, width: 'calc(50% - 80px)', position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)', background: 'linear-gradient(90deg, rgba(239,68,68,0.15) 0%, rgba(239,68,68,0.7) 100%)', boxShadow: '0 0 12px 2px rgba(239,68,68,0.18)' }} />
                        <div style={{ position: 'relative', zIndex: 2 }}>
                          <KelsokoChallengeCard challenge={challenge} onClick={() => setSelectedChallenge(challenge)} compact flush />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 flex items-center" style={{ position: 'relative', zIndex: 1, height: '80px' }}>
                      <div style={{ position: 'relative', width: '100%', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
                        <div style={{ position: 'relative', zIndex: 2 }}>
                          <KelsokoChallengeCard challenge={challenge} onClick={() => setSelectedChallenge(challenge)} compact flush />
                        </div>
                        <span className="rounded-full" style={{ height: 6, width: 'calc(50% - 80px)', position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', background: 'linear-gradient(270deg, rgba(239,68,68,0.15) 0%, rgba(239,68,68,0.7) 100%)', boxShadow: '0 0 12px 2px rgba(239,68,68,0.18)' }} />
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
          <div ref={loader} className="w-full flex justify-center py-4">
            {loading && <span className="investor-danger text-xs">Loading more...</span>}
            {!hasMore && <span className="text-gray-500 text-xs">No more challenges</span>}
          </div>
        </div>
      </div>
      <AnimatePresence>
        {selectedChallenge && (
          <KelsokoChallengeModal
            challenge={selectedChallenge}
            onClose={() => setSelectedChallenge(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}; 