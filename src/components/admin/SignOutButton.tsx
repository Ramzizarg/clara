"use client";

import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

export function SignOutButton() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="inline-flex items-center justify-center rounded-full border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-100 hover:bg-white/5 hover:border-zinc-100 transition-colors"
    >
      <LogOut className="h-5 w-5 md:h-4 md:w-4 text-zinc-100" />
      <span className="sr-only">Déconnexion</span>
    </button>
  );
}
