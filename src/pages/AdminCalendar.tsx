import { useState, useEffect } from "react";
import type React from "react";
import { useStore, CalendarItem } from "../store/atoms";
import {
  Calendar as CalendarIcon,
  Clock,
  Edit3,
  Trash2,
  Check,
  X,
  Plus,
  Save,
} from "lucide-react";
import clsx from "clsx";
import { adminApi } from "../api/admin";
import { ApiError } from "../api/client";

export default function AdminCalendar() {
  const storeItems = useStore((state) => state.calendarItems);
  const updateCalendarItems = useStore((state) => state.updateCalendarItems);
  const loadCalendar = useStore((state) => state.loadCalendar);
  const animes = useStore((state) => state.animes);

  const [localItems, setLocalItems] = useState<CalendarItem[]>(storeItems);
  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadCalendar();
  }, []);

  useEffect(() => {
    if (!hasChanges) {
      setLocalItems(storeItems);
    }
  }, [storeItems, hasChanges]);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<CalendarItem>>({});

  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragTarget, setDragTarget] = useState<{
    day: number;
    time: string;
    clientX: number;
    clientY: number;
  } | null>(null);

  const [isAdding, setIsAdding] = useState(false);
  const [addForm, setAddForm] = useState<Partial<CalendarItem>>({
    dayOfWeek: 0,
    time: "20:00",
    episode: 1,
    mediaId: animes[0]?.id,
  });

  const days = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"];

  const getMediaInfo = (id: string) => animes.find((a) => a.id === id);

  const handleEdit = (item: CalendarItem) => {
    setEditingId(item.id);
    setEditForm(item);
  };

  const handleLocalSave = () => {
    if (editingId) {
      setLocalItems(
        localItems.map((c) => (c.id === editingId ? { ...c, ...editForm } : c)),
      );
      setEditingId(null);
      setHasChanges(true);
    }
  };

  const handleDelete = (id: string) => {
    setLocalItems(localItems.filter((c) => c.id !== id));
    setHasChanges(true);
  };

  const handleAdd = () => {
    if (addForm.mediaId && addForm.time && addForm.episode) {
      const newItem = { ...addForm, id: `c${Date.now()}` } as CalendarItem;
      setLocalItems([...localItems, newItem]);
      setIsAdding(false);
      setHasChanges(true);
    }
  };

  const saveToStore = async () => {
    setSaving(true);
    try {
      // Detect added, updated, deleted items compared to storeItems
      const oldIds = new Set(storeItems.map((i) => i.id));
      const newIds = new Set(localItems.map((i) => i.id));

      const toAdd = localItems.filter((i) => !oldIds.has(i.id));
      const toUpdate = localItems.filter(
        (i) =>
          oldIds.has(i.id) &&
          JSON.stringify(i) !==
            JSON.stringify(storeItems.find((s) => s.id === i.id)),
      );
      const toDelete = storeItems.filter((i) => !newIds.has(i.id));

      const payload = (item: CalendarItem) => ({
        mediaId: Number(item.mediaId),
        dayOfWeek: item.dayOfWeek,
        airTime: item.time,
        episode: item.episode,
      });

      await Promise.all([
        ...toAdd.map((i) => adminApi.createCalendarItem(payload(i))),
        ...toUpdate.map((i) => adminApi.updateCalendarItem(i.id, payload(i))),
        ...toDelete.map((i) => adminApi.deleteCalendarItem(i.id)),
      ]);

      updateCalendarItems(localItems);
      setHasChanges(false);
      alert("已成功保存所有修改！");
      // Reload from server to get real IDs for newly added items
      loadCalendar();
    } catch (e) {
      alert(e instanceof ApiError ? e.message : "保存失败，请重试");
    } finally {
      setSaving(false);
    }
  };

  const onDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData("itemId", id);
    e.dataTransfer.effectAllowed = "move";
    setTimeout(() => {
      setDraggingId(id);
    }, 0);
  };

  const onDragEnd = () => {
    setDraggingId(null);
    setDragTarget(null);
  };

  const onDrop = (e: React.DragEvent, targetDay: number) => {
    e.preventDefault();
    const id = e.dataTransfer.getData("itemId");
    if (id) {
      const timeToSet = dragTarget
        ? dragTarget.time
        : localItems.find((i) => i.id === id)?.time || "20:00";
      setLocalItems(
        localItems.map((i) =>
          i.id === id ? { ...i, dayOfWeek: targetDay, time: timeToSet } : i,
        ),
      );
      setHasChanges(true);
    }
    setDraggingId(null);
    setDragTarget(null);
  };

  const onDragOver = (e: React.DragEvent, dayIndex: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";

    // Map vertical mouse position within the column to 24h
    const rect = e.currentTarget.getBoundingClientRect();
    const relativeY = e.clientY - rect.top;

    // Enforce a minimum virtual scale so even empty columns have dragging space
    const virtualHeight = Math.max(rect.height, 400);
    const boundedY = Math.max(0, Math.min(relativeY, virtualHeight));
    const percent = boundedY / virtualHeight;

    const totalMins = Math.round((percent * 24 * 60) / 10) * 10;
    const hrs = Math.min(23, Math.floor(totalMins / 60));
    const mins = totalMins % 60;
    const time = `${String(hrs).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;

    setDragTarget({
      day: dayIndex,
      time,
      clientX: e.clientX,
      clientY: e.clientY,
    });
  };

  return (
    <div className="animate-in fade-in duration-500 max-w-5xl mx-auto space-y-6">
      <div className="flex justify-between items-end mb-8">
        <div className="flex items-center gap-3">
          <CalendarIcon className="w-8 h-8 text-indigo-400" />
          <h1 className="text-3xl font-extrabold text-white">更新日历管理</h1>
        </div>
        <div className="flex gap-2">
          {hasChanges && (
            <button
              onClick={saveToStore}
              disabled={saving}
              className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-white px-4 py-2 rounded-lg font-bold transition text-sm shadow-lg shadow-emerald-500/20"
            >
              <Save className="w-4 h-4" /> {saving ? "保存中..." : "保存修改"}
            </button>
          )}
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold transition text-sm"
          >
            <Plus className="w-4 h-4" /> 添加排期
          </button>
        </div>
      </div>

      {isAdding && (
        <div className="bg-slate-800 border border-indigo-500/50 rounded-2xl p-4 mb-6 shadow-lg shadow-indigo-500/10 fade-in animate-in">
          <h3 className="text-white font-bold mb-4">新增排期</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1">星期</label>
              <select
                className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                value={addForm.dayOfWeek}
                onChange={(e) =>
                  setAddForm({
                    ...addForm,
                    dayOfWeek: parseInt(e.target.value),
                  })
                }
              >
                {days.map((day, i) => (
                  <option key={i} value={i}>
                    {day}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">时间</label>
              <input
                type="time"
                className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                value={addForm.time}
                onChange={(e) =>
                  setAddForm({ ...addForm, time: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">动漫</label>
              <select
                className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                value={addForm.mediaId}
                onChange={(e) =>
                  setAddForm({ ...addForm, mediaId: e.target.value })
                }
              >
                {animes.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.title}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">
                更新集数
              </label>
              <input
                type="number"
                className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                value={addForm.episode}
                onChange={(e) =>
                  setAddForm({
                    ...addForm,
                    episode: parseInt(e.target.value) || 1,
                  })
                }
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setIsAdding(false)}
              className="px-4 py-2 text-sm font-bold text-slate-400 hover:text-white bg-slate-700 rounded-lg"
            >
              取消
            </button>
            <button
              onClick={handleAdd}
              className="px-4 py-2 text-sm font-bold text-white bg-indigo-500 hover:bg-indigo-600 rounded-lg"
            >
              保存排期
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-7 gap-4 overflow-x-auto pb-4">
        {days.map((dayName, dayIndex) => {
          const itemsForDay = localItems
            .filter((i) => i.dayOfWeek === dayIndex)
            .sort((a, b) => a.time.localeCompare(b.time));
          return (
            <div
              key={dayIndex}
              className="bg-slate-800/40 border border-slate-700/50 rounded-xl min-w-[260px] lg:min-w-0 flex flex-col flex-none snap-center"
            >
              <div className="p-3 border-b border-slate-700/50 flex justify-between items-center bg-slate-800 rounded-t-xl shrink-0 z-20 shadow-sm relative">
                <h3 className="font-bold text-slate-200">{dayName}</h3>
                <span className="text-xs bg-slate-700 text-slate-300 px-2 rounded-full font-mono">
                  {itemsForDay.length}
                </span>
              </div>

              <div
                className="p-2 flex-1 relative min-h-[400px] flex flex-col gap-3 bg-slate-900/30"
                onDrop={(e) => onDrop(e, dayIndex)}
                onDragOver={(e) => onDragOver(e, dayIndex)}
              >
                {itemsForDay.map((item) => {
                  const media = getMediaInfo(item.mediaId);
                  const isEditing = editingId === item.id;

                  return (
                    <div
                      key={item.id}
                      className={clsx(
                        "bg-slate-800 border rounded-xl p-3 flex flex-col gap-2 transition-opacity cursor-grab shadow-sm",
                        isEditing
                          ? "border-indigo-500 shadow-indigo-500/20 z-40"
                          : "border-slate-700 hover:border-slate-500 z-10",
                        item.id === draggingId &&
                          "opacity-30 border-dashed saturate-50 pointer-events-none",
                      )}
                      draggable={!isEditing}
                      onDragStart={(e) => onDragStart(e, item.id)}
                      onDragEnd={onDragEnd}
                    >
                      {isEditing ? (
                        <div className="space-y-2">
                          <div className="flex gap-2">
                            <input
                              type="time"
                              className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                              value={editForm.time}
                              onChange={(e) =>
                                setEditForm({
                                  ...editForm,
                                  time: e.target.value,
                                })
                              }
                            />
                            <input
                              type="number"
                              className="w-16 bg-slate-900 border border-slate-700 rounded p-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                              value={editForm.episode}
                              onChange={(e) =>
                                setEditForm({
                                  ...editForm,
                                  episode: parseInt(e.target.value) || 1,
                                })
                              }
                            />
                          </div>
                          <div className="flex justify-between items-center pt-1 border-t border-slate-700">
                            <button
                              onClick={() => handleDelete(item.id)}
                              className="p-1 text-rose-400 hover:text-white hover:bg-rose-500/20 rounded"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                            <div className="flex gap-1">
                              <button
                                onClick={() => setEditingId(null)}
                                className="p-1 text-slate-400 hover:text-white bg-slate-700 rounded"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={handleLocalSave}
                                className="p-1 text-emerald-400 hover:text-white bg-emerald-500/20 rounded"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex justify-between items-start">
                            <div className="flex items-center gap-1 text-slate-400 text-xs font-bold bg-slate-900/50 px-1.5 py-0.5 rounded">
                              <Clock className="w-3.5 h-3.5" /> {item.time}
                            </div>
                            <button
                              onClick={() => handleEdit(item)}
                              className="text-slate-500 hover:text-indigo-400 p-0.5"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <div className="flex gap-2 items-center">
                            {media?.coverImage && (
                              <img
                                src={media.coverImage}
                                className="w-8 h-10 object-cover rounded shrink-0 bg-slate-700 pointer-events-none"
                                alt=""
                                referrerPolicy="no-referrer"
                              />
                            )}
                            <div className="min-w-0">
                              <h4 className="text-slate-200 font-bold text-xs line-clamp-1">
                                {media?.title || "未知"}
                              </h4>
                              <p className="text-rose-400 text-[10px] font-medium mt-0.5">
                                第 {item.episode} 集
                              </p>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
                {itemsForDay.length === 0 && (
                  <div className="text-center py-6 text-slate-500 text-xs border border-dashed border-slate-700 rounded-lg pointer-events-none">
                    拖拽排列至此
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Global High-Visibility Drag Tooltip */}
      {draggingId && dragTarget && (
        <div
          className="fixed z-[9999] pointer-events-none bg-rose-600 text-white px-4 py-2 rounded-xl font-bold shadow-2xl flex items-center gap-2 border-2 border-white/20 whitespace-nowrap transform -translate-x-1/2 translate-y-[80px]"
          style={{ left: dragTarget.clientX, top: dragTarget.clientY }}
        >
          <Clock className="w-5 h-5 shrink-0" />
          时间设定为: {days[dragTarget.day]} {dragTarget.time}
        </div>
      )}
    </div>
  );
}
