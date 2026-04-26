import { useState, useEffect } from "react";
import type React from "react";
import { MessageCircle, CheckCircle2, XCircle, Clock } from "lucide-react";
import clsx from "clsx";
import { adminApi } from "../api/admin";
import type { BackendFeedback } from "../api/admin";
import { ApiError } from "../api/client";

const TYPE_LABEL: Record<string, string> = {
  suggestion: "建议",
  bug: "问题反馈",
  complaint: "投诉",
};

const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; icon: React.FC<{ className?: string }> }
> = {
  pending: {
    label: "待处理",
    color: "text-amber-400 bg-amber-500/10 border-amber-500/30",
    icon: Clock,
  },
  resolved: {
    label: "已解决",
    color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
    icon: CheckCircle2,
  },
  closed: {
    label: "已关闭",
    color: "text-slate-400 bg-slate-700 border-slate-600",
    icon: XCircle,
  },
};

export default function AdminFeedback() {
  const [feedbacks, setFeedbacks] = useState<BackendFeedback[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("all");

  useEffect(() => {
    setLoading(true);
    adminApi
      .feedbacks()
      .then(setFeedbacks)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleUpdateStatus = async (id: number, status: string) => {
    try {
      await adminApi.updateFeedbackStatus(id, status);
      setFeedbacks((prev) =>
        prev.map((f) => (f.id === id ? { ...f, status } : f)),
      );
    } catch (e) {
      alert(e instanceof ApiError ? e.message : "操作失败");
    }
  };

  const filtered =
    filterStatus === "all"
      ? feedbacks
      : feedbacks.filter((f) => f.status === filterStatus);

  const pendingCount = feedbacks.filter((f) => f.status === "pending").length;

  return (
    <div className="animate-in fade-in duration-500 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-8">
        <MessageCircle className="w-8 h-8 text-indigo-400" />
        <h1 className="text-3xl font-extrabold text-white">用户反馈</h1>
        {pendingCount > 0 && (
          <span className="bg-rose-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
            {pendingCount} 待处理
          </span>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 border-b border-slate-800 mb-4">
        {[
          { id: "all", label: "全部" },
          { id: "pending", label: "待处理" },
          { id: "resolved", label: "已解决" },
          { id: "closed", label: "已关闭" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterStatus(tab.id)}
            className={clsx(
              "px-4 py-2.5 text-sm font-bold border-b-2 transition-colors",
              filterStatus === tab.id
                ? "border-indigo-500 text-indigo-400"
                : "border-transparent text-slate-400 hover:text-slate-200",
            )}
          >
            {tab.label}
            {tab.id !== "all" && (
              <span className="ml-1.5 text-xs text-slate-500">
                ({feedbacks.filter((f) => f.status === tab.id).length})
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-700 bg-slate-800/50 flex justify-between items-center">
          <h2 className="font-bold text-slate-200 tracking-wider text-sm">
            反馈列表
          </h2>
          <span className="text-xs text-slate-500">{filtered.length} 条</span>
        </div>

        <div className="divide-y divide-slate-700">
          {loading ? (
            <div className="text-center text-slate-500 py-12 text-sm">
              加载中...
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center text-slate-500 py-12 text-sm">
              暂无反馈
            </div>
          ) : (
            filtered.map((fb) => {
              const statusCfg =
                STATUS_CONFIG[fb.status] ?? STATUS_CONFIG["pending"];
              const StatusIcon = statusCfg.icon;
              return (
                <div
                  key={fb.id}
                  className="p-5 flex flex-col gap-3 hover:bg-slate-800/80 transition"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-700 text-slate-300">
                        {TYPE_LABEL[fb.type] ?? fb.type}
                      </span>
                      <span className="text-xs text-slate-500">
                        用户 {fb.userId}
                      </span>
                      <span className="text-xs text-slate-600">
                        {fb.createdAt?.split("T")[0]}
                      </span>
                    </div>
                    <span
                      className={clsx(
                        "text-xs font-bold px-2 py-0.5 rounded border flex items-center gap-1",
                        statusCfg.color,
                      )}
                    >
                      <StatusIcon className="w-3 h-3" />
                      {statusCfg.label}
                    </span>
                  </div>

                  <p className="text-sm text-slate-200 leading-relaxed bg-slate-900/60 p-3 rounded-lg">
                    {fb.content}
                  </p>

                  {fb.status === "pending" && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleUpdateStatus(fb.id, "resolved")}
                        className="px-3 py-1.5 text-xs font-bold text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded transition"
                      >
                        标记已解决
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(fb.id, "closed")}
                        className="px-3 py-1.5 text-xs font-bold text-slate-400 bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded transition"
                      >
                        关闭
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
