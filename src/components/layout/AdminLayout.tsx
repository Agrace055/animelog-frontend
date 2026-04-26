import { Link, Outlet, useLocation, useNavigate, Navigate } from "react-router";
import {
  LayoutDashboard,
  Film,
  Calendar,
  MessageSquare,
  LogOut,
  Database,
  MessageCircle,
} from "lucide-react";
import { useStore } from "../../store/atoms";

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const setUser = useStore((state) => state.setUser);
  const user = useStore((state) => state.user);

  if (!user || user.role !== "admin") {
    return <Navigate to="/login" replace />;
  }

  const handleLogout = () => {
    setUser(null);
    navigate("/login");
  };

  const navItems = [
    { name: "仪表盘", path: "/", icon: LayoutDashboard },
    { name: "媒体管理", path: "/media", icon: Film },
    { name: "短评审核", path: "/reviews", icon: MessageSquare },
    { name: "日历管理", path: "/calendar", icon: Calendar },
    { name: "用户反馈", path: "/feedback", icon: MessageCircle },
    { name: "数据导入", path: "/import", icon: Database },
  ];

  return (
    <div className="min-h-screen bg-slate-900 flex text-slate-300">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-950 border-r border-slate-800 flex flex-col shrink-0">
        <div className="h-16 flex items-center px-6 border-b border-slate-800">
          <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400">
            Admin Console
          </span>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-indigo-500 text-white"
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
              >
                <Icon className="w-5 h-5 shrink-0" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-rose-400 hover:text-white hover:bg-rose-500/20 transition-colors"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            退出登录
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 flex items-center justify-between px-8 bg-slate-900 border-b border-slate-800 shrink-0">
          <h1 className="text-lg font-semibold text-white">管理后台</h1>
          <div className="flex items-center gap-4">
            <span className="text-xs font-mono text-slate-500">
              v1.2.0-admin
            </span>
            <Link
              to="/profile"
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-slate-800 transition-colors"
              title="个人中心"
            >
              <img
                src={user.avatar}
                alt={user.name}
                className="w-7 h-7 rounded-full object-cover border border-slate-700"
                referrerPolicy="no-referrer"
              />
              <span className="text-sm text-slate-300 font-medium">
                {user.name}
              </span>
            </Link>
          </div>
        </header>
        <div className="flex-1 overflow-auto p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
