import { useState, useMemo, useEffect } from "react";
import { useParams, Link } from "react-router";
import {
  Star,
  Heart,
  Share2,
  Info,
  Users,
  MessageSquare,
  Flame,
  ThumbsUp,
  ThumbsDown,
  AlertTriangle,
} from "lucide-react";
import clsx from "clsx";
import MediaCard from "../components/common/MediaCard";
import MediaTags from "../components/ui/MediaTags";
import { useStore, MediaRecord } from "../store/atoms";
import { MediaType } from "../types";

export default function MediaDetail({ type }: { type: MediaType }) {
  const { id } = useParams<{ id: string }>();
  const animes = useStore((state) => state.animes);
  const novels = useStore((state) => state.novels);
  const games = useStore((state) => state.games);
  const allReviews = useStore((state) => state.reviews);
  const records = useStore((state) => state.records);
  const favoriteIds = useStore((state) => state.favoriteIds);
  const user = useStore((state) => state.user);
  const loadReviews = useStore((state) => state.loadReviews);
  const createReviewAsync = useStore((state) => state.createReviewAsync);
  const likeReviewAsync = useStore((state) => state.likeReviewAsync);
  const dislikeReviewAsync = useStore((state) => state.dislikeReviewAsync);
  const reportReviewAsync = useStore((state) => state.reportReviewAsync);
  const toggleFavoriteAsync = useStore((state) => state.toggleFavoriteAsync);
  const saveRecordAsync = useStore((state) => state.saveRecordAsync);

  const mediaList =
    type === "anime" ? animes : type === "novel" ? novels : games;
  const media = mediaList.find((m) => m.id === id) || mediaList[0];

  const existingRecord = records.find(
    (r) => r.mediaId === id && r.type === type,
  );
  const isFavorited = favoriteIds.includes(id || "");

  const [activeTab, setActiveTab] = useState<
    "info" | "characters" | "staff" | "reviews" | "recommend"
  >("info");
  const [reviewContent, setReviewContent] = useState("");
  const [reviewRating, setReviewRating] = useState(0);

  useEffect(() => {
    if (id) loadReviews(id);
  }, [id]);

  const handleStatusChange = (status: string) => {
    if (!media) return;
    saveRecordAsync({
      id: existingRecord?.id,
      mediaId: media.id,
      type: media.type,
      status: status as MediaRecord["status"],
      progress: existingRecord?.progress ?? 0,
      rating: existingRecord?.rating ?? 0,
    });
  };

  const handleRatingClick = (rating: number) => {
    if (!media) return;
    saveRecordAsync({
      id: existingRecord?.id,
      mediaId: media.id,
      type: media.type,
      status: existingRecord?.status ?? "watching",
      progress: existingRecord?.progress ?? 0,
      rating,
    });
  };

  const handleProgressChange = (delta: number) => {
    if (!media) return;
    const max =
      media.type === "anime"
        ? media.episodes || 0
        : media.type === "novel"
          ? media.volumes || 0
          : media.chapters || 0;
    const current = existingRecord?.progress || 0;
    const next = Math.max(0, Math.min(current + delta, max));
    saveRecordAsync({
      id: existingRecord?.id,
      mediaId: media.id,
      type: media.type,
      status: existingRecord?.status ?? "watching",
      progress: next,
      rating: existingRecord?.rating ?? 0,
    });
  };

  const handlePostReview = async () => {
    if (!reviewContent.trim() || !user || !media) return;
    await createReviewAsync(media.id, reviewContent.trim(), reviewRating);
    setReviewContent("");
    setReviewRating(0);
  };

  const handleReport = async (reviewId: string) => {
    const reason = window.prompt("请输入举报理由：");
    if (reason) {
      try {
        await reportReviewAsync(reviewId, reason);
        alert("举报已提交，感谢您的反馈！");
      } catch {
        alert("举报提交失败，请稍后重试。");
      }
    }
  };

  const handleShare = () => {
    navigator.clipboard
      ?.writeText(window.location.href)
      .then(() => alert("链接已复制到剪贴板"));
  };

  const mediaReviews = useMemo(() => {
    return allReviews.filter(
      (r) => r.mediaId === media?.id && r.status === "approved",
    );
  }, [allReviews, media]);

  const currentRecord = records.find(
    (r) => r.mediaId === id && r.type === type,
  );
  const currentStatus = currentRecord?.status || "want";
  const currentRating = currentRecord?.rating || 0;
  const currentProgress = currentRecord?.progress || 0;

  if (!media) return <div className="p-8 text-center">未找到该作品</div>;

  const tabs = [
    { id: "info", name: "简介", icon: Info },
    { id: "characters", name: "角色", icon: Users },
    { id: "staff", name: "制作人员", icon: Star },
    { id: "reviews", name: "短评", icon: MessageSquare },
    { id: "recommend", name: "推荐", icon: Flame },
  ] as const;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20 md:pb-0">
      {/* Hero Section */}
      <div className="relative -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-8 mb-8 bg-slate-900 border-b border-slate-800">
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
          <img
            src={media.coverImage}
            className="w-full h-full object-cover blur-3xl"
            alt="blur bg"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto flex flex-col md:flex-row gap-6 md:gap-10">
          {/* Cover & Quick Actions */}
          <div className="w-40 sm:w-56 shrink-0 mx-auto md:mx-0">
            <div className="aspect-[3/4] w-full rounded-xl overflow-hidden shadow-2xl ring-1 ring-white/10 mb-4 bg-slate-800">
              <img
                src={media.coverImage}
                alt={media.title}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => toggleFavoriteAsync(id || "")}
                className={clsx(
                  "flex-1 text-sm py-2 rounded-lg transition flex items-center justify-center gap-1.5 backdrop-blur-sm",
                  isFavorited
                    ? "bg-rose-500/80 text-white"
                    : "bg-white/10 hover:bg-white/20 text-white",
                )}
              >
                <Heart
                  className={clsx("w-4 h-4", isFavorited && "fill-white")}
                />{" "}
                收藏
              </button>
              <button
                onClick={handleShare}
                className="flex-1 bg-white/10 hover:bg-white/20 text-white text-sm py-2 rounded-lg transition flex items-center justify-center gap-1.5 backdrop-blur-sm"
              >
                <Share2 className="w-4 h-4" /> 分享
              </button>
            </div>
          </div>

          {/* Title & Status Form */}
          <div className="flex-1 text-white py-2 flex flex-col items-center md:items-start text-center md:text-left">
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-1">
              {media.title}
            </h1>
            {media.originalTitle && (
              <p className="text-slate-400 text-sm sm:text-base font-medium mb-2">
                {media.originalTitle}
              </p>
            )}

            <MediaTags tags={media.tags} />

            {/* Unified Action Bar (Status, Rating, Progress) */}
            <div className="w-full max-w-lg bg-slate-800/80 backdrop-blur-md rounded-2xl p-4 sm:p-5 ring-1 ring-white/10 shadow-xl mt-auto">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 sm:col-span-1 border-b sm:border-b-0 sm:border-r border-slate-700/50 pb-4 sm:pb-0 sm:pr-4">
                  <label className="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider">
                    记录状态
                  </label>
                  <select
                    value={currentStatus}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    className="w-full appearance-none bg-slate-900/50 border border-slate-700 text-white text-sm rounded-lg py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition cursor-pointer"
                  >
                    <option value="want">想看</option>
                    <option value="watching">在看</option>
                    <option value="watched">看过</option>
                    <option value="paused">搁置</option>
                    <option value="dropped">弃坑</option>
                  </select>
                </div>

                <div className="col-span-2 sm:col-span-1 sm:pl-2">
                  <label className="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider">
                    我的评分
                  </label>
                  <div className="flex gap-1 mt-2.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        onClick={() => handleRatingClick(star)}
                        className={clsx(
                          "w-6 h-6 cursor-pointer transition-colors",
                          star <= currentRating
                            ? "text-amber-400 fill-amber-400"
                            : "text-slate-600 hover:text-amber-400",
                        )}
                        strokeWidth={1.5}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="col-span-2 mt-4 pt-4 border-t border-slate-700/50 flex flex-col sm:flex-row items-center gap-3">
                <label className="text-xs font-medium text-slate-400 uppercase tracking-wider sm:w-16 text-left">
                  进度
                </label>
                <div className="flex-1 flex items-center bg-slate-900/50 rounded-lg p-1 border border-slate-700">
                  <button
                    onClick={() => handleProgressChange(-1)}
                    className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-white rounded-md hover:bg-slate-800"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    value={currentProgress}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 0;
                      if (!media) return;
                      saveRecordAsync({
                        id: existingRecord?.id,
                        mediaId: media.id,
                        type: media.type,
                        status: existingRecord?.status ?? "watching",
                        progress: val,
                        rating: existingRecord?.rating ?? 0,
                      });
                    }}
                    className="w-12 text-center bg-transparent border-none text-white focus:ring-0 p-0 text-lg font-medium"
                  />
                  <button
                    onClick={() => handleProgressChange(1)}
                    className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-white rounded-md hover:bg-slate-800"
                  >
                    +
                  </button>
                </div>
                <div className="text-slate-400 text-sm font-medium w-16 text-center">
                  /{" "}
                  {media.type === "anime"
                    ? `${media.episodes} 集`
                    : media.type === "novel"
                      ? `${media.volumes || "?"} 卷`
                      : `${media.chapters || "?"} 章`}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="max-w-5xl mx-auto flex flex-col lg:flex-row gap-8">
        {/* Left Column (Main Content) */}
        <div className="flex-1 min-w-0">
          {/* Tabs */}
          <div className="flex overflow-x-auto hide-scrollbar border-b border-slate-200 mb-6 bg-slate-50 sticky top-16 z-30 pt-2 -mx-4 px-4 sm:mx-0 sm:px-0 rounded-t-xl">
            {tabs.map((tab) => {
              const TabIcon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={clsx(
                    "flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors",
                    activeTab === tab.id
                      ? "border-rose-500 text-rose-500"
                      : "border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300",
                  )}
                >
                  <TabIcon className="w-4 h-4" />
                  {tab.name}
                </button>
              );
            })}
          </div>

          {/* Tab Panes */}
          <div className="bg-white rounded-xl sm:p-6 p-4 border border-slate-200 shadow-sm min-h-[300px]">
            {activeTab === "info" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-3">
                    简介
                  </h3>
                  <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">
                    {media.description ||
                      "暂无简介。勇者辛美尔一行人打倒魔王，为世界带来和平之后……精灵魔法使芙莉莲的「后日谈」奇幻故事。"}
                  </p>
                </div>
              </div>
            )}
            {activeTab === "characters" && (
              <div>
                {/* Characters Section */}
                {media.characters && media.characters.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {media.characters.map((char) => (
                      <Link
                        key={char.id}
                        to={`/person/${encodeURIComponent(char.cvName)}`}
                        className="flex items-center gap-3 p-3 bg-white border border-slate-100 rounded-xl shadow-sm hover:shadow-md hover:border-indigo-200 transition cursor-pointer group"
                      >
                        <img
                          src={char.avatarUrl}
                          alt={char.name}
                          className="w-12 h-12 rounded-full object-cover bg-slate-200 shrink-0 group-hover:ring-2 group-hover:ring-indigo-100 transition-all"
                          referrerPolicy="no-referrer"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="font-bold text-slate-800 text-sm group-hover:text-indigo-600 transition-colors">
                            {char.name}
                          </div>
                          <div className="text-xs text-slate-500 mt-0.5">
                            CV: {char.cvName}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-slate-500 text-sm py-4 text-center border border-dashed border-slate-200 rounded-xl">
                    暂无相关角色信息
                  </div>
                )}
              </div>
            )}

            {activeTab === "staff" && (
              <div>
                {/* Staff Section */}
                {media.staff && media.staff.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {media.staff.map((p) => (
                      <Link
                        key={p.id}
                        to={`/person/${encodeURIComponent(p.name)}`}
                        className="flex items-center gap-3 p-3 bg-white border border-slate-100 rounded-xl shadow-sm hover:shadow-md hover:border-indigo-200 transition cursor-pointer group"
                      >
                        <img
                          src={p.avatarUrl}
                          alt={p.name}
                          className="w-12 h-12 rounded-full object-cover bg-slate-200 shrink-0 group-hover:ring-2 group-hover:ring-indigo-100 transition-all"
                          referrerPolicy="no-referrer"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="font-bold text-slate-800 text-sm group-hover:text-indigo-600 transition-colors">
                            {p.name}
                          </div>
                          <div className="text-xs text-slate-400 mt-0.5">
                            {p.role}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-slate-500 text-sm py-4 text-center border border-dashed border-slate-200 rounded-xl">
                    暂无制作人员信息
                  </div>
                )}
              </div>
            )}
            {activeTab === "reviews" && (
              <div className="space-y-6">
                {/* Write review */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <textarea
                    value={reviewContent}
                    onChange={(e) => setReviewContent(e.target.value)}
                    placeholder="写下你的短评..."
                    className="w-full bg-white border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none resize-none h-24 mb-3"
                  ></textarea>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-slate-500">评分:</span>
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            onClick={() => setReviewRating(s)}
                            className={clsx(
                              "w-5 h-5 cursor-pointer transition-colors",
                              s <= reviewRating
                                ? "text-amber-400 fill-amber-400"
                                : "text-slate-300 hover:text-amber-400",
                            )}
                          />
                        ))}
                      </div>
                    </div>
                    <button
                      onClick={handlePostReview}
                      className="bg-rose-500 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-rose-600 disabled:opacity-50"
                    >
                      发布
                    </button>
                  </div>
                </div>

                {/* Review items */}
                <div className="space-y-4">
                  {mediaReviews.length === 0 ? (
                    <div className="text-center py-8 text-slate-500 text-sm">
                      暂无短评，来抢沙发吧！
                    </div>
                  ) : (
                    mediaReviews.map((review) => (
                      <div
                        key={review.id}
                        className="flex gap-4 border-b border-slate-100 pb-4 last:border-0 last:pb-0"
                      >
                        <img
                          src={`https://picsum.photos/seed/${review.userId}/40/40`}
                          className="w-10 h-10 rounded-full bg-slate-200 shrink-0"
                          alt="avatar"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start mb-1">
                            <div>
                              <div className="font-semibold text-slate-900 text-sm">
                                用户 {review.userId}
                              </div>
                              <div className="flex items-center gap-2 mt-0.5">
                                <div className="flex text-amber-500">
                                  {[1, 2, 3, 4, 5].map((s) => (
                                    <Star
                                      key={s}
                                      className="w-3 h-3 fill-current"
                                    />
                                  ))}
                                </div>
                                <span className="text-xs text-slate-400">
                                  {new Date(
                                    review.createdAt,
                                  ).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>
                          <p className="text-slate-700 text-sm mt-2 mb-3">
                            {review.content}
                          </p>
                          <div className="flex items-center gap-4 text-xs font-medium">
                            <button
                              onClick={() => likeReviewAsync(review.id)}
                              className="flex items-center gap-1.5 text-slate-500 hover:text-emerald-500 transition-colors"
                            >
                              <ThumbsUp className="w-3.5 h-3.5" />{" "}
                              {review.likes > 0 && review.likes}
                            </button>
                            <button
                              onClick={() => dislikeReviewAsync(review.id)}
                              className="flex items-center gap-1.5 text-slate-500 hover:text-rose-500 transition-colors"
                            >
                              <ThumbsDown className="w-3.5 h-3.5" />{" "}
                              {review.dislikes > 0 && review.dislikes}
                            </button>
                            <button
                              onClick={() => handleReport(review.id)}
                              className="flex items-center gap-1.5 text-slate-500 hover:text-amber-500 transition-colors ml-auto"
                            >
                              <AlertTriangle className="w-3.5 h-3.5" /> 举报
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
            {activeTab === "recommend" && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {animes.slice(0, 3).map((m) => (
                  <MediaCard key={m.id} media={m} layout="grid" />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (Sidebar Meta) */}
        <div className="w-full lg:w-72 shrink-0 space-y-6">
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
              作品信息
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">媒体类型</span>
                <span className="font-medium text-slate-900 uppercase">
                  {media.type}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">首播/发行</span>
                <span className="font-medium text-slate-900">{media.year}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">
                  {media.type === "anime"
                    ? "集数"
                    : media.type === "novel"
                      ? "卷数"
                      : "章节"}
                </span>
                <span className="font-medium text-slate-900">
                  {media.type === "anime"
                    ? media.episodes
                    : media.type === "novel"
                      ? media.volumes || "未知"
                      : media.chapters || "未知"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">状态</span>
                <span className="font-medium text-indigo-600">
                  {media.status === "completed"
                    ? "已完结"
                    : media.status === "ongoing"
                      ? "连载中"
                      : "未更新"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">平均评分</span>
                <span className="font-bold text-amber-500 flex items-center gap-1">
                  <Star className="w-4 h-4 fill-current" />{" "}
                  {media.score.toFixed(1)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
