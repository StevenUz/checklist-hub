import Link from "next/link";
import { redirect } from "next/navigation";

import { createAdminTemplateAction } from "@/actions/adminActions";
import { AdminActionForm } from "@/app/admin/components/AdminActionForm";
import { getCurrentUser } from "@/lib/auth";
import { listTemplateCategories } from "@/services/templateService";
import { listAdminTemplates, listAdminActivities } from "@/services/adminService";

type AdminTemplatesPageProps = {
  searchParams: Promise<{
    q?: string;
    status?: string;
    category?: string;
    page?: string;
  }>;
};

function buildAdminTemplatesHref(params: {
  q?: string;
  status?: string;
  category?: string;
  page?: number;
}) {
  const searchParams = new URLSearchParams();

  if (params.q) {
    searchParams.set("q", params.q);
  }

  if (params.status) {
    searchParams.set("status", params.status);
  }

  if (params.category) {
    searchParams.set("category", params.category);
  }

  if (params.page && params.page > 1) {
    searchParams.set("page", String(params.page));
  }

  const query = searchParams.toString();
  return query ? `/admin/templates?${query}` : "/admin/templates";
}

const statusOptions = [
  { value: "", label: "All statuses" },
  { value: "draft", label: "Draft" },
  { value: "published", label: "Published" },
  { value: "archived", label: "Archived" },
] as const;

const templateStatusFilters = ["", "draft", "published", "archived"] as const;
type TemplateStatusFilter = (typeof templateStatusFilters)[number];

function parseTemplateStatusFilter(value: string | undefined): TemplateStatusFilter {
  const status = value?.trim() ?? "";
  return templateStatusFilters.includes(status as TemplateStatusFilter)
    ? (status as TemplateStatusFilter)
    : "";
}

export default async function AdminTemplatesPage({ searchParams }: AdminTemplatesPageProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "admin") {
    redirect("/dashboard");
  }

  const resolvedSearchParams = await searchParams;
  const query = resolvedSearchParams.q?.trim() ?? "";
  const status = parseTemplateStatusFilter(resolvedSearchParams.status);
  const category = resolvedSearchParams.category?.trim() ?? "";
  const page = Number(resolvedSearchParams.page ?? "1");

  const [categories, templates, activities] = await Promise.all([
    listTemplateCategories(),
    listAdminTemplates({
      query,
      status,
      category,
      page: Number.isInteger(page) && page > 0 ? page : 1,
      pageSize: 8,
    }),
    listAdminActivities({ page: 1, pageSize: 200 }),
  ]);

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
          Admin templates
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
          Template management
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Create, edit, and publish official templates for ChecklistHub users.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div>
          <form className="mb-6 grid gap-3 rounded-lg border border-slate-200 bg-white p-4 md:grid-cols-4">
            <div className="md:col-span-2">
              <label htmlFor="q" className="block text-sm font-medium text-slate-800">
                Search
              </label>
              <input
                id="q"
                name="q"
                type="search"
                defaultValue={query}
                placeholder="Search templates"
                className="mt-2 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
              />
            </div>
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-slate-800">
                Status
              </label>
              <select
                id="status"
                name="status"
                defaultValue={status}
                className="mt-2 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-950 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-slate-800">
                Category
              </label>
              <select
                id="category"
                name="category"
                defaultValue={category}
                className="mt-2 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-950 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
              >
                <option value="">All categories</option>
                {categories.map((item) => (
                  <option key={item.id} value={item.slug}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="md:col-span-4">
              <button
                type="submit"
                className="inline-flex h-10 w-full items-center justify-center rounded-md bg-emerald-600 px-4 text-sm font-semibold text-white transition hover:bg-emerald-700"
              >
                Apply filters
              </button>
            </div>
          </form>

          {templates.data.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center text-slate-600">
              No templates match your filters.
            </div>
          ) : (
            <div className="space-y-4">
              {templates.data.map((template) => (
                <div
                  key={template.id}
                  className="rounded-lg border border-slate-200 bg-white p-5 transition hover:border-emerald-300 hover:shadow-sm"
                >
                  <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <span className="rounded-full border border-slate-200 px-2.5 py-1 text-slate-600">
                      {template.status}
                    </span>
                    <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-emerald-700">
                      {template.category.name}
                    </span>
                    {template.activity ? (
                      <span className="rounded-full border border-slate-200 px-2.5 py-1 text-slate-600">
                        {template.activity.name}
                      </span>
                    ) : null}
                    <span className="rounded-full border border-slate-200 px-2.5 py-1 text-slate-600">
                      v{template.versionNumber}
                    </span>
                  </div>
                  <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h2 className="text-lg font-semibold text-slate-950">
                        {template.title}
                      </h2>
                      <p className="mt-1 text-sm text-slate-600">
                        {template.description}
                      </p>
                    </div>
                    <Link
                      href={`/admin/templates/${template.id}/edit`}
                      className="inline-flex h-9 items-center justify-center rounded-md border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-100"
                    >
                      Edit template
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-8 flex flex-col gap-3 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
            <p>
              Page {templates.pagination.page} of {templates.pagination.totalPages} ·{" "}
              {templates.pagination.total} templates
            </p>
            <div className="flex gap-2">
              <Link
                href={buildAdminTemplatesHref({
                  q: query,
                  status,
                  category,
                  page: Math.max(1, templates.pagination.page - 1),
                })}
                aria-disabled={templates.pagination.page <= 1}
                className="rounded-md border border-slate-300 bg-white px-3 py-2 font-medium text-slate-800 transition hover:bg-slate-100 aria-disabled:pointer-events-none aria-disabled:opacity-50"
              >
                Previous
              </Link>
              <Link
                href={buildAdminTemplatesHref({
                  q: query,
                  status,
                  category,
                  page: Math.min(templates.pagination.totalPages, templates.pagination.page + 1),
                })}
                aria-disabled={templates.pagination.page >= templates.pagination.totalPages}
                className="rounded-md border border-slate-300 bg-white px-3 py-2 font-medium text-slate-800 transition hover:bg-slate-100 aria-disabled:pointer-events-none aria-disabled:opacity-50"
              >
                Next
              </Link>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <h2 className="text-lg font-semibold text-slate-950">Create new template</h2>
          <p className="mt-2 text-sm text-slate-600">
            Start a draft template and add sections on the edit screen.
          </p>
          <AdminActionForm action={createAdminTemplateAction} className="mt-4 space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-slate-800">
                Title
              </label>
              <input
                id="title"
                name="title"
                required
                className="mt-2 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-950 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
                placeholder="Template title"
              />
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-slate-800">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                required
                rows={4}
                className="mt-2 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-950 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
                placeholder="Short template summary"
              />
            </div>
            <div>
              <label htmlFor="categoryId" className="block text-sm font-medium text-slate-800">
                Category
              </label>
              <select
                id="categoryId"
                name="categoryId"
                required
                className="mt-2 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-950 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
              >
                <option value="">Select category</option>
                {categories.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="activityId" className="block text-sm font-medium text-slate-800">
                Activity (optional)
              </label>
              <select
                id="activityId"
                name="activityId"
                className="mt-2 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-950 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
              >
                <option value="">No activity</option>
                {activities.data.map((activity) => (
                  <option key={activity.id} value={activity.id}>
                    {activity.name} · {activity.category.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-slate-800">
                Status
              </label>
              <select
                id="status"
                name="status"
                defaultValue="draft"
                className="mt-2 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-950 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            <button
              type="submit"
              className="inline-flex h-10 w-full items-center justify-center rounded-md bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Create draft
            </button>
          </AdminActionForm>
        </div>
      </div>
    </section>
  );
}
