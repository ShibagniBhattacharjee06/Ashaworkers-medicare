"use client";

import { UserCircle, AlertCircle, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { signIn, getSession } from "next-auth/react";
import { GlowButton } from "@/components/ui/GlowButton";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Map raw NextAuth / MongoDB errors to user-friendly messages
  const getFriendlyError = (rawError: string): string => {
    const lower = rawError.toLowerCase();
    if (lower.includes("ssl") || lower.includes("connect") || lower.includes("server")) {
      return "Unable to connect to the database. Please ensure your IP is whitelisted in MongoDB Atlas and try again.";
    }
    if (lower.includes("no user found")) {
      return "No account found with this email address.";
    }
    if (lower.includes("incorrect password")) {
      return "The password you entered is incorrect.";
    }
    if (lower.includes("disabled")) {
      return "This account has been disabled. Contact an administrator.";
    }
    if (lower.includes("enter an email")) {
      return "Please enter both email and password.";
    }
    return rawError;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (res?.error) {
        setError(getFriendlyError(res.error));
      } else if (res?.ok) {
        // Fetch the session to get the user's role for proper redirect
        const session = await getSession();
        const role = (session?.user as any)?.role;

        if (role === "admin") {
          router.push("/admin");
        } else if (role === "asha_worker") {
          router.push("/asha");
        } else if (role === "patient") {
          router.push("/patient");
        } else {
          router.push("/");
        }
        router.refresh();
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 w-full max-w-md p-8 rounded-2xl relative shadow-xl">
        <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/20 blur-[50px] -z-10 rounded-full pointer-events-none"></div>
        <div className="text-center mb-8">
          <UserCircle className="w-16 h-16 mx-auto text-teal-400 mb-4" />
          <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-blue-400">Portal Login</h2>
          <p className="text-slate-400 mt-2">Secure access to Medicare</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 text-sm p-3 mb-4 rounded-lg flex items-start gap-2">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4 flex flex-col">
          <div>
            <label htmlFor="login-email" className="block text-sm font-medium text-slate-300 mb-1">Email</label>
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
              placeholder="admin@medicare.com"
            />
          </div>
          <div>
            <label htmlFor="login-password" className="block text-sm font-medium text-slate-300 mb-1">Password</label>
            <input
              id="login-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
              placeholder="••••••••"
            />
          </div>
          <GlowButton
            variant="glass"
            className="w-full justify-center border-teal-500/30 hover:border-teal-400 mt-4"
            type="submit"
            disabled={loading}
          >
            {loading ? (
              <span className="font-semibold text-teal-300 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Authenticating...
              </span>
            ) : (
              <span className="font-semibold text-teal-300">Sign In</span>
            )}
          </GlowButton>
        </form>

        <div className="mt-6 text-center">
          <p className="text-xs text-slate-500">
            Demo credentials: admin@medicare.com / admin123
          </p>
        </div>
      </div>
    </div>
  );
}
