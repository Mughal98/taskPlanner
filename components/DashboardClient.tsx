"use client";
import { useEffect, useState } from "react";
import CalendarHeader from "./calendar/CalendarHeader";
import MonthView from "./calendar/MonthView";
import WeekView from "./calendar/WeekView";
import BottomPanel from "./calendar/BottomPanel";
import TaskEditPanel from "./tasks/TaskEditPanel";

type Calendar = { id: string; name: string; color: string };
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

export default function DashboardClient({
  initialCalendars,
  userId,
}: {
  initialCalendars: Calendar[];
  userId: string;
}) {
  const [view, setView] = useState<"month" | "week">("month");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [activeCalendar, setActiveCalendar] = useState<string>("all");

  useEffect(() => {
    const handler = (e: CustomEvent) => setActiveCalendar(e.detail);
    window.addEventListener("calendarChange", handler as EventListener);
    return () =>
      window.removeEventListener("calendarChange", handler as EventListener);
  }, []);
  const [calendars, setCalendars] = useState(initialCalendars);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const activeCalendarData = calendars.find((c) => c.id === activeCalendar);

  return (
    <div className="flex flex-col h-full">
      <CalendarHeader
        view={view}
        setView={setView}
        currentDate={currentDate}
        setCurrentDate={setCurrentDate}
        calendarColor={activeCalendarData?.color || "#6366f1"}
      />
      <div className="flex-1 overflow-auto">
        {view === "month" ? (
          <MonthView
            currentDate={currentDate}
            tasks={tasks}
            setTasks={setTasks}
            calendarId={activeCalendar}
            userId={userId}
            calendarColor={activeCalendarData?.color || "#6366f1"}
            onEditTask={setEditingTask}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
          />
        ) : (
          <WeekView
            currentDate={currentDate}
            tasks={tasks}
            setTasks={setTasks}
            calendarId={activeCalendar}
            userId={userId}
            calendarColor={activeCalendarData?.color || "#6366f1"}
            onEditTask={setEditingTask}
          />
        )}
      </div>
      <BottomPanel
        tasks={tasks}
        setTasks={setTasks}
        calendarId={activeCalendar}
        userId={userId}
        onEditTask={setEditingTask}
      />
      {editingTask && (
        <TaskEditPanel
          task={editingTask}
          onClose={() => setEditingTask(null)}
          onUpdate={(updated) => {
            setTasks((prev) =>
              prev.map((t) => (t.id === updated.id ? updated : t)),
            );
            setEditingTask(null);
          }}
          onDelete={(id) => {
            setTasks((prev) => prev.filter((t) => t.id !== id));
            setEditingTask(null);
          }}
        />
      )}
    </div>
  );
}
