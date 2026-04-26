import { useState, useEffect, useRef } from "react";
import type React from "react";
import { useSearchParams } from "react-router";
import { Search as SearchIcon, Filter } from "lucide-react";
import MediaCard from "../components/common/MediaCard";
import { useStore } from "../store/atoms";
import type { Media } from "../types";

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const q = searchParams.get("q") || "";

  const [query, setQuery] = useState(q);
  const [activeType, setActiveType] = useState("all");
  const [sortBy, setSortBy] = useState("relevance");
  const [results, setResults] = useState<Media[]>([]);
  const [searching, setSearching] = useState(false);
  const searchMedia = useStore((state) => state.searchMedia);
  const world = useStore((state) => state.world);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const type =
          activeType !== "all" && activeType !== "person"
            ? (activeType as any)
            : undefined;
        const list = await searchMedia(query.trim(), type);
        setResults(list);
      } finally {
        setSearching(false);
      }
    }, 400);
  }, [query, activeType]);

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setSearchParams(e.target.value ? { q: e.target.value } : {});
  };

  const sorted = [...results].sort((a, b) => {
    if (sortBy === "rating") return b.score - a.score;
    if (sortBy === "latest") return b.year - a.year;
    return 0;
  });

  const types = [
    { id: "all", name: "全部" },
    { id: "anime", name: "动漫" },
    { id: "novel", name: "轻小说" },
    { id: "game", name: "游戏" },
    { id: "person", name: "人物" },
  ];

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-500 pb-20 md:pb-0">
      {/* Search Header */}
      <div className="w-full max-w-3xl mx-auto mb-8 relative z-10 pt-4 sm:pt-8 text-center">
        <h1 className="text-3xl font-extrabold text-slate-900 mb-6 hidden md:block tracking-tight">
          探索世界
        </h1>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <SearchIcon className="h-5 w-5 text-slate-400 group-focus-within:text-rose-500 transition-colors" />
          </div>
          <input
            type="text"
            autoFocus
            value={query}
            onChange={handleQueryChange}
            className="block w-full pl-11 pr-12 py-3.5 bg-white border border-slate-200 rounded-2xl leading-5 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 sm:text-base shadow-sm hover:shadow transition-shadow"
            placeholder="搜索动漫、轻小说、游戏、人物、标签..."
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <button className="md:hidden p-2 text-slate-400 hover:text-rose-500 rounded-lg">
              <Filter className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Quick Tags */}
        <div className="mt-4 flex flex-wrap justify-center gap-2 px-2">
          {["2024新番", "评分最高", "异世界", "日常", "恋爱"].map((tag) => (
            <button
              key={tag}
              onClick={() => {
                setQuery(tag);
                setSearchParams({ q: tag });
              }}
              className="text-xs font-medium text-slate-500 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-full transition-colors"
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6 lg:gap-10">
        {/* Sidebar Filters (Desktop) */}
        <div className="hidden md:block w-56 shrink-0 space-y-8">
          <div>
            <h3 className="font-bold text-slate-900 mb-4 uppercase tracking-wider text-sm border-b border-slate-100 pb-2">
              分类
            </h3>
            <ul className="space-y-1">
              {types.map((t) => (
                <li key={t.id}>
                  <button
                    onClick={() => setActiveType(t.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg font-medium text-sm transition-colors ${activeType === t.id ? "bg-rose-50 text-rose-500" : "text-slate-600 hover:bg-slate-100"}`}
                  >
                    {t.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-slate-900 mb-4 uppercase tracking-wider text-sm border-b border-slate-100 pb-2">
              排版
            </h3>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full bg-white border border-slate-200 text-sm rounded-lg p-2 focus:ring-2 focus:ring-rose-500"
            >
              <option value="relevance">相关度</option>
              <option value="rating">评分最高</option>
              <option value="latest">最近更新</option>
            </select>
          </div>
        </div>

        {/* Results Area */}
        <div className="flex-1">
          {/* Mobile Categories Tabs */}
          <div className="md:hidden flex overflow-x-auto hide-scrollbar gap-2 mb-6 pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
            {types.map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveType(t.id)}
                className={`px-4 py-1.5 rounded-full whitespace-nowrap text-sm font-medium transition-colors ${activeType === t.id ? "bg-rose-500 text-white shadow-md shadow-rose-200" : "bg-white text-slate-600 border border-slate-200"}`}
              >
                {t.name}
              </button>
            ))}
          </div>

          <div className="mb-4 flex justify-between items-end">
            <h2 className="text-lg font-bold text-slate-900">
              {query ? "搜索结果" : "热门内容"}{" "}
              <span className="text-sm font-medium text-slate-500 font-mono ml-2">
                ({sorted.length})
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {searching ? (
              <div className="col-span-full py-16 text-center text-slate-400">
                搜索中...
              </div>
            ) : (
              sorted.map((media) => (
                <div
                  key={media.id}
                  className="animate-in fade-in slide-in-from-bottom-2 duration-300 fill-mode-both"
                  style={{ animationDelay: `${Math.random() * 150}ms` }}
                >
                  <MediaCard media={media} layout="grid" />
                </div>
              ))
            )}

            {!searching && sorted.length === 0 && query && (
              <div className="col-span-full py-16 text-center text-slate-500 bg-white rounded-2xl border border-slate-100 border-dashed">
                <SearchIcon className="w-10 h-10 mx-auto text-slate-300 mb-4" />
                暂无与 "{query}" 相关的结果
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
