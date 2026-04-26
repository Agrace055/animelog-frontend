import { useState, useEffect } from "react";
import { useStore } from "../store/atoms";
import { Film, Edit3, Check, X } from "lucide-react";
import { Media, MediaType } from "../types";
import { adminApi } from "../api/admin";
import { ApiError } from "../api/client";

export default function AdminMedia() {
  const animes = useStore((state) => state.animes);
  const novels = useStore((state) => state.novels);
  const games = useStore((state) => state.games);
  const updateMedia = useStore((state) => state.updateMedia);
  const loadMedia = useStore((state) => state.loadMedia);
  const world = useStore((state) => state.world);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Media>>({});
  const [activeTab, setActiveTab] = useState<MediaType>("anime");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadMedia(activeTab, { includeNsfw: true });
  }, [activeTab]);

  const getMediaList = () => {
    return activeTab === "anime"
      ? animes
      : activeTab === "novel"
        ? novels
        : games;
  };

  const handleEdit = (media: Media) => {
    setEditingId(media.id);
    setEditForm(media);
  };

  const handleSave = async () => {
    if (!editingId) return;
    setSaving(true);
    try {
      await adminApi.updateMedia(editingId, {
        title: editForm.title,
        description: editForm.description,
        isNsfw: editForm.isNsfw,
        score: editForm.score,
        status: editForm.status,
      });
      updateMedia(activeTab, editingId, editForm);
      setEditingId(null);
    } catch (e) {
      alert(e instanceof ApiError ? e.message : "保存失败");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
  };

  return (
    <div className="animate-in fade-in duration-500 max-w-5xl mx-auto space-y-6">
      <div className="flex justify-between items-end mb-8">
        <div className="flex items-center gap-3">
          <Film className="w-8 h-8 text-indigo-400" />
          <h1 className="text-3xl font-extrabold text-white">媒体管理</h1>
        </div>
        <div className="flex space-x-2 bg-slate-800 p-1 rounded-xl border border-slate-700">
          <button
            onClick={() => setActiveTab("anime")}
            className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${activeTab === "anime" ? "bg-indigo-500 text-white" : "text-slate-400 hover:text-white"}`}
          >
            动漫
          </button>
          <button
            onClick={() => setActiveTab("novel")}
            className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${activeTab === "novel" ? "bg-indigo-500 text-white" : "text-slate-400 hover:text-white"}`}
          >
            轻小说
          </button>
          <button
            onClick={() => setActiveTab("game")}
            className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${activeTab === "game" ? "bg-indigo-500 text-white" : "text-slate-400 hover:text-white"}`}
          >
            游戏
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {getMediaList().map((media) => (
          <div
            key={media.id}
            className="bg-slate-800 border border-slate-700 rounded-2xl p-4 flex gap-4"
          >
            <img
              src={media.coverImage}
              className="w-20 h-28 object-cover rounded-lg shrink-0 bg-slate-700"
              alt=""
              referrerPolicy="no-referrer"
            />
            <div className="flex-1 min-w-0">
              {editingId === media.id ? (
                <div className="space-y-3">
                  <input
                    className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                    value={editForm.title || ""}
                    onChange={(e) =>
                      setEditForm({ ...editForm, title: e.target.value })
                    }
                    placeholder="标题"
                  />
                  <div className="flex gap-2">
                    <input
                      className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                      value={editForm.year || ""}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          year: parseInt(e.target.value) || 0,
                        })
                      }
                      placeholder="年份"
                    />
                    <input
                      className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                      value={editForm.score || ""}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          score: parseFloat(e.target.value) || 0,
                        })
                      }
                      placeholder="评分"
                    />
                  </div>
                  <select
                    className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                    value={editForm.status || "ongoing"}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        status: e.target.value as any,
                      })
                    }
                  >
                    <option value="ongoing">连载中</option>
                    <option value="completed">已完结</option>
                    <option value="upcoming">即将上映</option>
                  </select>
                  <div className="flex gap-2 justify-end pt-2">
                    <button
                      onClick={handleCancel}
                      className="p-1.5 text-slate-400 hover:text-white bg-slate-700 rounded"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleSave}
                      className="p-1.5 text-emerald-400 hover:text-white bg-emerald-500/20 rounded"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col h-full justify-between pb-1">
                  <div>
                    <div className="flex justify-between items-start gap-2">
                      <h3
                        className="font-bold text-slate-200 line-clamp-1"
                        title={media.title}
                      >
                        {media.title}
                      </h3>
                      <button
                        onClick={() => handleEdit(media)}
                        className="text-slate-500 hover:text-indigo-400 p-1"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {media.year} •{" "}
                      {media.status === "completed" ? "已完结" : "连载中"}{" "}
                      {media.isNsfw && (
                        <span className="text-rose-500 ml-1">NSFW</span>
                      )}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {media.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] px-2 py-0.5 bg-slate-900 text-slate-400 rounded-full border border-slate-700"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
