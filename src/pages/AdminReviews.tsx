import { useState, useEffect } from "react";
import { useStore } from "../store/atoms";
import { MessageSquare, CheckCircle, XCircle } from "lucide-react";
import { adminApi } from "../api/admin";
import { ApiError } from "../api/client";

interface ReportedReview {
  id: string;
  mediaId: string;
  userId: string;
  content: string;
  reportReason?: string;
  createdAt: string;
}

export default function AdminReviews() {
  const animes = useStore((state) => state.animes);
  const [reportedReviews, setReportedReviews] = useState<ReportedReview[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    adminApi
      .reportedReviews()
      .then((data) => {
        setReportedReviews(
          data.map((r: any) => ({
            id: String(r.id),
            mediaId: String(r.mediaId),
            userId: String(r.userId),
            content: r.content,
            reportReason: r.reportReason,
            createdAt: r.createdAt,
          })),
        );
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const getMediaInfo = (mediaId: string) =>
    animes.find((a) => a.id === mediaId);

  const handleApprove = async (reviewId: string) => {
    try {
      await adminApi.approveReport(reviewId);
      setReportedReviews((prev) => prev.filter((r) => r.id !== reviewId));
    } catch (e) {
      alert(e instanceof ApiError ? e.message : "操作失败");
    }
  };

  const handleDelete = async (reviewId: string) => {
    try {
      await adminApi.deleteReview(reviewId);
      setReportedReviews((prev) => prev.filter((r) => r.id !== reviewId));
    } catch (e) {
      alert(e instanceof ApiError ? e.message : "删除失败");
    }
  };

  return (
    <div className="animate-in fade-in duration-500 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-8">
        <MessageSquare className="w-8 h-8 text-indigo-400" />
        <h1 className="text-3xl font-extrabold text-white">短评审核</h1>
      </div>

      <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-700 bg-slate-800/50 flex justify-between items-center">
          <h2 className="font-bold text-slate-200 tracking-wider">
            被举报短评列表
          </h2>
          <span className="bg-rose-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
            {reportedReviews.length}
          </span>
        </div>

        <div className="p-4">
          {loading ? (
            <div className="text-center text-slate-500 py-12">加载中...</div>
          ) : reportedReviews.length === 0 ? (
            <div className="text-center text-slate-500 py-12">
              太棒了，所有被举报的短评都处理完毕！
            </div>
          ) : (
            <div className="space-y-4">
              {reportedReviews.map((review) => {
                const media = getMediaInfo(review.mediaId);
                return (
                  <div
                    key={review.id}
                    className="p-4 border border-slate-700 rounded-xl bg-slate-900/50 flex flex-col gap-4"
                  >
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-300">
                            用户 {review.userId}
                          </span>
                          <span className="text-xs text-slate-500">评论了</span>
                          <span className="text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                            {media?.title || "未知内容"}
                          </span>
                        </div>
                        <span className="text-xs text-slate-600">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-slate-200 text-sm mb-3">
                        {review.content}
                      </p>
                      <div className="bg-rose-500/10 border border-rose-500/20 p-3 rounded-lg">
                        <span className="text-rose-400 text-xs font-bold block mb-1">
                          举报理由：
                        </span>
                        <p className="text-rose-200 text-sm">
                          {review.reportReason}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2 justify-end pt-2 border-t border-slate-800">
                      <button
                        onClick={() => handleApprove(review.id)}
                        className="flex items-center gap-1 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 px-3 py-1.5 rounded-lg text-sm font-bold transition"
                      >
                        <CheckCircle className="w-4 h-4" /> 忽略举报
                      </button>
                      <button
                        onClick={() => handleDelete(review.id)}
                        className="flex items-center gap-1 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 px-3 py-1.5 rounded-lg text-sm font-bold transition"
                      >
                        <XCircle className="w-4 h-4" /> 删除该短评
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
