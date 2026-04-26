import { useEffect } from "react";
import { useStore } from "../store/atoms";
import { useSearchParams } from "react-router";
import MediaCard from "../components/common/MediaCard";

export default function MyRecords() {
  const [searchParams, setSearchParams] = useSearchParams();
  const records = useStore((state) => state.records);
  const world = useStore((state) => state.world);
  const animes = useStore((state) => state.animes);
  const novels = useStore((state) => state.novels);
  const games = useStore((state) => state.games);
  const loadRecords = useStore((state) => state.loadRecords);
  const loadFavorites = useStore((state) => state.loadFavorites);

  useEffect(() => {
    loadRecords();
    loadFavorites();
  }, []);

  const statusFilter = searchParams.get("status") || "all";
  const typeFilter = searchParams.get("type") || "all";

  // Map records to media
  const displayItems = records
    .map((record) => {
      const list =
        record.type === "anime"
          ? animes
          : record.type === "novel"
            ? novels
            : games;
      const media = list.find((m) => m.id === record.mediaId);
      return { record, media };
    })
    .filter((item) => {
      if (!item.media) return false;

      // World Filter
      if (world === "hidden" && !item.media.isNsfw) return false;
      if (world === "normal" && item.media.isNsfw) return false;

      // Type Filter
      if (typeFilter !== "all" && item.record.type !== typeFilter) return false;

      // Status Filter
      if (statusFilter !== "all" && item.record.status !== statusFilter)
        return false;

      return true;
    });

  const statuses = [
    { id: "all", label: "全部" },
    { id: "want", label: "想看/读" },
    { id: "watching", label: "在看/读" },
    { id: "watched", label: "已看/读" },
    { id: "paused", label: "搁置" },
    { id: "dropped", label: "弃坑" },
  ];

  const types = [
    { id: "all", label: "全部" },
    { id: "anime", label: "动漫" },
    { id: "novel", label: "轻小说" },
    { id: "game", label: "游戏" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-500 pb-24 md:pb-8">
      <div className="flex flex-col md:flex-row justify-between md:items-end mb-8 gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            我的记录
          </h1>
          <p className="text-slate-500 font-medium mt-1">
            管理你的追番与追书进度
          </p>
        </div>

        <div className="flex flex-wrap gap-4">
          <select
            value={typeFilter}
            onChange={(e) =>
              setSearchParams((prev) => {
                prev.set("type", e.target.value);
                return prev;
              })
            }
            className="bg-white border border-slate-200 text-sm rounded-lg p-2 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-rose-500"
          >
            {types.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) =>
              setSearchParams((prev) => {
                prev.set("status", e.target.value);
                return prev;
              })
            }
            className="bg-white border border-slate-200 text-sm rounded-lg p-2 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-rose-500"
          >
            {statuses.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
        {displayItems.map(({ record, media }) => (
          <MediaCard
            key={record.id}
            media={media!}
            layout="grid"
            progress={
              record.status === "watching" ? record.progress : undefined
            }
          />
        ))}
        {displayItems.length === 0 && (
          <div className="col-span-full py-16 text-center text-slate-500 bg-white rounded-2xl border border-slate-100 border-dashed">
            没有找到符合的记录
          </div>
        )}
      </div>
    </div>
  );
}
