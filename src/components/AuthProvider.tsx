"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Loader2 } from "lucide-react";

export function AuthProvider({ children, allowedRoles }: { children: React.ReactNode, allowedRoles: string[] }) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    } else if (status === "authenticated" && session?.user) {
      const userRole = (session.user as any).role as string;
      if (!allowedRoles.includes(userRole)) {
        router.replace("/login");
      }
    }
  }, [status, session, router, allowedRoles]);

  if (!isMounted || status === "loading" || status === "unauthenticated" || (status === "authenticated" && !allowedRoles.includes((session?.user as any)?.role))) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#020617]">
        <Loader2 className="w-12 h-12 text-teal-500 animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}

