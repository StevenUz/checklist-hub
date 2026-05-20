import Link from "next/link";

import { logoutAction } from "@/actions/authActions";
import type { SessionUser } from "@/lib/session";

type HeaderProps = {
  user: SessionUser | null;
};

const navLink =
  "rounded-lg px-3 py-2 text-white/90 transition hover:bg-white/15 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70";

export function Header({ user }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-cyan-200/30 bg-gradient-to-r from-cyan-700 via-emerald-700 to-teal-800 shadow-sm">
      <nav
        className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8"
        aria-label="Main navigation"
      >
        <Link
          href="/"
          className="flex items-center gap-2 rounded-lg text-xl font-black tracking-tight text-white outline-none focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-sm font-black text-emerald-800 shadow-sm">
            CH
          </span>
          <span>ChecklistHub</span>
        </Link>

        <div className="flex flex-wrap items-center gap-2 text-sm font-semibold text-white">
          <Link href="/" className={navLink}>
            Home
          </Link>
          {user ? (
            <>
              <Link href="/templates" className={navLink}>
                Templates
              </Link>
              <Link href="/dashboard" className={navLink}>
                Dashboard
              </Link>
              <Link href="/checklists" className={navLink}>
                Checklists
              </Link>
              <Link href="/suggestions" className={navLink}>
                Suggestions
              </Link>
              {user.role === "admin" ? (
                <Link
                  href="/admin"
                  className="rounded-lg bg-amber-300 px-3 py-2 text-slate-950 transition hover:bg-amber-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
                >
                  Admin
                </Link>
              ) : null}
              <span className="rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-white/90">
                {user.name} <span className="hidden sm:inline">({user.email})</span>
              </span>
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="rounded-lg bg-white px-3 py-2 text-emerald-800 transition hover:bg-cyan-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
                >
                  Logout
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className={navLink}>
                Login
              </Link>
              <Link
                href="/register"
                className="rounded-lg bg-amber-300 px-4 py-2 text-slate-950 shadow-sm transition hover:bg-amber-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
