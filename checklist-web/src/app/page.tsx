import Link from "next/link";

export default function Home() {
  return (
    <section className="mx-auto flex min-h-[calc(100vh-153px)] w-full max-w-6xl flex-col justify-center px-4 py-16 sm:px-6 lg:px-8">
      <div className="max-w-3xl">
        <p className="mb-4 text-sm font-semibold uppercase tracking-wide text-emerald-700">
          Welcome to ChecklistHub
        </p>
        <h1 className="text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
          Reusable checklists for the work you want to get right.
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-700">
          Discover official checklist templates, create your own working copies, track progress,
          and keep repeatable routines calm, clear, and organized.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/login"
            className="inline-flex h-11 items-center justify-center rounded-md bg-slate-950 px-5 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="inline-flex h-11 items-center justify-center rounded-md border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
          >
            Register
          </Link>
        </div>
      </div>
    </section>
  );
}
