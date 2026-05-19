import Link from "next/link";

import { listTemplateCategories, listTemplates } from "@/services/templateService";

type TemplatesPageProps = {
  searchParams: Promise<{
    q?: string;
    category?: string;
    page?: string;
  }>;
};

function buildTemplatesHref(params: { q?: string; category?: string; page?: number }) {
  const searchParams = new URLSearchParams();

  if (params.q) {
    searchParams.set("q", params.q);
  }

  if (params.category) {
    searchParams.set("category", params.category);
  }

  if (params.page && params.page > 1) {
    searchParams.set("page", String(params.page));
  }

  const query = searchParams.toString();
  return query ? `/templates?${query}` : "/templates";
}

export default async function TemplatesPage({ searchParams }: TemplatesPageProps) {
  const resolvedSearchParams = await searchParams;
  const query = resolvedSearchParams.q?.trim() ?? "";
  const category = resolvedSearchParams.category?.trim() ?? "";
  const page = Number(resolvedSearchParams.page ?? "1");

  const [categories, templates] = await Promise.all([
    listTemplateCategories(),
    listTemplates({
      query,
      category,
      page: Number.isInteger(page) && page > 0 ? page : 1,
      pageSize: 8,
    }),
  ]);

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950">Templates</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
          Browse official ChecklistHub templates, filter by category, and start a personal copy.
        </p>
      </div>

      <form className="mb-8 grid gap-3 rounded-lg border border-slate-200 bg-white p-4 md:grid-cols-[1fr_240px_auto]">
        <div>
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
        <div className="flex items-end">
          <button
            type="submit"
            className="inline-flex h-10 w-full items-center justify-center rounded-md bg-emerald-600 px-4 text-sm font-semibold text-white transition hover:bg-emerald-700 md:w-auto"
          >
            Apply
          </button>
        </div>
      </form>

      {templates.data.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center text-slate-600">
          No templates match your filters.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {templates.data.map((template) => (
            <Link
              key={template.id}
              href={`/templates/${template.id}`}
              className="rounded-lg border border-slate-200 bg-white p-5 transition hover:border-emerald-300 hover:shadow-sm"
            >
              <div className="mb-3 flex flex-wrap gap-2 text-xs font-medium">
                <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-emerald-700">
                  {template.category.name}
                </span>
                {template.activity ? (
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-700">
                    {template.activity.name}
                  </span>
                ) : null}
              </div>
              <h2 className="text-lg font-semibold text-slate-950">{template.title}</h2>
              <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">
                {template.description}
              </p>
            </Link>
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
            href={buildTemplatesHref({
              q: query,
              category,
              page: Math.max(1, templates.pagination.page - 1),
            })}
            aria-disabled={templates.pagination.page <= 1}
            className="rounded-md border border-slate-300 bg-white px-3 py-2 font-medium text-slate-800 transition hover:bg-slate-100 aria-disabled:pointer-events-none aria-disabled:opacity-50"
          >
            Previous
          </Link>
          <Link
            href={buildTemplatesHref({
              q: query,
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
    </section>
  );
}
