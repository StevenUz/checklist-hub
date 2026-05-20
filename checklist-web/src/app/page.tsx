import Link from "next/link";

export default function Home() {
  return (
    <section className="bg-transparent">
      <div className="mx-auto grid min-h-[calc(100vh-153px)] w-full max-w-7xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-16">
        <div className="flex flex-col justify-center">
          <div className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-sm font-bold text-cyan-900 shadow-sm">
            Official templates. Personal execution. Better routines.
          </div>
          <h1 className="max-w-3xl text-5xl font-black tracking-tight text-slate-950 sm:text-6xl">
            Run every repeatable workflow with calm, visible progress.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-700">
            ChecklistHub helps teams and individuals discover vetted templates, create editable
            personal copies, track completion, and send improvements back into the system.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/templates"
              className="inline-flex h-12 items-center justify-center rounded-lg bg-cyan-700 px-6 text-sm font-bold text-white shadow-sm transition hover:bg-cyan-800"
            >
              Browse templates
            </Link>
            <Link
              href="/register"
              className="inline-flex h-12 items-center justify-center rounded-lg border border-violet-200 bg-white px-6 text-sm font-bold text-violet-950 shadow-sm transition hover:bg-violet-50"
            >
              Create account
            </Link>
          </div>
          <div className="mt-10 grid max-w-xl grid-cols-3 gap-3">
            {[
              ["20+", "seed templates"],
              ["JWT", "mobile API"],
              ["Admin", "review queue"],
            ].map(([value, label]) => (
              <div key={label} className="rounded-lg border border-white/70 bg-white/85 p-4 shadow-sm backdrop-blur">
                <p className="text-2xl font-black text-slate-950">{value}</p>
                <p className="mt-1 text-xs font-semibold uppercase text-slate-500">{label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center">
          <div className="w-full rounded-lg border border-white/80 bg-white/90 p-5 shadow-xl shadow-cyan-900/10 backdrop-blur">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-slate-950">Scuba Pre-Dive Checklist</p>
                <p className="text-sm text-slate-500">Personal copy</p>
              </div>
              <span className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-bold text-cyan-700">
                64%
              </span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-slate-100">
              <div className="h-3 w-[64%] rounded-full bg-gradient-to-r from-cyan-600 to-emerald-600" />
            </div>
            <div className="mt-5 space-y-3">
              {[
                ["Dive computer charged", true],
                ["Buddy equipment check", true],
                ["Emergency oxygen confirmed", false],
                ["Entry and exit procedures reviewed", false],
              ].map(([label, done]) => (
                <div
                  key={String(label)}
                  className="flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50 px-3 py-3"
                >
                  <span
                    className={`flex h-6 w-6 items-center justify-center rounded-full border text-xs font-black ${
                      done
                        ? "border-cyan-700 bg-cyan-700 text-white"
                        : "border-violet-200 bg-white text-transparent"
                    }`}
                  >
                    ✓
                  </span>
                  <span className="text-sm font-medium text-slate-700">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
