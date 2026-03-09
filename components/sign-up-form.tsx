"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";

export function SignUpForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    if (password !== repeatPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      setIsLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
        },
      });
      if (error) throw error;
      router.push("/auth/sign-up-success");
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#111111] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold text-white tracking-tight">
            Planner
          </h1>
          <p className="text-sm text-[#555] mt-1">Create your account</p>
        </div>

        {/* Card */}
        <div className="bg-[#161616] border border-[#2a2a2a] rounded-xl p-6 flex flex-col gap-4">
          <form onSubmit={handleSignUp} className="flex flex-col gap-3">
            {/* Email */}
            <div className="flex flex-col gap-1">
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                suppressHydrationWarning
                className="bg-[#1e1e1e] border border-[#2a2a2a] text-white placeholder-[#444] text-sm px-3 py-2.5 rounded-lg outline-none focus:border-[#444] transition-colors w-full"
              />
              <p className="text-[11px] text-[#444] px-1">
                Use an email you have access to
              </p>
            </div>

            {/* Password with eye toggle */}
            <div className="flex flex-col gap-1">
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Min. 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                  suppressHydrationWarning
                  className="bg-[#1e1e1e] border border-[#2a2a2a] text-white placeholder-[#444] text-sm px-3 py-2.5 pr-10 rounded-lg outline-none focus:border-[#444] transition-colors w-full"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#444] hover:text-[#888] transition-colors"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              <p className="text-[11px] text-[#444] px-1">
                At least 6 characters
              </p>
            </div>

            {/* Repeat Password — no eye */}
            <div className="flex flex-col gap-1">
              <input
                type="password"
                placeholder="Type password again"
                value={repeatPassword}
                onChange={(e) => setRepeatPassword(e.target.value)}
                required
                autoComplete="new-password"
                suppressHydrationWarning
                className="bg-[#1e1e1e] border border-[#2a2a2a] text-white placeholder-[#444] text-sm px-3 py-2.5 rounded-lg outline-none focus:border-[#444] transition-colors w-full"
              />
              <p className="text-[11px] text-[#444] px-1">
                Must match your password above
              </p>
            </div>

            {/* Error */}
            {error && <p className="text-xs text-red-400 px-1">{error}</p>}

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-white hover:bg-gray-100 text-gray-900 text-sm font-medium py-2.5 rounded-lg transition-colors disabled:opacity-50 mt-1"
            >
              {isLoading ? "Creating account..." : "Create account"}
            </button>

            {/* Confirmation note */}
            <p className="text-[11px] text-[#444] text-center">
              We'll send a confirmation email to verify your account
            </p>
          </form>
        </div>

        {/* Login link */}
        <p className="text-center text-xs text-[#444] mt-4">
          Already have an account?{" "}
          <Link
            href="/auth/login"
            className="text-[#888] hover:text-white transition-colors"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
