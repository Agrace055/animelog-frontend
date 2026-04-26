import { useState, useEffect } from "react";
import {
  Database,
  Search,
  Settings,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Play,
  Pause,
  Save,
  Filter,
} from "lucide-react";
import clsx from "clsx";
import { bangumiApi } from "../api/bangumi";
import type { BangumiSource, BangumiTask } from "../api/bangumi";
import { ApiError } from "../api/client";

export default function AdminImport() {
  const [activeTab, setActiveTab] = useState<"manual" | "settings" | "history">(
    "manual",
  );

  // Settings State
  const [autoImport, setAutoImport] = useState(true);
  const [cronExp, setCronExp] = useState("0 0 1 * *");

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

  const handleSaveSettings = async () => {
    alert("配置已成功下发至解析服务！");
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
          { id: "history", name: "任务记录", icon: RefreshCw },
          { id: "settings", name: "自动化配置", icon: Settings },
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

      {activeTab === "settings" && (
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 shadow-sm">
          <h3 className="text-white font-bold mb-6 flex items-center gap-2">
            <Filter className="w-5 h-5 text-indigo-400" /> 自动化抓取脚本配置
          </h3>

          <div className="space-y-6 max-w-lg">
            <div className="flex items-center justify-between p-4 bg-slate-900 rounded-xl border border-slate-700">
              <div>
                <div className="font-bold text-slate-200 text-sm">
                  开启每月自动增量拉取
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  Python 后台服务将定时同步 Bangumi 源数据
                </div>
              </div>
              <button
                onClick={() => setAutoImport(!autoImport)}
                className={clsx(
                  "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                  autoImport ? "bg-emerald-500" : "bg-slate-600",
                )}
              >
                <span
                  className={clsx(
                    "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                    autoImport ? "translate-x-6" : "translate-x-1",
                  )}
                />
              </button>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-300 mb-2">
                Cron 表达式
              </label>
              <input
                type="text"
                value={cronExp}
                onChange={(e) => setCronExp(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:border-indigo-500 outline-none font-mono text-sm"
                placeholder="0 0 1 * *"
              />
              <p className="text-xs text-slate-500 mt-2">
                默认每月 1 号执行。将通过 HTTP JSON-RPC 下发到解析模块进行重载。
              </p>
            </div>

            <button
              onClick={handleSaveSettings}
              className="w-full sm:w-auto px-6 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg font-bold text-sm transition flex justify-center items-center gap-2 shadow-lg shadow-indigo-500/20"
            >
              <Save className="w-4 h-4" /> 保存并应用配置
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
