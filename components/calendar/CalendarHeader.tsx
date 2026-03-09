"use client";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Props = {
  view: "month" | "week";
  setView: (v: "month" | "week") => void;
  currentDate: Date;
  setCurrentDate: (d: Date) => void;
  calendarColor: string;
};

export default function CalendarHeader({
  view,
  setView,
  currentDate,
  setCurrentDate,
  calendarColor,
}: Props) {
  const navigate = (dir: 1 | -1) => {
    const d = new Date(currentDate);
    if (view === "month") d.setMonth(d.getMonth() + dir);
    else d.setDate(d.getDate() + 7 * dir);
    setCurrentDate(d);
  };

  const label =
    view === "month"
      ? currentDate.toLocaleDateString("en-US", {
          month: "long",
          year: "numeric",
        })
      : (() => {
          const start = new Date(currentDate);
          start.setDate(currentDate.getDate() - currentDate.getDay());
          const end = new Date(start);
          end.setDate(start.getDate() + 6);
          return `${start.toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${end.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;
        })();

  return (
    <div className="flex items-center justify-between px-6 py-3 border-b border-[#2a2a2a] bg-[#111111] shrink-0">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="text-[#555] hover:text-white transition-colors p-1 rounded hover:bg-[#1e1e1e]"
        >
          <ChevronLeft size={18} />
        </button>
        <h2 className="text-base font-medium text-white min-w-[180px]">
          {label}
        </h2>
        <button
          onClick={() => navigate(1)}
          className="text-[#555] hover:text-white transition-colors p-1 rounded hover:bg-[#1e1e1e]"
        >
          <ChevronRight size={18} />
        </button>
        <button
          onClick={() => setCurrentDate(new Date())}
          className="text-xs text-[#666] hover:text-white border border-[#333] hover:border-[#555] px-2 py-1 rounded transition-colors ml-1"
        >
          Today
        </button>
      </div>
      <div className="flex items-center gap-1 bg-[#1a1a1a] rounded-lg p-1">
        {(["month", "week"] as const).map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            className="px-3 py-1 text-xs rounded-md transition-all capitalize"
            style={
              view === v
                ? { backgroundColor: calendarColor, color: "white" }
                : { color: "#666" }
            }
          >
            {v}
          </button>
        ))}
      </div>
    </div>
  );
}
