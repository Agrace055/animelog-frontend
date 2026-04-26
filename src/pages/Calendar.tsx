import { useState, useEffect } from "react";
import { Calendar as CalendarIcon, Clock } from "lucide-react";
import { useStore } from "../store/atoms";

function getWeekDates() {
  const now = new Date();
  const day = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((day + 6) % 7));
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

export default function Calendar() {
  const days = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"];
  const weekDates = getWeekDates();
  const todayIndex = (new Date().getDay() + 6) % 7;
  const [activeDay, setActiveDay] = useState(todayIndex);
  const world = useStore((state) => state.world);
  const calendarItems = useStore((state) => state.calendarItems);
  const records = useStore((state) => state.records);
  const animes = useStore((state) => state.animes);
  const loadCalendar = useStore((state) => state.loadCalendar);
  const saveRecordAsync = useStore((state) => state.saveRecordAsync);

  useEffect(() => {
    loadCalendar();
  }, []);

  const handleMarkWatched = (mediaId: string, episode: number) => {
    const existing = records.find(
      (r) => r.mediaId === mediaId && r.type === "anime",
    );
    saveRecordAsync({
      id: existing?.id,
      mediaId,
      type: "anime",
      status: "watching",
      progress: episode,
      rating: existing?.rating ?? 0,
    });
  };

  const itemsForDay = calendarItems.filter((item) => {
    if (item.dayOfWeek !== activeDay) return false;
    const media = animes.find((m) => m.id === item.mediaId);
    if (!media) return false;
    if (world === "hidden" && !media.isNsfw) return false;
    if (world === "normal" && media.isNsfw) return false;
    return true;
  });

  // Group by time
  const groupedItems = itemsForDay.reduce(
    (acc, item) => {
      if (!acc[item.time]) acc[item.time] = [];
      acc[item.time].push(item);
      return acc;
    },
    {} as Record<string, typeof itemsForDay>,
  );

  // Sort times chronologically
  const sortedTimes = Object.keys(groupedItems).sort((a, b) =>
    a.localeCompare(b),
  );

  return (
    <div className="animate-in fade-in duration-500 pb-20 md:pb-0">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-3">
            <CalendarIcon className="w-8 h-8 text-rose-500" /> 更新日历
          </h1>
          <p className="text-slate-500 mt-2 font-medium">
            查看每日更新内容，不错过每一集
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Days Header */}
        <div className="flex overflow-x-auto md:grid md:grid-cols-7 border-b border-slate-100 bg-slate-50/50">
          {days.map((day, i) => (
            <button
              key={day}
              onClick={() => setActiveDay(i)}
              className={`p-4 text-center border-r font-bold shrink-0 w-24 md:w-auto transition-colors focus:outline-none ${activeDay === i ? "text-rose-500 bg-rose-50/30" : "text-slate-500 hover:bg-slate-100"} last:border-r-0 border-slate-100`}
            >
              <div className="text-xs uppercase tracking-wider mb-1">
                {weekDates[i].getMonth() + 1}/{weekDates[i].getDate()}
              </div>
              {day}
            </button>
          ))}
        </div>

        {/* Content View */}
        <div className="p-4 sm:p-6 lg:p-8 space-y-8 min-h-[400px]">
          {sortedTimes.length > 0 ? (
            sortedTimes.map((time, idx) => (
              <div
                key={time}
                className="flex flex-col md:flex-row gap-6 border-l-4 border-rose-500 pl-4 py-2 relative"
              >
                <div className="w-24 shrink-0 flex items-center gap-2 text-rose-500 font-extrabold bg-white z-10 text-lg">
                  <Clock className="w-5 h-5 text-rose-400" /> {time}
                </div>

                {/* Updates */}
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {groupedItems[time].map((item) => {
                    const media = animes.find((m) => m.id === item.mediaId);
                    if (!media) return null;
                    return (
                      <div
                        key={item.id}
                        className="animate-in fade-in zoom-in-95 flex gap-4 p-3 rounded-xl border border-slate-200 hover:shadow-md transition-shadow bg-white"
                      >
                        <img
                          src={media.coverImage}
                          className="w-16 h-24 object-cover rounded-lg shrink-0"
                          alt=""
                          referrerPolicy="no-referrer"
                        />
                        <div className="flex-col flex justify-center">
                          <h4 className="font-bold text-slate-900 text-sm line-clamp-2">
                            {media.title}
                          </h4>
                          <p className="text-slate-500 text-sm font-medium mt-1">
                            第{" "}
                            <span className="text-rose-500 font-bold">
                              {item.episode}
                            </span>{" "}
                            集更新
                          </p>
                          <button
                            onClick={() =>
                              handleMarkWatched(item.mediaId, item.episode)
                            }
                            className="mt-2 text-xs font-semibold px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded w-max transition"
                          >
                            标记已看
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-slate-400 py-20 font-medium">
              本日暂无排期更新
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
