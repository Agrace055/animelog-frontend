import { Link } from 'react-router';
import { Media } from '../../types';
import { Star } from 'lucide-react';
import clsx from 'clsx';
import React from 'react';

interface MediaCardProps {
  key?: React.Key;
  media: Media;
  layout?: 'grid' | 'horizontal';
  progress?: number;
}

export default function MediaCard({ media, layout = 'grid', progress }: MediaCardProps) {
  const isGrid = layout === 'grid';
  
  return (
    <Link 
      to={`/${media.type}/${media.id}`}
      className={clsx(
        "group flex transition-all cursor-pointer overflow-hidden",
        isGrid ? "flex-col gap-2" : "gap-4 bg-white p-3 rounded-2xl border border-slate-200 hover:shadow-md w-full min-w-[320px]"
      )}
    >
      <div className={clsx(
        "relative shrink-0 overflow-hidden",
        isGrid ? "aspect-[3/4] bg-slate-200 rounded-xl shadow-sm" : "w-24 h-32 bg-slate-200 rounded-lg"
      )}>
        <img 
          src={media.coverImage} 
          alt={media.title} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none"></div>
        {media.status === 'ongoing' ? (
          <div className="absolute bottom-1 left-0 right-0 text-center text-[10px] text-white font-bold uppercase tracking-tighter">
            连载中
          </div>
        ) : (
          <div className="absolute bottom-1 left-0 right-0 text-center text-[10px] text-white font-bold uppercase tracking-tighter">
              {media.type === 'anime' ? 'ANIME' : media.type === 'novel' ? 'NOVEL' : 'GAME'}
          </div>
        )}
        {isGrid && !progress && (
          <div className="absolute top-2 right-2 px-2 py-1 bg-white/90 backdrop-blur rounded-lg text-[10px] font-bold text-slate-900">
             ★ {media.score.toFixed(1)}
          </div>
        )}
      </div>
      
      {isGrid ? (
        <div className="px-1 flex flex-col gap-0.5">
          <h5 className="text-xs font-bold text-slate-900 truncate" title={media.title}>{media.title}</h5>
          <p className="text-[10px] text-slate-500 font-medium uppercase truncate">
            {media.tags.slice(0, 2).join(' • ')}
          </p>
        </div>
      ) : (
        <div className="flex-1 flex flex-col justify-between py-1 pr-1">
          <div>
            <h4 className="font-bold text-slate-900 leading-tight mb-1 line-clamp-2" title={media.title}>
              {media.title}
            </h4>
            <p className="text-[11px] text-slate-500">
              {progress !== undefined ? '上次记录 2 天前' : `${media.year} • ${media.type === 'anime' ? `${media.episodes}集` : media.type === 'novel' ? `${media.volumes || '?'}卷` : `${media.chapters || '?'}章`}`}
            </p>
          </div>
          
          <div>
            {progress !== undefined ? (
              <>
                <div className="flex justify-between text-[10px] font-bold text-slate-600 mb-1">
                  <span>{media.type === 'anime' ? 'EP' : media.type === 'novel' ? 'VOL' : 'CH'} {progress} / {media.type === 'anime' ? media.episodes : media.type === 'novel' ? (media.volumes || '?') : (media.chapters || '?')}</span>
                  <span>{media.type === 'anime' && media.episodes ? Math.round((progress / media.episodes) * 100) : media.type === 'novel' && media.volumes ? Math.round((progress / media.volumes) * 100) : media.chapters ? Math.round((progress / media.chapters) * 100) : 0}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${media.type === 'anime' ? 'bg-rose-500' : media.type === 'novel' ? 'bg-indigo-500' : 'bg-emerald-500'}`} style={{ width: `${media.type === 'anime' && media.episodes ? Math.round((progress / media.episodes) * 100) : media.type === 'novel' && media.volumes ? Math.round((progress / media.volumes) * 100) : media.chapters ? Math.round((progress / media.chapters) * 100) : 0}%` }}></div>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-1 text-[11px] font-bold text-slate-700">
                <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                {media.score.toFixed(1)}
              </div>
            )}
          </div>
        </div>
      )}
    </Link>
  );
}
