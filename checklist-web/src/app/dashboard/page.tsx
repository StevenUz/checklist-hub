import Link from "next/link";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth";
import { listUserChecklists } from "@/services/checklistService";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const checklists = await listUserChecklists(user.id, { page: 1, pageSize: 50 });
  const activeChecklists = checklists.data
    .filter((checklist) => checklist.status === "active")
    .slice(0, 5);

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950">Dashboard</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Welcome back, {user.name}. Keep your active checklist work moving.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-600">Total checklists</p>
          <p className="mt-2 text-3xl font-semibold text-slate-950">
            {checklists.pagination.total}
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-600">Active</p>
          <p className="mt-2 text-3xl font-semibold text-slate-950">
            {checklists.data.filter((checklist) => checklist.status === "active").length}
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-600">Completed items</p>
          <p className="mt-2 text-3xl font-semibold text-slate-950">
            {checklists.data.reduce(
              (total, checklist) => total + checklist.progress.completedItems,
              0,
            )}
          </p>
        </div>
      </div>

      <div className="mt-10 flex items-center justify-between gap-4">
        <h2 className="text-xl font-semibold text-slate-950">Recent active checklists</h2>
        <Link href="/templates" className="text-sm font-medium text-emerald-700 hover:text-emerald-800">
          Browse templates
        </Link>
      </div>

      <div className="mt-4 space-y-3">
        {activeChecklists.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center text-slate-600">
            No active checklists yet.
          </div>
        ) : (
          activeChecklists.map((checklist) => (
            <Link
              key={checklist.id}
              href={`/checklists/${checklist.id}`}
              className="block rounded-lg border border-slate-200 bg-white p-5 transition hover:border-emerald-300 hover:shadow-sm"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="font-semibold text-slate-950">{checklist.title}</h3>
                  <p className="mt-1 text-sm text-slate-600">
                    {checklist.progress.completedItems} / {checklist.progress.totalItems} items
                  </p>
                </div>
                <p className="text-sm font-semibold text-emerald-700">
                  {checklist.progress.percentage}%
                </p>
              </div>
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
