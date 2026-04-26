import { useState, useEffect } from "react";
import {
  Database,
  Search,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Zap,
  Clock,
} from "lucide-react";
import clsx from "clsx";
import { bangumiApi } from "../api/bangumi";
import type { BangumiSource, BangumiTask } from "../api/bangumi";
import { ApiError } from "../api/client";

export default function AdminImport() {
  const [activeTab, setActiveTab] = useState<"manual" | "sync" | "history">(
    "manual",
  );

  // Sync State
  const [syncing, setSyncing] = useState(false);
  const [lastSyncTask, setLastSyncTask] = useState<BangumiTask | null>(null);

  // Search State
  const [searchParams, setSearchParams] = useState({
    year: 2024,
    type: "anime",
    nsfw: false,
  });
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<BangumiSource[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // History State
  const [tasks, setTasks] = useState<BangumiTask[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [archiveSyncing, setArchiveSyncing] = useState(false);

  useEffect(() => {
    if (activeTab === "history") {
      setLoadingTasks(true);
      bangumiApi
        .tasks(50)
        .then(setTasks)
        .catch(() => {})
        .finally(() => setLoadingTasks(false));
    }
  }, [activeTab]);

  const handleManualSync = async () => {
    setSyncing(true);
    try {
      const task = await bangumiApi.createArchiveSyncTask();
      setLastSyncTask(task);
      setActiveTab("history");
      const fresh = await bangumiApi.tasks(50);
      setTasks(fresh);
    } catch (e) {
      alert(e instanceof ApiError ? e.message : "触发同步失败");
    } finally {
      setSyncing(false);
    }
  };

  const handleSearch = async () => {
    setIsSearching(true);
    try {
      const result = await bangumiApi.sources({
        mediaType: searchParams.type,
        year: searchParams.year,
        nsfw: searchParams.nsfw,
      });
      setSearchResults(result.list);
    } catch (e) {
      alert(e instanceof ApiError ? e.message : "搜索失败");
    } finally {
      setIsSearching(false);
    }
  };

  const toggleSelection = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const handleImportSelected = async () => {
    if (selectedIds.size === 0) return;
    try {
      await bangumiApi.createImportTask(Array.from(selectedIds).map(Number));
      setSelectedIds(new Set());
      setActiveTab("history");
      // Reload tasks
      const fresh = await bangumiApi.tasks(50);
      setTasks(fresh);
    } catch (e) {
      alert(e instanceof ApiError ? e.message : "导入失败");
    }
  };

  const handleArchiveSync = async () => {
    setArchiveSyncing(true);
    try {
      await bangumiApi.createArchiveSyncTask();
      alert("归档同步任务已创建！");
    } catch (e) {
      alert(e instanceof ApiError ? e.message : "同步失败");
    } finally {
      setArchiveSyncing(false);
    }
  };

  const parseTaskBangumiIds = (task: BangumiTask): number[] => {
    if (task.taskType !== "business_import" || !task.requestPayload) {
      return [];
    }
    try {
      const payload = JSON.parse(task.requestPayload) as unknown;
      if (!Array.isArray(payload)) {
        return [];
      }
      return payload
        .map((id) => Number(id))
        .filter((id) => Number.isFinite(id) && id > 0);
    } catch {
      return [];
    }
  };

  const handleRetry = (task: BangumiTask) => {
    const bangumiIds = parseTaskBangumiIds(task);
    if (bangumiIds.length === 0) {
      alert("该任务不包含可重试的 Bangumi 条目");
      return;
    }

    bangumiApi
      .createImportTask(bangumiIds)
      .then(() => {
        bangumiApi.tasks(50).then(setTasks);
      })
      .catch(() => {});
  };

  return (
    <div className="animate-in fade-in duration-500 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-8">
        <Database className="w-8 h-8 text-indigo-400" />
        <h1 className="text-3xl font-extrabold text-white">Bangumi 数据导入</h1>
      </div>

      <div className="flex gap-2 border-b border-slate-800 mb-6">
        {[
          { id: "manual", name: "增量导入", icon: Search },
          { id: "history", name: "任务记录", icon: Clock },
          { id: "sync", name: "归档同步", icon: Zap },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as any)}
            className={clsx(
              "px-5 py-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors",
              activeTab === t.id
                ? "border-indigo-500 text-indigo-400"
                : "border-transparent text-slate-400 hover:text-slate-200",
            )}
          >
            <t.icon className="w-4 h-4" /> {t.name}
          </button>
        ))}
      </div>

      {activeTab === "manual" && (
        <div className="space-y-6 bg-slate-900 overflow-hidden">
          {/* Search Bar */}
          <div className="bg-slate-800 p-5 rounded-xl border border-slate-700 flex flex-wrap gap-4 items-end shadow-sm">
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">
                类型
              </label>
              <select
                value={searchParams.type}
                onChange={(e) =>
                  setSearchParams({ ...searchParams, type: e.target.value })
                }
                className="bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:border-indigo-500 outline-none w-32"
              >
                <option value="anime">动漫</option>
                <option value="novel">轻小说</option>
                <option value="game">游戏</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">
                年份
              </label>
              <input
                type="number"
                value={searchParams.year}
                onChange={(e) =>
                  setSearchParams({
                    ...searchParams,
                    year: parseInt(e.target.value) || 2024,
                  })
                }
                className="bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:border-indigo-500 outline-none w-24"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">
                NSFW 状态
              </label>
              <select
                value={searchParams.nsfw ? "true" : "false"}
                onChange={(e) =>
                  setSearchParams({
                    ...searchParams,
                    nsfw: e.target.value === "true",
                  })
                }
                className="bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:border-indigo-500 outline-none w-32"
              >
                <option value="false">排除 NSFW</option>
                <option value="true">包含 NSFW</option>
              </select>
            </div>

            <button
              onClick={handleSearch}
              disabled={isSearching}
              className="px-5 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg font-bold text-sm ml-auto disabled:opacity-50 transition flex items-center gap-2"
            >
              {isSearching ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
              检索源数据
            </button>
          </div>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden shadow-sm">
              <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-800/50">
                <h3 className="text-white font-bold text-sm">
                  检索结果 ({searchResults.length})
                </h3>
                <button
                  onClick={handleImportSelected}
                  disabled={selectedIds.size === 0}
                  className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:hover:bg-emerald-500 text-white rounded font-bold text-xs transition"
                >
                  导入选中项 ({selectedIds.size})
                </button>
              </div>
              <div className="divide-y divide-slate-700">
                {searchResults.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center p-3 hover:bg-slate-700/50 transition"
                  >
                    <div className="pr-4">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(item.id)}
                        onChange={() => toggleSelection(item.id)}
                        className="w-4 h-4 rounded border-slate-500 text-indigo-500 focus:ring-indigo-500 focus:ring-offset-slate-800 bg-slate-900 cursor-pointer"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-white text-sm">
                        {item.title}
                      </div>
                      <div className="text-xs text-slate-400 mt-1 flex gap-2">
                        <span className="bg-slate-900 px-1.5 py-0.5 rounded">
                          {item.id}
                        </span>
                        <span className="bg-slate-900 px-1.5 py-0.5 rounded uppercase">
                          {item.type}
                        </span>
                        <span>{item.year} 年</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === "history" && (
        <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-700 bg-slate-800/50 flex justify-between items-center">
            <h3 className="text-white font-bold text-sm">解析任务记录</h3>
            <button
              onClick={handleArchiveSync}
              disabled={archiveSyncing}
              className="px-3 py-1.5 text-xs font-bold text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 disabled:opacity-50 rounded transition"
            >
              {archiveSyncing ? "同步中..." : "归档同步"}
            </button>
          </div>
          <div className="divide-y divide-slate-700">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="p-4 flex items-center gap-4 transition hover:bg-slate-800/80"
              >
                <div className="shrink-0">
                  {task.status === "success" && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  )}
                  {task.status === "failed" && (
                    <AlertCircle className="w-5 h-5 text-rose-500" />
                  )}
                  {task.status === "pending" && (
                    <RefreshCw className="w-5 h-5 text-indigo-400 animate-spin" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-slate-200 text-sm">
                    {task.taskType === "archive_sync"
                      ? "归档同步任务"
                      : "业务导入任务"}
                  </div>
                  <div className="text-xs text-slate-500 mt-1 font-mono">
                    {new Date(task.createdAt).toLocaleString()} | IDs:{" "}
                    {parseTaskBangumiIds(task).join(",") || "-"}
                  </div>
                  {task.status === "failed" && (
                    <div className="text-xs text-rose-400 mt-1.5 bg-rose-500/10 inline-block px-2 py-0.5 rounded border border-rose-500/20">
                      Error: {task.errorMessage || "未知错误"}
                    </div>
                  )}
                </div>
                {task.status === "failed" && (
                  <button
                    onClick={() => handleRetry(task)}
                    className="px-3 py-1.5 text-xs font-bold text-slate-300 hover:text-white bg-slate-700 hover:bg-slate-600 rounded transition"
                  >
                    重试
                  </button>
                )}
              </div>
            ))}
            {loadingTasks ? (
              <div className="p-8 text-center text-slate-500 text-sm">
                加载中...
              </div>
            ) : tasks.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-sm">
                暂无任务记录
              </div>
            ) : null}
          </div>
        </div>
      )}

      {activeTab === "sync" && (
        <div className="space-y-6">
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 shadow-sm">
            <h3 className="text-white font-bold mb-2 flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-400" /> 一键同步最新 Bangumi
              数据
            </h3>
            <p className="text-sm text-slate-400 mb-6">
              从 Bangumi 官方 Archive
              下载最新数据包，自动解析并写入源数据表，供后续导入使用。
              同步完成后可在「任务记录」中查看详情。
            </p>

            <button
              onClick={handleManualSync}
              disabled={syncing}
              className="px-6 py-3 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white rounded-xl font-bold text-sm transition flex items-center gap-2 shadow-lg shadow-amber-500/20"
            >
              {syncing ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Zap className="w-4 h-4" />
              )}
              {syncing ? "正在提交任务..." : "立即同步"}
            </button>

            {lastSyncTask && (
              <div className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-sm text-emerald-400 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                归档同步任务已创建（ID: {lastSyncTask.id}
                ），正在后台执行，请前往「任务记录」查看进度。
              </div>
            )}
          </div>

          <div className="bg-slate-800 rounded-xl border border-slate-700 p-5 shadow-sm">
            <h4 className="text-slate-300 font-bold text-sm mb-3">使用说明</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li className="flex gap-2">
                <span className="text-indigo-400 shrink-0">•</span>
                系统已内置定时任务，按应用配置中的 cron
                表达式自动执行归档同步，无需 Python 脚本。
              </li>
              <li className="flex gap-2">
                <span className="text-indigo-400 shrink-0">•</span>
                如需立即获取最新数据（如新番季度开始），点击上方按钮手动触发一次归档同步。
              </li>
              <li className="flex gap-2">
                <span className="text-indigo-400 shrink-0">•</span>
                归档同步完成后，前往「增量导入」选择具体条目导入到媒体库。
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
