import Link from "next/link";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth";
import { listUserChecklists } from "@/services/checklistService";

export default async function ChecklistsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const checklists = await listUserChecklists(user.id);

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950">My Checklists</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Execute active checklists and continue personal copies you started from templates.
          </p>
        </div>
        <Link
          href="/templates"
          className="inline-flex h-10 items-center justify-center rounded-md bg-emerald-600 px-4 text-sm font-semibold text-white transition hover:bg-emerald-700"
        >
          Start from template
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {checklists.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center text-slate-600 md:col-span-2">
            You do not have any checklists yet.
          </div>
        ) : (
          checklists.map((checklist) => (
            <Link
              key={checklist.id}
              href={`/checklists/${checklist.id}`}
              className="rounded-lg border border-slate-200 bg-white p-5 transition hover:border-emerald-300 hover:shadow-sm"
            >
              <div className="mb-3 flex flex-wrap gap-2 text-xs font-medium">
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-700">
                  {checklist.status}
                </span>
                {checklist.template?.category ? (
                  <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-emerald-700">
                    {checklist.template.category.name}
                  </span>
                ) : null}
              </div>
              <h2 className="text-lg font-semibold text-slate-950">{checklist.title}</h2>
              <p className="mt-2 text-sm text-slate-600">
                {checklist.progress.completedItems} / {checklist.progress.totalItems} items complete
              </p>
              <div className="mt-3 h-2 rounded-full bg-slate-100">
                <div
                  className="h-2 rounded-full bg-emerald-500"
                  style={{ width: `${checklist.progress.percentage}%` }}
                />
              </div>
            </Link>
          ))
        )}
      </div>
    </section>
  );
}
