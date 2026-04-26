import { Link, useLocation, useNavigate } from 'react-router';
import { useStore } from '../../store/atoms';
import { Search, Bell, EyeOff } from 'lucide-react';
import clsx from 'clsx';

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const user = useStore(state => state.user);
  const world = useStore(state => state.world);
  const setWorld = useStore(state => state.setWorld);
  const unreadCount = useStore(state => state.notifications.filter(n => !n.isRead).length);

  const navLinks = [
    { name: '首页', path: '/' },
    { name: '动漫', path: '/anime' },
    { name: '轻小说', path: '/novel' },
    { name: '游戏', path: '/game' },
    { name: '更新日历', path: '/calendar' },
  ];

  return (
    <header className="hidden md:flex sticky top-0 z-40 w-full h-16 bg-white border-b border-slate-200 shrink-0 shadow-sm transition-colors duration-500 lg:z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex items-center justify-between h-full">
        <div className="flex items-center gap-8 h-full">
          <Link to="/" className="flex-shrink-0 flex items-center gap-2">
            <div className="w-8 h-8 bg-rose-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-black text-xl">A</span>
            </div>
            <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-rose-600 to-indigo-600">
              {world === 'hidden' ? 'AnimeLog (里)' : 'AnimeLog'}
            </span>
          </Link>
          <nav className="hidden md:flex gap-6 text-sm font-semibold text-slate-600 h-full">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={clsx(
                  'transition-colors h-full flex items-center border-b-2',
                  location.pathname === link.path || (link.path !== '/' && location.pathname.startsWith(link.path))
                    ? 'text-rose-500 border-rose-500'
                    : 'border-transparent hover:text-rose-500'
                )}
              >
                {link.name}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative w-64 hidden lg:block">
            <input
              type="text"
              placeholder="搜索标题、角色..."
              className="w-full bg-slate-100 border-none rounded-full py-2 px-4 pl-10 text-xs focus:ring-2 focus:ring-rose-500 focus:bg-white transition-all text-slate-900 placeholder:text-slate-400"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.currentTarget.value) {
                  navigate(`/search?q=${encodeURIComponent(e.currentTarget.value)}`);
                }
              }}
            />
            <span className="absolute left-3 top-2 text-slate-400">
              <Search className="h-4 w-4" />
            </span>
          </div>
          <Link to="/search" className="p-1 rounded-full text-slate-500 hover:bg-slate-100 lg:hidden">
            <Search className="h-5 w-5" />
          </Link>
          <Link to="/notifications" className="p-1 rounded-full text-slate-500 hover:bg-slate-100 relative">
            <span className="sr-only">通知</span>
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-rose-500 rounded-full border border-white"></span>
            )}
          </Link>
          
          {user && user.nsfwStatus === 'approved' && (
            <button 
              onClick={() => {
                setWorld(world === 'hidden' ? 'normal' : 'hidden');
                navigate('/');
              }}
              className={clsx(
                "p-1 rounded-full transition-colors flex items-center justify-center",
                world === 'hidden' ? 'bg-rose-100 text-rose-600' : 'text-slate-500 hover:bg-slate-100'
              )}
              title={world === 'hidden' ? '切换到表世界' : '切换到里世界'}
            >
              <EyeOff className="h-5 w-5" />
            </button>
          )}

          {user ? (
            <Link to="/my" className="flex items-center">
              <img
                className="h-9 w-9 rounded-full object-cover border-2 border-white shadow-sm bg-gradient-to-tr from-rose-400 to-indigo-400"
                src={user.avatar}
                alt={user.name}
                referrerPolicy="no-referrer"
              />
            </Link>
          ) : (
            <Link to="/login" className="text-sm font-semibold text-rose-500 hover:text-rose-600">
              登录/注册
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
