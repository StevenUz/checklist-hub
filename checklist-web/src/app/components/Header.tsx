import Link from "next/link";

import { logoutAction } from "@/actions/authActions";
import type { SessionUser } from "@/lib/session";

type HeaderProps = {
  user: SessionUser | null;
};

export function Header({ user }: HeaderProps) {
  return (
    <header className="border-b border-slate-200 bg-white">
      <nav
        className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-4 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8"
        aria-label="Main navigation"
      >
        <Link href="/" className="text-xl font-semibold tracking-tight text-slate-950">
          ChecklistHub
        </Link>
        <div className="flex flex-wrap items-center gap-2 text-sm font-medium text-slate-700">
          <Link
            href="/"
            className="rounded-md px-3 py-2 transition hover:bg-slate-100 hover:text-slate-950"
          >
            Home
          </Link>
          {user ? (
            <Link
              href="/templates"
              className="rounded-md px-3 py-2 transition hover:bg-slate-100 hover:text-slate-950"
            >
              Templates
            </Link>
          ) : null}
          {user ? (
            <>
              <Link
                href="/dashboard"
                className="rounded-md px-3 py-2 transition hover:bg-slate-100 hover:text-slate-950"
              >
                Dashboard
              </Link>
              <Link
                href="/checklists"
                className="rounded-md px-3 py-2 transition hover:bg-slate-100 hover:text-slate-950"
              >
                Checklists
              </Link>
            </>
          ) : null}
          {user ? (
            <>
              <span className="rounded-md px-3 py-2 text-slate-600">
                {user.name} <span className="hidden sm:inline">({user.email})</span>
              </span>
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="rounded-md bg-slate-950 px-3 py-2 text-white transition hover:bg-slate-800"
                >
                  Logout
                </button>
              </form>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-md px-3 py-2 transition hover:bg-slate-100 hover:text-slate-950"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="rounded-md bg-emerald-600 px-3 py-2 text-white transition hover:bg-emerald-700"
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
