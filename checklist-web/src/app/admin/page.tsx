import Link from "next/link";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth";
import { getAdminDashboardStats } from "@/services/adminService";

export default async function AdminDashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "admin") {
    redirect("/dashboard");
  }

  const stats = await getAdminDashboardStats();

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
          Admin overview
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
          Admin dashboard
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Monitor templates, users, and suggestion activity across ChecklistHub.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-600">Total templates</p>
          <p className="mt-2 text-3xl font-semibold text-slate-950">{stats.totalTemplates}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-600">Published templates</p>
          <p className="mt-2 text-3xl font-semibold text-slate-950">
            {stats.publishedTemplates}
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-600">Total users</p>
          <p className="mt-2 text-3xl font-semibold text-slate-950">{stats.totalUsers}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-600">Pending suggestions</p>
          <p className="mt-2 text-3xl font-semibold text-slate-950">
            {stats.pendingSuggestions}
          </p>
        </div>
      </div>

      <div className="mt-10 grid gap-3 md:grid-cols-2">
        <Link
          href="/admin/templates"
          className="rounded-lg border border-slate-200 bg-white p-5 transition hover:border-emerald-300 hover:shadow-sm"
        >
          <h2 className="text-lg font-semibold text-slate-950">Template management</h2>
          <p className="mt-2 text-sm text-slate-600">
            Create, edit, and publish official checklist templates.
          </p>
        </Link>
        <Link
          href="/admin/suggestions"
          className="rounded-lg border border-slate-200 bg-white p-5 transition hover:border-emerald-300 hover:shadow-sm"
        >
          <h2 className="text-lg font-semibold text-slate-950">Suggestion review</h2>
          <p className="mt-2 text-sm text-slate-600">
            Accept, reject, or convert incoming suggestions.
          </p>
        </Link>
        <Link
          href="/admin/categories"
          className="rounded-lg border border-slate-200 bg-white p-5 transition hover:border-emerald-300 hover:shadow-sm"
        >
          <h2 className="text-lg font-semibold text-slate-950">Categories & activities</h2>
          <p className="mt-2 text-sm text-slate-600">
            Manage template categories and activity taxonomy.
          </p>
        </Link>
        <Link
          href="/admin/users"
          className="rounded-lg border border-slate-200 bg-white p-5 transition hover:border-emerald-300 hover:shadow-sm"
        >
          <h2 className="text-lg font-semibold text-slate-950">User roles</h2>
          <p className="mt-2 text-sm text-slate-600">Assign admin roles and review users.</p>
        </Link>
      </div>
    </section>
  );
}
