import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import DashboardClient from "@/components/DashboardClient";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) redirect("/auth/login");

  const userId = user!.id;

  const { data: calendars } = await supabase
    .from("calendars")
    .select("*")
    .eq("user_id", userId)
    .order("created_at");

  if (!calendars || calendars.length === 0) {
    const { data: newCalendar } = await supabase
      .from("calendars")
      .insert({ user_id: userId, name: "My Calendar", color: "#6366f1" })
      .select()
      .single();
    return (
      <DashboardClient
        initialCalendars={newCalendar ? [newCalendar] : []}
        userId={userId}
      />
    );
  }

  return <DashboardClient initialCalendars={calendars} userId={userId} />;
}
