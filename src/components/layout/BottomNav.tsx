import { Link, useLocation } from 'react-router';
import { Home, Compass, Search, Calendar, User } from 'lucide-react';
import clsx from 'clsx';

export default function BottomNav() {
  const location = useLocation();

  const tabs = [
    { name: '首页', path: '/', icon: Home },
    { name: '浏览', path: '/anime', icon: Compass },
    { name: '搜索', path: '/search', icon: Search },
    { name: '更新', path: '/calendar', icon: Calendar },
    { name: '我的', path: '/my', icon: User },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 pb-safe shadow-sm">
      <div className="flex justify-around items-center h-16">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = location.pathname === tab.path || (tab.path !== '/' && location.pathname.startsWith(tab.path) && tab.path !== '/anime');
          // For browse, if it's /anime or /novel, it's active
          const isBrowseActive = tab.path === '/anime' && (location.pathname.startsWith('/anime') || location.pathname.startsWith('/novel'));
          
          const highlight = tab.path === '/anime' ? isBrowseActive : isActive;

          return (
            <Link
              key={tab.path}
              to={tab.path}
              className={clsx(
                'flex flex-col items-center justify-center w-full h-full space-y-1',
                highlight ? 'text-rose-500' : 'text-slate-500 hover:text-slate-900'
              )}
            >
              <Icon className={clsx('h-6 w-6', highlight ? 'fill-rose-100' : '')} strokeWidth={highlight ? 2.5 : 1.5} />
              <span className="text-[10px] font-medium">{tab.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
