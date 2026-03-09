"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { AlertTriangle } from "lucide-react";
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
  tasks: Task[];
  setTasks: (t: Task[]) => void;
  calendarId: string;
  userId: string;
  onEditTask: (t: Task) => void;
};

const COLUMNS = [
  { label: "Extra", slot: 1 },
  { label: "Extra", slot: 2 },
  { label: "Deadlines", slot: 3, icon: true },
];

export default function BottomPanel({
  tasks,
  setTasks,
  calendarId,
  userId,
  onEditTask,
}: Props) {
  const supabase = createClient();
  const [addingSlot, setAddingSlot] = useState<number | null>(null);
  const [newTitle, setNewTitle] = useState("");

  const addTask = async (slot: number) => {
    if (!newTitle.trim()) {
      setAddingSlot(null);
      return;
    }
    const { data } = await supabase
      .from("tasks")
      .insert({
        title: newTitle.trim(),
        column_slot: slot,
        calendar_id: calendarId,
        user_id: userId,
      })
      .select()
      .single();
    if (data) setTasks([...tasks, data]);
    setNewTitle("");
    setAddingSlot(null);
  };

  const soon = new Date();
  soon.setDate(soon.getDate() + 3);
  const soonStr = soon.toISOString().split("T")[0];

  const getColTasks = (slot: number) => {
    if (slot === 3) {
      return tasks.filter(
        (t) =>
          t.deadline && t.deadline.split("T")[0] <= soonStr && !t.is_completed,
      );
    }
    return tasks.filter((t) => t.column_slot === slot);
  };

  return (
    <div className="h-44 border-t border-[#2a2a2a] grid grid-cols-3 divide-x divide-[#2a2a2a] shrink-0 bg-[#0f0f0f]">
      {COLUMNS.map((col) => (
        <div
          key={col.slot}
          className="flex flex-col overflow-hidden"
          onClick={() => col.slot !== 3 && setAddingSlot(col.slot)}
        >
          <div className="flex items-center gap-1.5 px-3 py-2 border-b border-[#1e1e1e] shrink-0">
            {col.icon && <AlertTriangle size={11} className="text-amber-500" />}
            <span className="text-[11px] uppercase tracking-widest text-[#444]">
              {col.label}
            </span>
          </div>
          <div className="flex-1 overflow-auto p-2 flex flex-col gap-1">
            {getColTasks(col.slot).map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                calendarColor="#6366f1"
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
            {addingSlot === col.slot && (
              <input
                autoFocus
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") addTask(col.slot);
                  if (e.key === "Escape") {
                    setAddingSlot(null);
                    setNewTitle("");
                  }
                }}
                onBlur={() => {
                  if (newTitle.trim()) addTask(col.slot);
                  else setAddingSlot(null);
                }}
                onClick={(e) => e.stopPropagation()}
                placeholder="New task..."
                className="text-xs bg-[#1e1e1e] border border-[#333] text-white px-2 py-1 rounded outline-none w-full"
              />
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
