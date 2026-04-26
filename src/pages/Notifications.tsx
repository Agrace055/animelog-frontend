import { useState, useEffect } from "react";
import { useStore } from "../store/atoms";
import { Bell, CheckCircle2, ChevronDown, ChevronUp } from "lucide-react";
import clsx from "clsx";

export default function Notifications() {
  const notifications = useStore((state) => state.notifications);
  const markAllAsRead = useStore(
    (state) => state.markAllNotificationsReadAsync,
  );
  const markAsRead = useStore((state) => state.markNotificationReadAsync);
  const loadNotifications = useStore((state) => state.loadNotifications);

  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleToggle = (id: string, isRead: boolean) => {
    if (!isRead) {
      markAsRead(id);
    }
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 animate-in fade-in duration-500 pb-24 md:pb-8">
      <div className="flex flex-col sm:flex-row justify-between sm:items-end mb-8 gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <Bell className="w-8 h-8 text-rose-500" />
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            通知中心
          </h1>
          {unreadCount > 0 && (
            <span className="bg-rose-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
              {unreadCount} 未读
            </span>
          )}
        </div>

        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-emerald-500 transition-colors bg-slate-50 hover:bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200"
          >
            <CheckCircle2 className="w-4 h-4" /> 全部已读
          </button>
        )}
      </div>

      <div className="space-y-4">
        {notifications.length === 0 ? (
          <div className="text-center py-16 text-slate-500 bg-white rounded-2xl border border-slate-100 border-dashed">
            <Bell className="w-12 h-12 mx-auto text-slate-300 mb-4" />
            暂无任何通知
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className={clsx(
                "border rounded-xl transition-all overflow-hidden",
                notification.isRead
                  ? "bg-white border-slate-200"
                  : "bg-rose-50/30 border-rose-200 shadow-sm shadow-rose-100",
              )}
            >
              <div
                onClick={() =>
                  handleToggle(notification.id, notification.isRead)
                }
                className="p-4 flex gap-4 cursor-pointer hover:bg-slate-50 transition-colors"
              >
                <div className="mt-1 shrink-0">
                  <div
                    className={clsx(
                      "w-2.5 h-2.5 rounded-full mt-1.5",
                      notification.isRead
                        ? "bg-slate-300"
                        : "bg-rose-500 animate-pulse",
                    )}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <h3
                      className={clsx(
                        "font-bold text-sm",
                        notification.isRead
                          ? "text-slate-700"
                          : "text-slate-900",
                      )}
                    >
                      {notification.title}
                    </h3>
                    <span className="text-xs text-slate-400 whitespace-nowrap ml-4">
                      {new Date(notification.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p
                    className={clsx(
                      "text-sm mt-1 transition-all",
                      notification.isRead ? "text-slate-500" : "text-slate-700",
                      expandedId === notification.id
                        ? "line-clamp-none block"
                        : "line-clamp-1 text-ellipsis",
                    )}
                  >
                    {notification.content}
                  </p>
                </div>
                <div className="text-slate-400 shrink-0 flex items-center">
                  {expandedId === notification.id ? (
                    <ChevronUp className="w-5 h-5" />
                  ) : (
                    <ChevronDown className="w-5 h-5" />
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
