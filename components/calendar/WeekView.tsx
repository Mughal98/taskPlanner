"use client";
import { useState } from "react";
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
};

export default function WeekView({
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

  const startOfWeek = new Date(currentDate);
  startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    return d;
  });

  const today = new Date().toISOString().split("T")[0];
  const fmt = (d: Date) => d.toISOString().split("T")[0];

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

  return (
    <div className="grid grid-cols-7 h-full divide-x divide-[#1e1e1e]">
      {weekDays.map((day) => {
        const ds = fmt(day);
        const dayTasks = tasks.filter((t) => t.date === ds);
        const isToday = ds === today;

        return (
          <div
            key={ds}
            className={`flex flex-col ${isToday ? "bg-[#161620]" : ""}`}
            onClick={() => setAddingDate(ds)}
          >
            <div className="py-3 text-center border-b border-[#2a2a2a] shrink-0">
              <div className="text-[11px] uppercase tracking-widest text-[#444] mb-1">
                {day.toLocaleDateString("en-US", { weekday: "short" })}
              </div>
              <div
                className={`text-xl font-light mx-auto w-9 h-9 flex items-center justify-center rounded-full
                ${isToday ? "text-white" : "text-[#666]"}`}
                style={isToday ? { backgroundColor: calendarColor } : {}}
              >
                {day.getDate()}
              </div>
            </div>
            <div className="flex-1 p-2 flex flex-col gap-1 overflow-auto">
              {dayTasks.map((task) => (
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
              {addingDate === ds && (
                <input
                  autoFocus
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") addTask(ds);
                    if (e.key === "Escape") {
                      setAddingDate(null);
                      setNewTaskTitle("");
                    }
                  }}
                  onBlur={() => {
                    if (newTaskTitle.trim()) addTask(ds);
                    else setAddingDate(null);
                  }}
                  onClick={(e) => e.stopPropagation()}
                  placeholder="New task..."
                  className="text-xs bg-[#1e1e1e] border border-[#333] text-white px-2 py-1 rounded outline-none w-full"
                />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
