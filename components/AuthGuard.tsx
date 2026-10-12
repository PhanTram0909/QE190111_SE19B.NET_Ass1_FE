"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { authApi, authStorage } from "@/lib/api";
import { SystemAccount } from "@/lib/types";
import LoadingSpinner from "@/components/LoadingSpinner";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface Props {
  children: React.ReactNode;
  adminOnly?: boolean;
}

export default function AuthGuard({ children, adminOnly = false }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [checking, setChecking] = useState(true);
  const [user, setUser] = useState<SystemAccount | null>(null);

  useEffect(() => {
    const isAuth = authApi.isAuthenticated();
    const currentUser = authStorage.getUser();

    if (!isAuth || !currentUser) {
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }

    setUser(currentUser);
    setChecking(false);
  }, [router, pathname]);

  if (checking) {
    return <LoadingSpinner text="Authenticating session..." />;
  }

  if (adminOnly && user?.role !== 1) {
    return (
      <div className="max-w-lg mx-auto py-16 px-4 animate-fade-in text-center">
        <div className="card p-8 space-y-5 border-rose-500/30 bg-rose-500/[0.04]">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 shadow-lg shadow-rose-500/20">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-white tracking-tight">Access Restricted (403)</h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              This section requires <span className="text-rose-400 font-semibold">Administrator</span> privileges. Your current role is <span className="text-blue-400 font-semibold">{user?.roleLabel || "Staff"}</span>.
            </p>
          </div>
          <div className="pt-2">
            <Link href="/admin" className="btn-secondary inline-flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" /> Back to Admin Console
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
