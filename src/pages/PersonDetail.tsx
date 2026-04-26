import { useParams, useNavigate } from 'react-router';
import { useStore } from '../store/atoms';
import MediaCard from '../components/common/MediaCard';
import { ArrowLeft, User, Mic2, Clapperboard } from 'lucide-react';
import { defaultAvatarImage } from '../assets/defaultImages';

export default function PersonDetail() {
  const { id } = useParams<{ id: string }>();
  // Handle decode safely
  const decodedName = id ? decodeURIComponent(id) : '';
  const navigate = useNavigate();
  const animes = useStore(state => state.animes);
  const novels = useStore(state => state.novels);
  const games = useStore(state => state.games);
  
  // Find works where this person is involved (either as CV or staff)
  const relatedWorks = [...animes, ...novels, ...games].filter(media => {
     const isCV = media.characters?.some(c => c.cvName === decodedName);
     const isStaff = media.staff?.some(s => s.name === decodedName);
     return isCV || isStaff;
  });

  const avatar = defaultAvatarImage;
  
  // Derive primary role context
  const asCV = animes.some(m => m.characters?.some(c => c.cvName === decodedName));
  const roleDesc = asCV ? "配音演员 (CV)" : "制作人员 / 幕后职员";
  const RoleIcon = asCV ? Mic2 : Clapperboard;

  return (
    <div className="animate-in fade-in pb-20 md:pb-0">
       {/* Hero Section */}
       <div className="bg-slate-900 border-b border-slate-800 pt-8 pb-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
           <button 
             onClick={() => navigate(-1)} 
             className="absolute top-6 left-4 sm:left-8 text-slate-400 hover:text-white flex items-center gap-2 z-20 transition"
           >
              <ArrowLeft className="w-5 h-5" /> 返回
           </button>
           
           <div className="relative z-10 max-w-5xl mx-auto flex flex-col sm:flex-row items-center sm:items-start gap-8 text-center sm:text-left mt-8 sm:mt-4">
              <div className="shrink-0 relative">
                <div className="absolute inset-0 bg-indigo-500 rounded-full blur-xl opacity-20 transform scale-110"></div>
                <img src={avatar} className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-full object-cover border-4 border-slate-800 shadow-2xl bg-slate-200" alt={decodedName} referrerPolicy="no-referrer" />
              </div>
              
              <div className="mt-2 sm:mt-4 text-white">
                 <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">{decodedName}</h1>
                 <div className="flex items-center justify-center sm:justify-start gap-2 mt-3">
                    <span className="flex items-center gap-1.5 px-3 py-1 bg-indigo-500/20 text-indigo-400 rounded-full text-sm font-semibold border border-indigo-500/30">
                       <RoleIcon className="w-4 h-4" />
                       {roleDesc}
                    </span>
                 </div>
                 <p className="text-slate-400 text-sm mt-5 max-w-2xl leading-relaxed text-left">
                    {decodedName} 参与了多部优秀作品的制作与配音工作。凭借出色的业务能力和独特的个人风格，在业界中收获了广泛的认可，为这些精彩的剧集倾注了无数的心血。
                 </p>
              </div>
           </div>
       </div>

       {/* Works Section */}
       <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <span className="w-1.5 h-6 bg-indigo-500 rounded-full"></span> 
            参演 / 制作作品 ({relatedWorks.length})
          </h2>
          
          {relatedWorks.length > 0 ? (
             <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {relatedWorks.map(work => (
                   <MediaCard key={work.id} media={work} layout="grid" />
                ))}
             </div>
          ) : (
             <div className="text-center text-slate-500 py-16 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col items-center gap-3">
                <User className="w-10 h-10 text-slate-300" />
                <div>暂未收录该人员的相关作品记录</div>
             </div>
          )}
       </div>
    </div>
  );
}
