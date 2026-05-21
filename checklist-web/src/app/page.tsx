import Link from "next/link";
import { listTemplateCategories } from "@/services/templateService";

export default async function Home() {
  const categories = await listTemplateCategories();
  return (
    <section className="bg-transparent">
      <div className="mx-auto grid min-h-[calc(80vh-153px)] w-full max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-12">
        <div className="flex flex-col justify-center">
          <div className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-sm font-bold text-cyan-900 shadow-sm">
            Official templates. Personal execution. Better routines.
          </div>
          <h1 className="max-w-3xl text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">
            Run every repeatable workflow with calm, visible progress.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-700">
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
              ["50+", "seed templates"],
              ["JWT", "mobile API"],
              ["Admin", "review queue"],
            ].map(([value, label]) => (
              <div key={label} className="rounded-lg border border-white/70 bg-white/85 p-4 shadow-sm backdrop-blur">
                <p className="text-xl font-black text-slate-950">{value}</p>
                <p className="mt-1 text-xs font-semibold uppercase text-slate-500">{label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center">
          <div className="w-full rounded-lg border border-white/80 bg-white/90 p-5 shadow-xl shadow-cyan-900/10 backdrop-blur">
            <div className="mb-4">
              <p className="text-sm font-bold text-slate-950">Template Topics</p>
              <p className="text-sm text-slate-500">Overview of available template categories</p>
            </div>

            <div className="mt-3 max-h-56 overflow-y-auto">
              <ul className="space-y-2">
                {categories.slice(0, 8).map((cat: any) => (
                  <li
                    key={cat.id}
                    className="flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2"
                  >
                    <span className="h-2 w-2 rounded-full bg-cyan-600" />
                    <span className="text-sm font-medium text-slate-700">{cat.name}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
