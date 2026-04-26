import { Outlet, useLocation } from 'react-router';
import Navbar from './Navbar';
import BottomNav from './BottomNav';

export default function Layout() {
  const location = useLocation();
  const isAuthPage = ['/login', '/register'].includes(location.pathname);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {!isAuthPage && <Navbar />}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 mb-16 md:mb-0">
        <Outlet />
      </main>
      {!isAuthPage && <BottomNav />}
      {/* Mobile Right Bottom FAB for Adding Record quickly */}
      {!isAuthPage && (
        <button className="md:hidden fixed bottom-20 right-4 w-12 h-12 bg-rose-500 text-white rounded-full shadow-lg shadow-rose-200 flex items-center justify-center text-2xl z-50 hover:bg-rose-600 transition">
          +
        </button>
      )}
    </div>
  );
}
