import { useState, useEffect } from "react";
import { useStore } from "../store/atoms";
import { ShieldAlert, CheckCircle, XCircle } from "lucide-react";
import { adminApi } from "../api/admin";
import type { BackendNsfwApplication } from "../api/admin";
import { ApiError } from "../api/client";
import { defaultAvatarImage } from "../assets/defaultImages";

export default function AdminConsole() {
  const user = useStore((state) => state.user);
  const [applicants, setApplicants] = useState<BackendNsfwApplication[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    adminApi
      .nsfwApplications()
      .then(setApplicants)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleApprove = async (id: number) => {
    if (!user) return;
    try {
      await adminApi.reviewNsfw(id, "approve", Number(user.id));
      setApplicants((prev) => prev.filter((a) => a.id !== id));
      alert("已通过申请。");
    } catch (e) {
      alert(e instanceof ApiError ? e.message : "操作失败");
    }
  };

  const handleReject = async (id: number) => {
    if (!user) return;
    try {
      await adminApi.reviewNsfw(id, "reject", Number(user.id));
      setApplicants((prev) => prev.filter((a) => a.id !== id));
      alert("已拒绝申请。");
    } catch (e) {
      alert(e instanceof ApiError ? e.message : "操作失败");
    }
  };

  return (
    <div className="animate-in fade-in duration-500 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-8">
        <ShieldAlert className="w-8 h-8 text-indigo-400" />
        <h1 className="text-3xl font-extrabold text-white">控制台总览</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Stats Cards */}
        <div className="bg-slate-800 border border-slate-700 p-6 rounded-2xl">
          <h3 className="text-slate-400 text-sm font-bold tracking-wider uppercase mb-2">
            待审核申请
          </h3>
          <p className="text-3xl font-black text-white">{applicants.length}</p>
        </div>
      </div>

      <div className="space-y-8">
        <section className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-700 bg-slate-800/50">
            <h2 className="font-bold text-slate-200 tracking-wider">
              里世界权限审核
            </h2>
          </div>

          <div className="p-4">
            {loading ? (
              <div className="text-center text-slate-500 py-8">加载中...</div>
            ) : applicants.length === 0 ? (
              <div className="text-center text-slate-500 py-8">
                暂无待审核的申请
              </div>
            ) : (
              <div className="space-y-4">
                {applicants.map((app) => (
                  <div
                    key={app.id}
                    className="flex flex-col gap-4 p-4 border border-slate-700 rounded-xl bg-slate-900/50"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img
                          src={app.avatar ?? defaultAvatarImage}
                          className="w-10 h-10 rounded-full"
                          alt=""
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <p className="font-bold text-slate-200">
                            {app.username}
                          </p>
                          <p className="text-xs text-slate-500">
                            ID: {app.id} • 申请时间:{" "}
                            {app.createdAt?.split("T")[0]}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApprove(app.id)}
                          className="flex items-center gap-1 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 px-3 py-1.5 rounded-lg text-sm font-bold transition"
                        >
                          <CheckCircle className="w-4 h-4" /> 通过
                        </button>
                        <button
                          onClick={() => handleReject(app.id)}
                          className="flex items-center gap-1 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 px-3 py-1.5 rounded-lg text-sm font-bold transition"
                        >
                          <XCircle className="w-4 h-4" /> 拒绝
                        </button>
                      </div>
                    </div>
                    {app.reason && (
                      <div className="bg-slate-800 rounded p-3 text-sm text-slate-300">
                        <span className="text-slate-500 mr-2 font-bold">
                          申请理由:
                        </span>
                        {app.reason}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
