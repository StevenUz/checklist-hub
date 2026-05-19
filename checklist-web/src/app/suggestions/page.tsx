import Link from "next/link";
import { redirect } from "next/navigation";

import { SuggestionCommentForm } from "@/app/suggestions/components/SuggestionCommentForm";
import { getCurrentUser } from "@/lib/auth";
import { listUserSuggestions } from "@/services/suggestionService";

type SuggestionsPageProps = {
  searchParams: Promise<{
    page?: string;
  }>;
};

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

function buildSuggestionsHref(page: number) {
  return page > 1 ? `/suggestions?page=${page}` : "/suggestions";
}

function formatDate(value: Date) {
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default async function SuggestionsPage({ searchParams }: SuggestionsPageProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const resolvedSearchParams = await searchParams;
  const page = Number(resolvedSearchParams.page ?? "1");

  const suggestions = await listUserSuggestions({
    userId: user.id,
    page: Number.isInteger(page) && page > 0 ? page : 1,
    pageSize: 6,
  });

  return (
    <section className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950">Suggestions</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Track your submitted ideas and keep the discussion moving.
          </p>
        </div>
        <Link
          href="/suggestions/new"
          className="inline-flex h-10 items-center justify-center rounded-md bg-emerald-600 px-4 text-sm font-semibold text-white transition hover:bg-emerald-700"
        >
          New suggestion
        </Link>
      </div>

      {suggestions.data.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center text-slate-600">
          You have not submitted any suggestions yet.
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
                </div>
                <div className="text-sm text-slate-500">
                  Submitted {formatDate(suggestion.createdAt)}
                </div>
              </div>

              {suggestion.targetTemplate ? (
                <div className="mt-4 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
                  Target template: {suggestion.targetTemplate.title}
                </div>
              ) : null}

              {suggestion.adminNotes ? (
                <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
                  Admin notes: {suggestion.adminNotes}
                </div>
              ) : null}

              <div className="mt-5">
                <h3 className="text-sm font-semibold text-slate-800">Discussion</h3>
                {suggestion.comments.length === 0 ? (
                  <p className="mt-2 text-sm text-slate-500">No comments yet.</p>
                ) : (
                  <div className="mt-3 space-y-3">
                    {suggestion.comments.map((comment) => (
                      <div
                        key={comment.id}
                        className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2"
                      >
                        <p className="text-sm text-slate-700">{comment.text}</p>
                        <p className="mt-1 text-xs text-slate-500">
                          {comment.user?.name ?? "Former user"} · {formatDate(comment.createdAt)}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                <SuggestionCommentForm suggestionId={suggestion.id} />
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
            href={buildSuggestionsHref(Math.max(1, suggestions.pagination.page - 1))}
            aria-disabled={suggestions.pagination.page <= 1}
            className="rounded-md border border-slate-300 bg-white px-3 py-2 font-medium text-slate-800 transition hover:bg-slate-100 aria-disabled:pointer-events-none aria-disabled:opacity-50"
          >
            Previous
          </Link>
          <Link
            href={buildSuggestionsHref(
              Math.min(suggestions.pagination.totalPages, suggestions.pagination.page + 1),
            )}
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
