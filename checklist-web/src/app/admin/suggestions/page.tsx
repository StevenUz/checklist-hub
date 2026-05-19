import Link from "next/link";
import { redirect } from "next/navigation";

import { convertSuggestionAction, updateSuggestionStatusAction } from "@/actions/adminActions";
import { AdminActionForm } from "@/app/admin/components/AdminActionForm";
import { getCurrentUser } from "@/lib/auth";
import { listAdminSuggestions, listAdminActivities } from "@/services/adminService";
import { listTemplateCategories } from "@/services/templateService";

const typeLabels: Record<string, string> = {
  new_activity: "New activity",
  new_template: "New template",
  template_edit: "Edit template",
  template_variant: "New variant",
};

const statusLabels: Record<string, string> = {
  pending: "Pending",
  accepted: "Accepted",
  rejected: "Rejected",
  implemented: "Implemented",
};

const statusStyles: Record<string, string> = {
  pending: "border-amber-200 bg-amber-50 text-amber-700",
  accepted: "border-emerald-200 bg-emerald-50 text-emerald-700",
  rejected: "border-rose-200 bg-rose-50 text-rose-700",
  implemented: "border-slate-200 bg-slate-100 text-slate-700",
};

type AdminSuggestionsPageProps = {
  searchParams: Promise<{
    status?: string;
    page?: string;
  }>;
};

function buildSuggestionsHref(params: { status?: string; page?: number }) {
  const searchParams = new URLSearchParams();

  if (params.status) {
    searchParams.set("status", params.status);
  }

  if (params.page && params.page > 1) {
    searchParams.set("page", String(params.page));
  }

  const query = searchParams.toString();
  return query ? `/admin/suggestions?${query}` : "/admin/suggestions";
}

function formatDate(value: Date) {
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default async function AdminSuggestionsPage({ searchParams }: AdminSuggestionsPageProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "admin") {
    redirect("/dashboard");
  }

  const resolvedSearchParams = await searchParams;
  const status = resolvedSearchParams.status?.trim() ?? "";
  const page = Number(resolvedSearchParams.page ?? "1");

  const [suggestions, categories, activities] = await Promise.all([
    listAdminSuggestions({
      status,
      page: Number.isInteger(page) && page > 0 ? page : 1,
      pageSize: 6,
    }),
    listTemplateCategories(),
    listAdminActivities({ page: 1, pageSize: 200 }),
  ]);

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
            Admin suggestions
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
            Suggestion review queue
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Accept, reject, or convert suggestions into new templates.
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
          {suggestions.pagination.total} total suggestions
        </div>
      </div>

      <form className="mb-6 flex flex-wrap gap-2 rounded-lg border border-slate-200 bg-white p-4 text-sm">
        <label className="text-sm font-medium text-slate-800" htmlFor="status">
          Status
        </label>
        <select
          id="status"
          name="status"
          defaultValue={status}
          className="rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-950 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
        >
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="accepted">Accepted</option>
          <option value="rejected">Rejected</option>
          <option value="implemented">Implemented</option>
        </select>
        <button
          type="submit"
          className="inline-flex h-10 items-center justify-center rounded-md bg-emerald-600 px-4 text-sm font-semibold text-white transition hover:bg-emerald-700"
        >
          Apply
        </button>
      </form>

      {suggestions.data.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center text-slate-600">
          No suggestions in this queue.
        </div>
      ) : (
        <div className="space-y-5">
          {suggestions.data.map((suggestion) => (
            <div key={suggestion.id} className="rounded-lg border border-slate-200 bg-white p-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <span className="rounded-full border border-slate-200 px-2.5 py-1 text-slate-600">
                      {typeLabels[suggestion.type] ?? suggestion.type}
                    </span>
                    <span
                      className={`rounded-full border px-2.5 py-1 ${
                        statusStyles[suggestion.status] ?? "border-slate-200 bg-slate-100 text-slate-700"
                      }`}
                    >
                      {statusLabels[suggestion.status] ?? suggestion.status}
                    </span>
                  </div>
                  <h2 className="mt-3 text-xl font-semibold text-slate-950">
                    {suggestion.title}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {suggestion.description}
                  </p>
                  <p className="mt-3 text-xs text-slate-500">
                    Submitted by {suggestion.user?.name ?? "Former user"} ·{" "}
                    {suggestion.user?.email ?? "No email"} · {formatDate(suggestion.createdAt)}
                  </p>
                </div>
                <div className="text-sm text-slate-500">
                  {suggestion.targetTemplate ? (
                    <p>
                      Target: {suggestion.targetTemplate.title}
                    </p>
                  ) : null}
                </div>
              </div>

              {suggestion.comments.length > 0 ? (
                <div className="mt-4 rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Discussion
                  </p>
                  <div className="mt-2 space-y-2">
                    {suggestion.comments.map((comment) => (
                      <div key={comment.id} className="rounded-md border border-slate-200 bg-white px-3 py-2">
                        <p className="text-sm text-slate-700">{comment.text}</p>
                        <p className="mt-1 text-xs text-slate-500">
                          {comment.user?.name ?? "Former user"} · {formatDate(comment.createdAt)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              <div className="mt-5 grid gap-4 lg:grid-cols-3">
                <AdminActionForm
                  action={updateSuggestionStatusAction}
                  className="rounded-md border border-slate-200 p-4"
                >
                  <input type="hidden" name="suggestionId" value={suggestion.id} />
                  <input type="hidden" name="status" value="accepted" />
                  <p className="text-sm font-semibold text-slate-900">Accept suggestion</p>
                  <textarea
                    name="adminNotes"
                    rows={2}
                    placeholder="Optional notes to the submitter"
                    className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
                  />
                  <button
                    type="submit"
                    className="mt-3 inline-flex h-9 w-full items-center justify-center rounded-md bg-emerald-600 px-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
                  >
                    Accept
                  </button>
                </AdminActionForm>

                <AdminActionForm
                  action={updateSuggestionStatusAction}
                  className="rounded-md border border-slate-200 p-4"
                >
                  <input type="hidden" name="suggestionId" value={suggestion.id} />
                  <input type="hidden" name="status" value="rejected" />
                  <p className="text-sm font-semibold text-slate-900">Reject suggestion</p>
                  <textarea
                    name="adminNotes"
                    rows={2}
                    placeholder="Explain why it was rejected"
                    className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
                  />
                  <button
                    type="submit"
                    className="mt-3 inline-flex h-9 w-full items-center justify-center rounded-md bg-rose-600 px-3 text-sm font-semibold text-white transition hover:bg-rose-700"
                  >
                    Reject
                  </button>
                </AdminActionForm>

                {(suggestion.type === "new_template" ||
                  suggestion.type === "template_edit" ||
                  suggestion.type === "template_variant") &&
                suggestion.status !== "implemented" ? (
                  <AdminActionForm
                    action={convertSuggestionAction}
                    className="rounded-md border border-slate-200 p-4"
                  >
                    <input type="hidden" name="suggestionId" value={suggestion.id} />
                    <input
                      type="hidden"
                      name="mode"
                      value={
                        suggestion.type === "template_edit"
                          ? "update"
                          : suggestion.type === "template_variant"
                            ? "variant"
                            : "new_template"
                      }
                    />
                    <p className="text-sm font-semibold text-slate-900">Convert to template</p>
                    {suggestion.type === "new_template" ? (
                      <>
                        <label className="mt-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Category
                        </label>
                        <select
                          name="categoryId"
                          required
                          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
                        >
                          <option value="">Select category</option>
                          {categories.map((item) => (
                            <option key={item.id} value={item.id}>
                              {item.name}
                            </option>
                          ))}
                        </select>
                        <label className="mt-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Activity (optional)
                        </label>
                        <select
                          name="activityId"
                          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
                        >
                          <option value="">No activity</option>
                          {activities.data.map((activity) => (
                            <option key={activity.id} value={activity.id}>
                              {activity.name} · {activity.category.name}
                            </option>
                          ))}
                        </select>
                      </>
                    ) : null}
                    <textarea
                      name="adminNotes"
                      rows={2}
                      placeholder="Optional notes for the conversion"
                      className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
                    />
                    <button
                      type="submit"
                      className="mt-3 inline-flex h-9 w-full items-center justify-center rounded-md bg-slate-950 px-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                    >
                      Convert
                    </button>
                  </AdminActionForm>
                ) : (
                  <div className="rounded-md border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                    Conversion is not available for this suggestion.
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 flex flex-col gap-3 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
        <p>
          Page {suggestions.pagination.page} of {suggestions.pagination.totalPages} ·{" "}
          {suggestions.pagination.total} suggestions
        </p>
        <div className="flex gap-2">
          <Link
            href={buildSuggestionsHref({
              status,
              page: Math.max(1, suggestions.pagination.page - 1),
            })}
            aria-disabled={suggestions.pagination.page <= 1}
            className="rounded-md border border-slate-300 bg-white px-3 py-2 font-medium text-slate-800 transition hover:bg-slate-100 aria-disabled:pointer-events-none aria-disabled:opacity-50"
          >
            Previous
          </Link>
          <Link
            href={buildSuggestionsHref({
              status,
              page: Math.min(suggestions.pagination.totalPages, suggestions.pagination.page + 1),
            })}
            aria-disabled={suggestions.pagination.page >= suggestions.pagination.totalPages}
            className="rounded-md border border-slate-300 bg-white px-3 py-2 font-medium text-slate-800 transition hover:bg-slate-100 aria-disabled:pointer-events-none aria-disabled:opacity-50"
          >
            Next
          </Link>
        </div>
      </div>
    </section>
  );
}
