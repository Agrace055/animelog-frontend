import { useStore } from '../store/atoms';
import { redirect, useNavigate, Link } from 'react-router';
import { Settings, LogOut, CheckCircle, Clock, PauseCircle, XCircle } from 'lucide-react';

export default function Dashboard() {
  const user = useStore(state => state.user);
  const records = useStore(state => state.records);
  const world = useStore(state => state.world);
  const animes = useStore(state => state.animes);
  const novels = useStore(state => state.novels);
  const games = useStore(state => state.games);
  const setUser = useStore(state => state.setUser);
  const navigate = useNavigate();

  if (!user) {
    navigate('/login');
    return null;
  }

  const handleLogout = () => {
    setUser(null);
    navigate('/');
  };

  // Filter records by world
  const filteredRecords = records.filter(r => {
    const list = r.type === 'anime' ? animes : r.type === 'novel' ? novels : games;
    const media = list.find(m => m.id === r.mediaId);
    if (!media) return false;
    if (world === 'hidden' && !media.isNsfw) return false;
    if (world === 'normal' && media.isNsfw) return false;
    return true;
  });

  const animeRecords = filteredRecords.filter(r => r.type === 'anime');
  const novelRecords = filteredRecords.filter(r => r.type === 'novel');
  const gameRecords = filteredRecords.filter(r => r.type === 'game');

  const stats = [
    { label: '看过动漫', value: animeRecords.filter(r => r.status === 'watched').length, link: '/my/records?type=anime&status=watched' },
    { label: '读过轻小说', value: novelRecords.filter(r => r.status === 'watched').length, link: '/my/records?type=novel&status=watched' },
    { label: '玩过游戏', value: gameRecords.filter(r => r.status === 'watched').length, link: '/my/records?type=game&status=watched' },
    { label: '进行中', value: filteredRecords.filter(r => r.status === 'watching').length, link: '/my/records?status=watching' },
    { label: '评价数', value: filteredRecords.filter(r => r.rating > 0).length, link: '/my/records' }
  ];

  const statColors = {
    watched: 'from-emerald-400 to-emerald-600',
    watching: 'from-blue-400 to-blue-600',
    paused: 'from-amber-400 to-amber-600',
    dropped: 'from-slate-400 to-slate-600'
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20 md:pb-0">
      {/* Header Profile */}
      <div className="flex flex-col md:flex-row items-center md:items-start gap-8 relative overflow-hidden">
        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden shrink-0 border-4 border-white shadow-lg z-10 bg-gradient-to-tr from-rose-400 to-indigo-400">
           <img src={user.avatar} className="w-full h-full object-cover" alt={user.name} referrerPolicy="no-referrer" />
        </div>
        
        <div className="flex-1 text-center md:text-left z-10 w-full flex flex-col justify-center h-full pt-2">
          <div className="flex flex-col md:flex-row md:justify-between items-center md:items-start w-full">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">{user.name}</h1>
              <p className="text-slate-500 mt-1">Pro Account</p>
            </div>
            
            <div className="mt-4 md:mt-0 flex gap-2">
              <button onClick={() => navigate('/settings')} className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 p-2.5 rounded-xl transition shadow-sm">
                <Settings className="w-4 h-4" />
              </button>
              <button onClick={handleLogout} className="bg-white hover:bg-slate-50 border border-slate-200 text-rose-500 p-2.5 rounded-xl transition shadow-sm" title="登出">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <section>
        <h3 className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-4">Personal Stats</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full">
          {stats.map((s, i) => (
            <Link to={s.link} key={i} className="bg-slate-50 p-4 rounded-xl border border-slate-100 hover:bg-slate-100 transition-colors block cursor-pointer">
              <div className="flex justify-between items-end mb-1">
                <span className="text-2xl font-bold text-slate-800">{s.value}</span>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${i % 2 === 0 ? 'text-rose-500 bg-rose-50' : 'text-indigo-500 bg-indigo-50'}`}>+新记录</span>
              </div>
              <p className="text-xs text-slate-500">{s.label}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Genre Affinity */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <h2 className="font-bold text-slate-800 mb-6">分类偏好</h2>
          <div className="flex flex-wrap gap-2">
            {['奇幻', '战斗', '日常', '校园恋爱', '治愈', '科幻'].map((t, i) => {
              const bgClass = i === 0 ? 'bg-rose-500 text-white' : i === 1 ? 'bg-indigo-500 text-white' : 'bg-slate-200 text-slate-600';
              return (
                <span key={i} className={`px-3 py-1 text-[11px] font-medium rounded-full ${bgClass}`}>
                  {t}
                </span>
              );
            })}
          </div>
          
          <div className="mt-8 bg-indigo-900 rounded-2xl p-5 text-white relative overflow-hidden">
             <div className="relative z-10">
               <p className="text-xs text-indigo-200 mb-1">高级账号</p>
               <h4 className="font-bold mb-3">解锁详细数据分析</h4>
               <button className="w-full bg-white text-indigo-900 text-xs font-bold py-2 rounded-lg hover:bg-indigo-50 transition-colors">立即升级</button>
             </div>
             <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
          </div>
        </div>

        {/* Watch Status Overview */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <h2 className="font-bold text-slate-800 mb-6">观看状态分布</h2>
          <div className="space-y-4 flex-1">
            {[
              { status: 'watched', label: '看过', icon: CheckCircle, color: statColors.watched, count: filteredRecords.filter(r => r.status === 'watched').length },
              { status: 'watching', label: '在看', icon: Clock, color: statColors.watching, count: filteredRecords.filter(r => r.status === 'watching').length },
              { status: 'paused', label: '搁置', icon: PauseCircle, color: statColors.paused, count: filteredRecords.filter(r => r.status === 'paused').length },
              { status: 'dropped', label: '弃坑', icon: XCircle, color: statColors.dropped, count: filteredRecords.filter(r => r.status === 'dropped').length }
            ].map((st, i) => {
              const Icon = st.icon;
              return (
                <Link to={`/my/records?status=${st.status}`} key={i} className="flex items-center gap-4 hover:bg-slate-50 p-2 rounded-xl transition-colors cursor-pointer">
                   <div className={`p-2 rounded-lg bg-gradient-to-br ${st.color} text-white shrink-0`}>
                     <Icon className="w-4 h-4" />
                   </div>
                   <div className="flex-1">
                      <div className="flex justify-between mb-1">
                        <span className="text-xs font-bold text-slate-700">{st.label}</span>
                        <span className="text-xs font-bold text-slate-500">{st.count} 部</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full bg-gradient-to-r ${st.color}`} style={{ width: `${(st.count / Math.max(filteredRecords.length, 1)) * 100}%` }}></div>
                      </div>
                   </div>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
