import { useRef } from 'react';
import { useStore } from '../store/atoms';
import MediaCard from '../components/common/MediaCard';
import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router';

export default function Home() {
  const user = useStore(state => state.user);
  const records = useStore(state => state.records);
  const world = useStore(state => state.world);
  const animes = useStore(state => state.animes);
  const novels = useStore(state => state.novels);
  const games = useStore(state => state.games);
  const calendarItems = useStore(state => state.calendarItems);

  const isHidden = world === 'hidden';
  const todayIndex = (new Date().getDay() + 6) % 7;
  const todayUpdates = calendarItems.filter(item => item.dayOfWeek === todayIndex).length;

  const allMedia = [...animes, ...novels, ...games].filter(m => (isHidden ? m.isNsfw : !m.isNsfw));

  const recommended = allMedia.slice(0, 4);
  const popularAnime = animes.filter(m => (isHidden ? m.isNsfw : !m.isNsfw)).slice(0, 4);

  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: direction === 'left' ? -300 : 300, behavior: 'smooth' });
    }
  };

  const inProgressRecords = records.filter(r => r.status === 'watching');
  const continueItems = inProgressRecords.map(record => {
    const mediaList = record.type === 'anime' ? animes : record.type === 'novel' ? novels : games;
    const media = mediaList.find(m => m.id === record.mediaId);
    return { record, media };
  }).filter(item => {
     if (!item.media) return false;
     if (isHidden && !item.media.isNsfw) return false;
     if (!isHidden && item.media.isNsfw) return false;
     return true;
  });

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-500 pb-20 md:pb-0">
      {/* Welcome Section */}
      {user && (
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">欢迎回来，{user.name}! 👋</h1>
            <p className="text-slate-500 text-sm">
              {todayUpdates > 0 ? `您今天有 ${todayUpdates} 部预定更新的内容。` : '今天暂无预定更新的内容。'}
            </p>
          </div>
          <Link to="/search" className="hidden sm:flex bg-rose-500 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-rose-200 items-center gap-2 hover:bg-rose-600 transition-all">
            <span>+</span> 快速记录
          </Link>
        </div>
      )}

      {/* Continue Watching/Reading */}
      {continueItems.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-slate-800">
              继续观看 / 阅读
            </h2>
            <Link to="/my/records?status=watching" className="text-rose-500 text-xs font-bold hover:underline">
              查看全部 ({continueItems.length})
            </Link>
          </div>
          <div ref={scrollRef} className="flex overflow-x-auto snap-x hide-scrollbar gap-4 pb-4 -mx-4 px-4 sm:mx-0 sm:px-0">
            {continueItems.map(({ record, media }) => (
              <div key={record.id} className="snap-start shrink-0">
                <MediaCard media={media!} layout="horizontal" progress={record.progress} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Recommended Section (Grid 2 col on mobile, 4 on desktop) */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-slate-800">
            为你推荐
          </h2>
          <div className="flex gap-2">
            <button onClick={() => handleScroll('left')} className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400 hover:text-slate-900">←</button>
            <button onClick={() => handleScroll('right')} className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400 hover:text-slate-900">→</button>
          </div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {recommended.map(media => (
            <MediaCard key={media.id} media={media} layout="grid" />
          ))}
        </div>
      </section>

      {/* Popular Anime */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-slate-800">
            本季热门
          </h2>
          <Link to="/anime?sort=popular" className="text-rose-500 text-xs font-bold hover:underline">
            更多热门
          </Link>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
           {popularAnime.map(media => (
            <MediaCard key={media.id} media={media} layout="grid" />
          ))}
        </div>
      </section>
    </div>
  );
}
