import { useState, useEffect } from "react";
import { useLocation } from "react-router";
import MediaCard from "../components/common/MediaCard";
import { useStore } from "../store/atoms";
import { MediaType } from "../types";

export default function MediaList({ type }: { type: MediaType }) {
  const [yearFilter, setYearFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("latest");
  const world = useStore((state) => state.world);
  const isAnime = type === "anime";
  const isNovel = type === "novel";
  const animes = useStore((state) => state.animes);
  const novels = useStore((state) => state.novels);
  const games = useStore((state) => state.games);
  const loadMedia = useStore((state) => state.loadMedia);
  const loading = useStore((state) => state.loading);

  useEffect(() => {
    loadMedia(type, { includeNsfw: world === "hidden" });
  }, [type, world]);

  const baseMediaList =
    type === "anime" ? animes : type === "novel" ? novels : games;
  const isLoading = loading[`media_${type}`];

  const filtered = baseMediaList.filter((media) => {
    if (world === "hidden" && !media.isNsfw) return false;
    if (world === "normal" && media.isNsfw) return false;
    if (yearFilter !== "all" && media.year.toString() !== yearFilter)
      return false;
    if (statusFilter === "ongoing" && media.status !== "ongoing") return false;
    if (statusFilter === "completed" && media.status !== "completed")
      return false;
    return true;
  });

  const mediaList = [...filtered].sort((a, b) => {
    if (sortBy === "rating") return b.score - a.score;
    return 0;
  });

  const availableYears = Array.from(
    new Set(baseMediaList.map((m) => m.year)),
  ).sort((a, b) => b - a);

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            {isAnime ? "全部动漫" : isNovel ? "全部轻小说" : "全部游戏"}
          </h1>
          <p className="text-slate-500 mt-2 text-sm font-medium">
            浏览和发现最受欢迎的
            {isAnime ? "动画剧集和电影" : isNovel ? "轻小说作品" : "游戏作品"}
          </p>
        </div>

        {/* Quick Filters */}
        <div className="mt-4 sm:mt-0 flex gap-2">
          <select
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
            className="bg-white border border-slate-200 text-sm font-medium rounded-lg px-3 py-2 focus:ring-2 focus:ring-rose-500 cursor-pointer"
          >
            <option value="all">全部年份</option>
            {availableYears.map((year) => (
              <option key={year} value={year.toString()}>
                {year}
              </option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white border border-slate-200 text-sm font-medium rounded-lg px-3 py-2 focus:ring-2 focus:ring-rose-500 cursor-pointer"
          >
            <option value="all">全部状态</option>
            <option value="ongoing">连载中</option>
            <option value="completed">已完结</option>
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-white border border-slate-200 text-sm font-medium rounded-lg px-3 py-2 focus:ring-2 focus:ring-rose-500 cursor-pointer"
          >
            <option value="latest">最新更新</option>
            <option value="rating">最高评分</option>
            <option value="popular">热门关注</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 pb-20 md:pb-0">
        {isLoading ? (
          <div className="col-span-full py-20 text-center text-slate-400">
            加载中...
          </div>
        ) : mediaList.length === 0 ? (
          <div className="col-span-full py-20 text-center text-slate-400">
            暂无内容
          </div>
        ) : (
          mediaList.map((media) => (
            <MediaCard key={media.id} media={media} layout="grid" />
          ))
        )}
      </div>
    </div>
  );
}
