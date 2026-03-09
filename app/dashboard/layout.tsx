import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { Suspense } from "react";

async function DashboardShell({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) redirect("/auth/login");

  const userData = {
    id: user!.id,
    email: user!.email || "",
    avatar_url: user!.user_metadata?.avatar_url || null,
    full_name: user!.user_metadata?.full_name || null,
  };

  return (
    <div className="flex h-screen bg-[#111111] text-[#e8e8e8] overflow-hidden">
      <Sidebar user={userData} />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen bg-[#111111] items-center justify-center">
          <div className="text-[#444] text-sm">Loading...</div>
        </div>
      }
    >
      <DashboardShell>{children}</DashboardShell>
    </Suspense>
  );
}
