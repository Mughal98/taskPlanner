"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { X, Trash2, Plus } from "lucide-react";

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
type Subtask = {
  id: string;
  title: string;
  is_completed: boolean;
  points: number;
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
  "#14b8a6",
  "#f43f5e",
];

type Props = {
  task: Task;
  onClose: () => void;
  onUpdate: (t: Task) => void;
  onDelete: (id: string) => void;
};

export default function TaskEditPanel({
  task,
  onClose,
  onUpdate,
  onDelete,
}: Props) {
  const supabase = createClient();
  const [title, setTitle] = useState(task.title);
  const [deadline, setDeadline] = useState(
    task.deadline ? task.deadline.split("T")[0] : "",
  );
  const [bgColor, setBgColor] = useState(task.bg_color || "");
  const [points, setPoints] = useState(task.points || 0);
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [newSubtask, setNewSubtask] = useState("");

  useEffect(() => {
    supabase
      .from("subtasks")
      .select("*")
      .eq("task_id", task.id)
      .then(({ data }) => {
        if (data) setSubtasks(data);
      });
  }, [task.id]);

  const save = async () => {
    const updates = {
      title,
      deadline: deadline || null,
      bg_color: bgColor || null,
      points,
    };
    await supabase.from("tasks").update(updates).eq("id", task.id);
    onUpdate({ ...task, ...updates });
  };

  const deleteTask = async () => {
    await supabase.from("tasks").delete().eq("id", task.id);
    onDelete(task.id);
  };

  const addSubtask = async () => {
    if (!newSubtask.trim()) return;
    const { data } = await supabase
      .from("subtasks")
      .insert({ task_id: task.id, title: newSubtask.trim() })
      .select()
      .single();
    if (data) setSubtasks((prev) => [...prev, data]);
    setNewSubtask("");
  };

  const toggleSubtask = async (st: Subtask) => {
    await supabase
      .from("subtasks")
      .update({ is_completed: !st.is_completed })
      .eq("id", st.id);
    setSubtasks((prev) =>
      prev.map((s) =>
        s.id === st.id ? { ...s, is_completed: !s.is_completed } : s,
      ),
    );
  };

  const deleteSubtask = async (id: string) => {
    await supabase.from("subtasks").delete().eq("id", id);
    setSubtasks((prev) => prev.filter((s) => s.id !== id));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-[#161616] border border-[#2a2a2a] rounded-xl w-full max-w-md mx-4 mb-4 sm:mb-0 p-5 shadow-2xl z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-base font-medium bg-transparent text-white outline-none flex-1 mr-2"
            onBlur={save}
          />
          <div className="flex gap-2">
            <button
              onClick={deleteTask}
              className="text-[#555] hover:text-red-400 transition-colors"
            >
              <Trash2 size={16} />
            </button>
            <button
              onClick={onClose}
              className="text-[#555] hover:text-white transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Deadline */}
        <div className="mb-4">
          <label className="text-[11px] uppercase tracking-widest text-[#555] block mb-1.5">
            Deadline
          </label>
          <input
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            onBlur={save}
            className="bg-[#1e1e1e] border border-[#2a2a2a] text-[#ccc] text-sm px-3 py-1.5 rounded-lg outline-none w-full [color-scheme:dark]"
          />
        </div>

        {/* Points */}
        <div className="mb-4">
          <label className="text-[11px] uppercase tracking-widest text-[#555] block mb-1.5">
            Points
          </label>
          <input
            type="number"
            value={points}
            onChange={(e) => setPoints(Number(e.target.value))}
            onBlur={save}
            min={0}
            className="bg-[#1e1e1e] border border-[#2a2a2a] text-[#ccc] text-sm px-3 py-1.5 rounded-lg outline-none w-24"
          />
        </div>

        {/* Color */}
        <div className="mb-4">
          <label className="text-[11px] uppercase tracking-widest text-[#555] block mb-1.5">
            Background Color
          </label>
          <div className="flex gap-2 flex-wrap items-center">
            <button
              onClick={() => {
                setBgColor("");
                save();
              }}
              className={`w-6 h-6 rounded-full border-2 bg-[#1e1e1e] transition-all ${!bgColor ? "border-white" : "border-[#333]"}`}
            />
            {COLORS.map((c) => (
              <button
                key={c}
                onClick={() => {
                  setBgColor(c);
                  setTimeout(save, 50);
                }}
                className="w-6 h-6 rounded-full border-2 transition-all"
                style={{
                  backgroundColor: c,
                  borderColor: bgColor === c ? "white" : "transparent",
                }}
              />
            ))}
          </div>
        </div>

        {/* Subtasks */}
        <div>
          <label className="text-[11px] uppercase tracking-widest text-[#555] block mb-1.5">
            Subtasks
          </label>
          <div className="space-y-1 mb-2 max-h-32 overflow-auto">
            {subtasks.map((st) => (
              <div key={st.id} className="flex items-center gap-2 group">
                <button
                  onClick={() => toggleSubtask(st)}
                  className="w-3.5 h-3.5 rounded border border-[#444] flex items-center justify-center shrink-0 transition-colors"
                  style={{
                    backgroundColor: st.is_completed
                      ? "#6366f1"
                      : "transparent",
                  }}
                >
                  {st.is_completed && (
                    <span className="text-white text-[8px]">✓</span>
                  )}
                </button>
                <span
                  className={`text-sm flex-1 ${st.is_completed ? "line-through text-[#444]" : "text-[#ccc]"}`}
                >
                  {st.title}
                </span>
                <button
                  onClick={() => deleteSubtask(st.id)}
                  className="opacity-0 group-hover:opacity-100 text-[#555] hover:text-red-400 transition-all"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              value={newSubtask}
              onChange={(e) => setNewSubtask(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addSubtask()}
              placeholder="Add subtask..."
              className="flex-1 bg-[#1e1e1e] border border-[#2a2a2a] text-[#ccc] text-sm px-3 py-1.5 rounded-lg outline-none"
            />
            <button
              onClick={addSubtask}
              className="text-[#555] hover:text-white transition-colors px-2"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
