import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router";
import Layout from "./components/layout/Layout";
import Home from "./pages/Home";
import MediaDetail from "./pages/MediaDetail";
import PersonDetail from "./pages/PersonDetail";
import Search from "./pages/Search";
import Dashboard from "./pages/Dashboard";
import MediaList from "./pages/MediaList";
import Calendar from "./pages/Calendar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import MyRecords from "./pages/MyRecords";
import Settings from "./pages/Settings";
import Notifications from "./pages/Notifications";
import AdminLayout from "./components/layout/AdminLayout";
import AdminConsole from "./pages/AdminConsole";
import AdminMedia from "./pages/AdminMedia";
import AdminReviews from "./pages/AdminReviews";
import AdminCalendar from "./pages/AdminCalendar";
import AdminImport from "./pages/AdminImport";
import { useStore } from "./store/atoms";

function AppBootstrap() {
  const user = useStore((state) => state.user);
  const world = useStore((state) => state.world);
  const loadMedia = useStore((state) => state.loadMedia);
  const loadRecords = useStore((state) => state.loadRecords);
  const loadFavorites = useStore((state) => state.loadFavorites);
  const loadNotifications = useStore((state) => state.loadNotifications);
  const loadCalendar = useStore((state) => state.loadCalendar);

  useEffect(() => {
    void Promise.all([
      loadMedia("anime", { includeNsfw: world === "hidden" }),
      loadMedia("novel", { includeNsfw: world === "hidden" }),
      loadMedia("game", { includeNsfw: world === "hidden" }),
    ]);
  }, [loadMedia, world]);

  useEffect(() => {
    if (!user) {
      return;
    }

    void Promise.all([
      loadRecords(),
      loadFavorites(),
      loadNotifications(),
      loadCalendar(),
    ]);
  }, [loadCalendar, loadFavorites, loadNotifications, loadRecords, user]);

  return null;
}

function ProtectedRoute({ adminOnly = false }: { adminOnly?: boolean }) {
  const user = useStore((state) => state.user);
  const hasToken =
    typeof window !== "undefined" && !!localStorage.getItem("token");

  if (!user || !hasToken) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AppBootstrap />
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected User Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/anime" element={<MediaList type="anime" />} />
            <Route path="/novel" element={<MediaList type="novel" />} />
            <Route path="/game" element={<MediaList type="game" />} />
            <Route path="/anime/:id" element={<MediaDetail type="anime" />} />
            <Route path="/novel/:id" element={<MediaDetail type="novel" />} />
            <Route path="/game/:id" element={<MediaDetail type="game" />} />
            <Route path="/person/:id" element={<PersonDetail />} />
            <Route path="/search" element={<Search />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/my" element={<Dashboard />} />
            <Route path="/my/records" element={<MyRecords />} />
            <Route path="/my/progress" element={<MyRecords />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/notifications" element={<Notifications />} />
          </Route>
        </Route>

        {/* Admin Routes */}
        <Route element={<ProtectedRoute adminOnly />}>
          <Route element={<AdminLayout />}>
            <Route path="/console-admin" element={<AdminConsole />} />
            <Route path="/console-admin/media" element={<AdminMedia />} />
            <Route path="/console-admin/reviews" element={<AdminReviews />} />
            <Route path="/console-admin/calendar" element={<AdminCalendar />} />
            <Route path="/console-admin/import" element={<AdminImport />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
