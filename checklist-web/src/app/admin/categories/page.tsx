import { redirect } from "next/navigation";

import { createActivityAction, createCategoryAction } from "@/actions/adminActions";
import { AdminActionForm } from "@/app/admin/components/AdminActionForm";
import { getCurrentUser } from "@/lib/auth";
import { listAdminActivities, listAdminCategories } from "@/services/adminService";

type AdminCategoriesPageProps = {
  searchParams: Promise<{
    categoryPage?: string;
    activityPage?: string;
  }>;
};

export default async function AdminCategoriesPage({ searchParams }: AdminCategoriesPageProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "admin") {
    redirect("/dashboard");
  }

  const resolvedSearchParams = await searchParams;
  const categoryPage = Number(resolvedSearchParams.categoryPage ?? "1");
  const activityPage = Number(resolvedSearchParams.activityPage ?? "1");

  const [categories, activities] = await Promise.all([
    listAdminCategories({
      page: Number.isInteger(categoryPage) && categoryPage > 0 ? categoryPage : 1,
      pageSize: 8,
    }),
    listAdminActivities({
      page: Number.isInteger(activityPage) && activityPage > 0 ? activityPage : 1,
      pageSize: 8,
    }),
  ]);

  const buildHref = (nextCategoryPage: number, nextActivityPage: number) => {
    const params = new URLSearchParams();
    if (nextCategoryPage > 1) {
      params.set("categoryPage", String(nextCategoryPage));
    }
    if (nextActivityPage > 1) {
      params.set("activityPage", String(nextActivityPage));
    }
    const query = params.toString();
    return query ? `/admin/categories?${query}` : "/admin/categories";
  };

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
          Admin categories
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
          Categories & activities
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Manage the taxonomy used by templates and activities.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <div className="rounded-lg border border-slate-200 bg-white p-5">
            <h2 className="text-lg font-semibold text-slate-950">Categories</h2>
            <div className="mt-4 space-y-3">
              {categories.data.map((category) => (
                <div key={category.id} className="rounded-md border border-slate-200 p-4">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-950">{category.name}</p>
                      <p className="text-xs text-slate-500">{category.slug}</p>
                      {category.description ? (
                        <p className="mt-2 text-sm text-slate-600">{category.description}</p>
                      ) : null}
                    </div>
                    <div className="text-xs text-slate-600">
                      {category.activityCount} activities · {category.templateCount} templates
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center justify-between text-sm text-slate-600">
              <span>
                Page {categories.pagination.page} of {categories.pagination.totalPages}
              </span>
              <div className="flex gap-2">
                <a
                  href={buildHref(
                    Math.max(1, categories.pagination.page - 1),
                    activities.pagination.page,
                  )}
                  aria-disabled={categories.pagination.page <= 1}
                  className="rounded-md border border-slate-300 bg-white px-3 py-1.5 font-medium text-slate-800 transition hover:bg-slate-100 aria-disabled:pointer-events-none aria-disabled:opacity-50"
                >
                  Previous
                </a>
                <a
                  href={buildHref(
                    Math.min(categories.pagination.totalPages, categories.pagination.page + 1),
                    activities.pagination.page,
                  )}
                  aria-disabled={categories.pagination.page >= categories.pagination.totalPages}
                  className="rounded-md border border-slate-300 bg-white px-3 py-1.5 font-medium text-slate-800 transition hover:bg-slate-100 aria-disabled:pointer-events-none aria-disabled:opacity-50"
                >
                  Next
                </a>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-5">
            <h2 className="text-lg font-semibold text-slate-950">Activities</h2>
            <div className="mt-4 space-y-3">
              {activities.data.map((activity) => (
                <div key={activity.id} className="rounded-md border border-slate-200 p-4">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-950">{activity.name}</p>
                      <p className="text-xs text-slate-500">{activity.slug}</p>
                      {activity.description ? (
                        <p className="mt-2 text-sm text-slate-600">{activity.description}</p>
                      ) : null}
                    </div>
                    <div className="text-xs text-slate-600">{activity.category.name}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center justify-between text-sm text-slate-600">
              <span>
                Page {activities.pagination.page} of {activities.pagination.totalPages}
              </span>
              <div className="flex gap-2">
                <a
                  href={buildHref(
                    categories.pagination.page,
                    Math.max(1, activities.pagination.page - 1),
                  )}
                  aria-disabled={activities.pagination.page <= 1}
                  className="rounded-md border border-slate-300 bg-white px-3 py-1.5 font-medium text-slate-800 transition hover:bg-slate-100 aria-disabled:pointer-events-none aria-disabled:opacity-50"
                >
                  Previous
                </a>
                <a
                  href={buildHref(
                    categories.pagination.page,
                    Math.min(activities.pagination.totalPages, activities.pagination.page + 1),
                  )}
                  aria-disabled={activities.pagination.page >= activities.pagination.totalPages}
                  className="rounded-md border border-slate-300 bg-white px-3 py-1.5 font-medium text-slate-800 transition hover:bg-slate-100 aria-disabled:pointer-events-none aria-disabled:opacity-50"
                >
                  Next
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-lg border border-slate-200 bg-white p-5">
            <h2 className="text-lg font-semibold text-slate-950">Create category</h2>
            <AdminActionForm action={createCategoryAction} className="mt-4 space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-slate-800">
                  Name
                </label>
                <input
                  id="name"
                  name="name"
                  required
                  className="mt-2 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-950 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
                />
              </div>
              <div>
                <label htmlFor="slug" className="block text-sm font-medium text-slate-800">
                  Slug (optional)
                </label>
                <input
                  id="slug"
                  name="slug"
                  className="mt-2 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-950 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
                />
              </div>
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-slate-800">
                  Description (optional)
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={3}
                  className="mt-2 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-950 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
                />
              </div>
              <button
                type="submit"
                className="inline-flex h-10 w-full items-center justify-center rounded-md bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Add category
              </button>
            </AdminActionForm>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-5">
            <h2 className="text-lg font-semibold text-slate-950">Create activity</h2>
            <AdminActionForm action={createActivityAction} className="mt-4 space-y-4">
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
                  {categories.data.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="activityName" className="block text-sm font-medium text-slate-800">
                  Name
                </label>
                <input
                  id="activityName"
                  name="name"
                  required
                  className="mt-2 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-950 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
                />
              </div>
              <div>
                <label htmlFor="activitySlug" className="block text-sm font-medium text-slate-800">
                  Slug (optional)
                </label>
                <input
                  id="activitySlug"
                  name="slug"
                  className="mt-2 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-950 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
                />
              </div>
              <div>
                <label htmlFor="activityDescription" className="block text-sm font-medium text-slate-800">
                  Description (optional)
                </label>
                <textarea
                  id="activityDescription"
                  name="description"
                  rows={3}
                  className="mt-2 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-950 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
                />
              </div>
              <button
                type="submit"
                className="inline-flex h-10 w-full items-center justify-center rounded-md bg-emerald-600 px-4 text-sm font-semibold text-white transition hover:bg-emerald-700"
              >
                Add activity
              </button>
            </AdminActionForm>
          </div>
        </div>
      </div>
    </section>
  );
}
