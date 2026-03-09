"use client";

type Task = {
  id: string;
  title: string;
  bg_color: string | null;
  is_completed: boolean;
  deadline: string | null;
};

type Props = {
  task: Task;
  calendarColor: string;
  onEdit: (e: React.MouseEvent) => void;
  onToggle: (e: React.MouseEvent) => void;
};

export default function TaskCard({
  task,
  calendarColor,
  onEdit,
  onToggle,
}: Props) {
  const isOverdue =
    task.deadline && new Date(task.deadline) < new Date() && !task.is_completed;

  return (
    <div
      className="flex items-center gap-1.5 px-2 py-1 rounded text-xs cursor-pointer group transition-all hover:opacity-90"
      style={{
        backgroundColor: task.bg_color
          ? task.bg_color + "33"
          : calendarColor + "22",
        borderLeft: `2px solid ${task.bg_color || calendarColor}`,
      }}
      onClick={onEdit}
    >
      <button
        onClick={onToggle}
        className="w-3 h-3 rounded-full border shrink-0 flex items-center justify-center transition-colors"
        style={{
          borderColor: task.bg_color || calendarColor,
          backgroundColor: task.is_completed
            ? task.bg_color || calendarColor
            : "transparent",
        }}
      >
        {task.is_completed && <span className="text-white text-[8px]">✓</span>}
      </button>
      <span
        className={`truncate flex-1 ${task.is_completed ? "line-through opacity-40" : ""} ${isOverdue ? "text-amber-400" : "text-[#ccc]"}`}
      >
        {task.title}
      </span>
    </div>
  );
}
