import Link from "next/link";

export function Header() {
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
        </div>
      </nav>
    </header>
  );
}
