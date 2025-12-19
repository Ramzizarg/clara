"use client";

import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

export function SignOutButton() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="inline-flex items-center gap-2 rounded-full border border-zinc-300 px-4 py-1 text-xs font-medium text-zinc-100 hover:bg-white/5 hover:border-zinc-100 transition-colors"
    >
      <LogOut className="h-4 w-4 text-zinc-100" />
      <span>Déconnexion</span>
    </button>
  );
}
