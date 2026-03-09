"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import TaskCard from "../tasks/TaskCard";

type Task = {
  id: string;
  title: string;
  date: string | null;
  bg_color: string | null;
  is_completed: boolean;
  points: number;
  deadline: string | null;
  column_slot: number | null;
  calendar_id: string;
};

type Props = {
  currentDate: Date;
  tasks: Task[];
  setTasks: (t: Task[]) => void;
  calendarId: string;
  userId: string;
  calendarColor: string;
  onEditTask: (t: Task) => void;
  selectedDate: string | null;
  setSelectedDate: (d: string | null) => void;
};

export default function MonthView({
  currentDate,
  tasks,
  setTasks,
  calendarId,
  userId,
  calendarColor,
  onEditTask,
}: Props) {
  const supabase = createClient();
  const [addingDate, setAddingDate] = useState<string | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState("");

  useEffect(() => {
    if (!calendarId) return;
    setTasks([]);
    if (calendarId === "all") {
      supabase
        .from("tasks")
        .select("*")
        .eq("user_id", userId)
        .then(({ data }) => {
          if (data) setTasks(data);
        });
    } else {
      supabase
        .from("tasks")
        .select("*")
        .eq("calendar_id", calendarId)
        .then(({ data }) => {
          if (data) setTasks(data);
        });
    }
  }, [calendarId]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date().toISOString().split("T")[0];

  const days: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (days.length % 7 !== 0) days.push(null);

  const dateStr = (day: number) =>
    `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

  const addTask = async (date: string) => {
    if (!newTaskTitle.trim()) {
      setAddingDate(null);
      return;
    }
    const { data } = await supabase
      .from("tasks")
      .insert({
        title: newTaskTitle.trim(),
        date,
        calendar_id: calendarId,
        user_id: userId,
      })
      .select()
      .single();
    if (data) setTasks([...tasks, data]);
    setNewTaskTitle("");
    setAddingDate(null);
  };

  const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="h-full flex flex-col">
      <div className="grid grid-cols-7 border-b border-[#2a2a2a]">
        {DAYS.map((d) => (
          <div
            key={d}
            className="py-2 text-center text-[11px] uppercase tracking-widest text-[#444]"
          >
            {d}
          </div>
        ))}
      </div>
      <div
        className="grid grid-cols-7 flex-1"
        style={{
          gridTemplateRows: `repeat(${days.length / 7}, minmax(0, 1fr))`,
        }}
      >
        {days.map((day, i) => {
          const ds = day ? dateStr(day) : null;
          const dayTasks = ds ? tasks.filter((t) => t.date === ds) : [];
          const isToday = ds === today;
          const isPast = ds ? ds < today : false;

          return (
            <div
              key={i}
              className={`border-b border-r border-[#1e1e1e] p-1.5 flex flex-col gap-1 cursor-pointer group transition-colors
                ${day ? "hover:bg-[#161616]" : "bg-[#0e0e0e]"}
                ${isToday ? "bg-[#161620]" : ""}`}
              onClick={() => day && setAddingDate(ds)}
            >
              {day && (
                <>
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs w-6 h-6 flex items-center justify-center rounded-full font-medium
                      ${isToday ? "text-white" : isPast ? "text-[#444]" : "text-[#888]"}`}
                      style={isToday ? { backgroundColor: calendarColor } : {}}
                    >
                      {day}
                    </span>
                  </div>
                  <div className="flex flex-col gap-0.5 overflow-hidden">
                    {dayTasks.slice(0, 3).map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        calendarColor={calendarColor}
                        onEdit={(e) => {
                          e.stopPropagation();
                          onEditTask(task);
                        }}
                        onToggle={async (e) => {
                          e.stopPropagation();
                          await supabase
                            .from("tasks")
                            .update({ is_completed: !task.is_completed })
                            .eq("id", task.id);
                          setTasks(
                            tasks.map((t) =>
                              t.id === task.id
                                ? { ...t, is_completed: !t.is_completed }
                                : t,
                            ),
                          );
                        }}
                      />
                    ))}
                    {dayTasks.length > 3 && (
                      <span className="text-[10px] text-[#555] pl-1">
                        +{dayTasks.length - 3} more
                      </span>
                    )}
                  </div>
                  {addingDate === ds && (
                    <input
                      autoFocus
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") addTask(ds!);
                        if (e.key === "Escape") {
                          setAddingDate(null);
                          setNewTaskTitle("");
                        }
                      }}
                      onBlur={() => {
                        if (newTaskTitle.trim()) addTask(ds!);
                        else setAddingDate(null);
                      }}
                      onClick={(e) => e.stopPropagation()}
                      placeholder="New task..."
                      className="text-xs bg-[#1e1e1e] border border-[#333] text-white px-2 py-1 rounded outline-none w-full mt-1"
                    />
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
