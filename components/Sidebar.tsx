"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Settings,
  Plus,
  Pencil,
  ChevronsLeft,
  ChevronsRight,
  Calendar,
  LogOut,
  GripVertical,
  AlertTriangle,
} from "lucide-react";

type CalendarProfile = {
  id: string;
  name: string;
  color: string;
  position: number;
};
type User = {
  id: string;
  email: string;
  avatar_url: string | null;
  full_name: string | null;
};

const COLORS = [
  "#6366f1",
  "#ec4899",
  "#f97316",
  "#22c55e",
  "#06b6d4",
  "#a855f7",
  "#eab308",
  "#ef4444",
];

export default function Sidebar({ user }: { user: User }) {
  const supabase = createClient();
  const [collapsed, setCollapsed] = useState(false);
  const [calendars, setCalendars] = useState<CalendarProfile[]>([]);
  const [activeCalendar, setActiveCalendar] = useState<string>("all");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [showProfile, setShowProfile] = useState(false);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<CalendarProfile | null>(
    null,
  );

  useEffect(() => {
    supabase
      .from("calendars")
      .select("*")
      .eq("user_id", user.id)
      .order("position")
      .then(({ data }) => {
        if (data && data.length > 0) {
          setCalendars(data);
        } else if (data) {
          // If no position set yet, assign positions
          const withPositions = data.map((c, i) => ({ ...c, position: i }));
          setCalendars(withPositions);
        }
      });
  }, []);

  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent("calendarChange", { detail: activeCalendar }),
    );
  }, [activeCalendar]);

  const addCalendar = async () => {
    const position = calendars.length;
    const { data } = await supabase
      .from("calendars")
      .insert({
        user_id: user.id,
        name: "New Calendar",
        color: COLORS[calendars.length % COLORS.length],
        position,
      })
      .select()
      .single();
    if (data) setCalendars((prev) => [...prev, data]);
  };

  const updateCalendar = async (
    id: string,
    updates: Partial<CalendarProfile>,
  ) => {
    await supabase.from("calendars").update(updates).eq("id", id);
    setCalendars((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c)),
    );
  };

  const deleteCalendar = async (cal: CalendarProfile) => {
    if (calendars.length <= 1) return;
    await supabase.from("calendars").delete().eq("id", cal.id);
    setCalendars((prev) => prev.filter((c) => c.id !== cal.id));
    if (activeCalendar === cal.id) setActiveCalendar("all");
    setDeleteConfirm(null);
    setEditingId(null);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/auth/login";
  };

  const handleDragStart = (id: string) => setDraggedId(id);
  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    setDragOverId(id);
  };
  const handleDrop = async (targetId: string) => {
    if (!draggedId || draggedId === targetId) {
      setDraggedId(null);
      setDragOverId(null);
      return;
    }
    const newOrder = [...calendars];
    const fromIdx = newOrder.findIndex((c) => c.id === draggedId);
    const toIdx = newOrder.findIndex((c) => c.id === targetId);
    const [moved] = newOrder.splice(fromIdx, 1);
    newOrder.splice(toIdx, 0, moved);

    // Update positions
    const withNewPositions = newOrder.map((c, i) => ({ ...c, position: i }));
    setCalendars(withNewPositions);
    setDraggedId(null);
    setDragOverId(null);

    // Save new order to Supabase
    await Promise.all(
      withNewPositions.map((c) =>
        supabase
          .from("calendars")
          .update({ position: c.position })
          .eq("id", c.id),
      ),
    );
  };

  const fallbackAvatar = `https://api.dicebear.com/7.x/initials/svg?seed=${user.email}&backgroundColor=333333&textColor=ffffff&fontSize=40`;
  const avatarSrc = user.avatar_url || fallbackAvatar;
  const displayName = user.full_name || user.email;

  return (
    <aside
      className={`h-full bg-[#161616] border-r border-[#2a2a2a] flex flex-col shrink-0 overflow-hidden transition-[width] duration-300 ease-in-out ${collapsed ? "w-14" : "w-60"}`}
    >
      {/* Delete confirmation modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setDeleteConfirm(null)}
          />
          <div className="relative bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6 w-96 shadow-2xl z-10">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center shrink-0 mt-0.5">
                <AlertTriangle size={15} className="text-red-400" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-white mb-1">
                  Delete Calendar
                </h3>
                <p className="text-sm text-[#888] leading-relaxed">
                  Are you sure you want to delete{" "}
                  <span className="text-white font-medium">
                    "{deleteConfirm.name}"
                  </span>
                  ? All tasks in this calendar will be{" "}
                  <span className="text-red-400 font-medium">
                    permanently deleted.
                  </span>
                </p>
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-sm text-[#888] hover:text-white border border-[#333] hover:border-[#555] rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteCalendar(deleteConfirm)}
                className="px-4 py-2 text-sm text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top: Logo + collapse */}
      <div className="flex items-center border-b border-[#2a2a2a] py-3 px-3 gap-2">
        <div
          className={`flex-1 overflow-hidden transition-all duration-300 ${collapsed ? "w-0 opacity-0" : "w-full opacity-100"}`}
        >
          <h1 className="text-base font-bold tracking-tight text-white whitespace-nowrap">
            Planner
          </h1>
        </div>
        <button
          onClick={() => {
            setCollapsed(!collapsed);
            if (!collapsed) setShowProfile(false);
          }}
          className="text-[#555] hover:text-white transition-colors p-1 rounded hover:bg-[#222] shrink-0"
        >
          {collapsed ? <ChevronsRight size={16} /> : <ChevronsLeft size={16} />}
        </button>
      </div>

      {/* Calendars list */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden py-3 flex flex-col gap-1">
        {/* ALL calendars */}
        <div
          onClick={() => setActiveCalendar("all")}
          className={`flex items-center gap-3 cursor-pointer transition-colors mb-1 px-3 py-2
            ${activeCalendar === "all" ? "bg-[#222]" : "hover:bg-[#1e1e1e]"}`}
        >
          <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center shrink-0 mx-auto">
            <Calendar size={14} className="text-black" />
          </div>
          <div
            className={`flex-1 overflow-hidden transition-all duration-300 ${collapsed ? "w-0 opacity-0" : "w-full opacity-100"}`}
          >
            <span
              className={`text-sm font-semibold whitespace-nowrap ${activeCalendar === "all" ? "text-white" : "text-[#888]"}`}
            >
              All Calendars
            </span>
          </div>
        </div>

        {/* Individual calendars */}
        <div className="flex flex-col">
          {calendars.map((cal) => (
            <div
              key={cal.id}
              draggable={!collapsed}
              onDragStart={() => handleDragStart(cal.id)}
              onDragOver={(e) => handleDragOver(e, cal.id)}
              onDrop={() => handleDrop(cal.id)}
              onDragEnd={() => {
                setDraggedId(null);
                setDragOverId(null);
              }}
              className={`group flex items-center gap-3 cursor-pointer transition-all py-2
                ${collapsed ? "justify-center px-0" : "px-5"}
                ${activeCalendar === cal.id ? "bg-[#222]" : "hover:bg-[#1e1e1e]"}
                ${dragOverId === cal.id ? "border-t-2 border-[#6366f1]" : ""}
                ${draggedId === cal.id ? "opacity-40" : ""}`}
              onClick={() => !editingId && setActiveCalendar(cal.id)}
            >
              <div
                className={`transition-all duration-300 overflow-hidden shrink-0 ${collapsed ? "w-0 opacity-0" : "w-3 opacity-100"}`}
              >
                <GripVertical
                  size={12}
                  className="text-[#333] group-hover:text-[#555] cursor-grab"
                />
              </div>
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
                style={{ backgroundColor: cal.color }}
              >
                <Calendar size={14} className="text-white" />
              </div>
              <div
                className={`flex-1 overflow-hidden transition-all duration-300 ${collapsed ? "w-0 opacity-0" : "w-full opacity-100"}`}
              >
                {editingId === cal.id ? (
                  <div
                    className="flex flex-col gap-1.5"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          updateCalendar(cal.id, { name: editName });
                          setEditingId(null);
                        }
                        if (e.key === "Escape") setEditingId(null);
                      }}
                      className="bg-[#222] text-white text-xs px-2 py-1 rounded w-full outline-none border border-[#333]"
                      autoFocus
                    />
                    <div className="flex gap-1 flex-wrap">
                      {COLORS.map((c) => (
                        <button
                          key={c}
                          onClick={() => updateCalendar(cal.id, { color: c })}
                          className="w-4 h-4 rounded-full border-2 transition-all"
                          style={{
                            backgroundColor: c,
                            borderColor:
                              cal.color === c ? "white" : "transparent",
                          }}
                        />
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          updateCalendar(cal.id, { name: editName });
                          setEditingId(null);
                        }}
                        className="text-[11px] text-green-400 hover:text-green-300"
                      >
                        Save
                      </button>
                      {calendars.length > 1 && (
                        <button
                          onClick={() => setDeleteConfirm(cal)}
                          className="text-[11px] text-red-400 hover:text-red-300"
                        >
                          Delete
                        </button>
                      )}
                      <button
                        onClick={() => setEditingId(null)}
                        className="text-[11px] text-[#555] hover:text-white"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-1">
                    <span
                      className={`text-sm flex-1 truncate font-medium whitespace-nowrap ${activeCalendar === cal.id ? "text-white" : "text-[#888]"}`}
                    >
                      {cal.name}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingId(cal.id);
                        setEditName(cal.name);
                      }}
                      className="opacity-0 group-hover:opacity-100 text-[#555] hover:text-white transition-all shrink-0"
                    >
                      <Pencil size={12} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* + Add calendar */}
        {!collapsed && (
          <button
            onClick={addCalendar}
            className="flex items-center gap-3 text-[#444] hover:text-white transition-colors w-full py-2 px-3 hover:bg-[#1e1e1e]"
          >
            <div className="w-7 h-7 flex items-center justify-center shrink-0">
              <Plus size={14} />
            </div>
            <span className="text-sm whitespace-nowrap">Add Calendar</span>
          </button>
        )}
      </div>

      {/* Bottom: Profile */}
      <div className="border-t border-[#2a2a2a] py-3">
        <div
          className={`overflow-hidden transition-all duration-300 ${showProfile && !collapsed ? "max-h-24 opacity-100" : "max-h-0 opacity-0"}`}
        >
          <div className="pb-1 border-b border-[#2a2a2a] mb-1">
            <button className="flex items-center gap-3 text-sm text-[#888] hover:text-white transition-colors w-full py-2 px-3 hover:bg-[#1e1e1e]">
              <Settings size={14} />
              Settings
            </button>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-3 text-sm text-red-400 hover:text-red-300 transition-colors w-full py-2 px-3 hover:bg-[#1e1e1e]"
            >
              <LogOut size={14} />
              Sign out
            </button>
          </div>
        </div>
        <div
          onClick={() => {
            if (collapsed) {
              setCollapsed(false);
              setTimeout(() => setShowProfile(true), 150);
            } else setShowProfile((prev) => !prev);
          }}
          className={`flex items-center gap-3 cursor-pointer transition-colors px-3 py-2
            ${showProfile ? "bg-[#222]" : "hover:bg-[#1e1e1e]"}`}
        >
          <img
            src={avatarSrc}
            alt="avatar"
            className="w-7 h-7 rounded-full shrink-0 bg-[#333] object-cover"
          />
          <div
            className={`flex-1 overflow-hidden transition-all duration-300 ${collapsed ? "w-0 opacity-0" : "w-full opacity-100"}`}
          >
            <p className="text-xs font-medium text-[#ccc] whitespace-nowrap truncate">
              {displayName}
            </p>
            <p className="text-[11px] text-[#555] whitespace-nowrap truncate">
              {user.email}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
