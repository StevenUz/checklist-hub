import Link from "next/link";
import { notFound } from "next/navigation";

import { startChecklistAction } from "@/actions/checklistActions";
import { getTemplateDetails } from "@/services/templateService";

type TemplateDetailsPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function TemplateDetailsPage({ params }: TemplateDetailsPageProps) {
  const resolvedParams = await params;
  const templateId = Number(resolvedParams.id);

  if (!Number.isInteger(templateId) || templateId <= 0) {
    notFound();
  }

  const template = await getTemplateDetails(templateId);

  if (!template) {
    notFound();
  }

  return (
    <section className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <Link href="/templates" className="text-sm font-medium text-emerald-700 hover:text-emerald-800">
        Back to templates
      </Link>

      <div className="mt-6 rounded-lg border border-slate-200 bg-white p-6">
        <div className="mb-4 flex flex-wrap gap-2 text-xs font-medium">
          <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-emerald-700">
            {template.category.name}
          </span>
          {template.activity ? (
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-700">
              {template.activity.name}
            </span>
          ) : null}
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-700">
            Version {template.versionNumber}
          </span>
        </div>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950">{template.title}</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">{template.description}</p>

        <form action={startChecklistAction} className="mt-6">
          <input type="hidden" name="templateId" value={template.id} />
          <button
            type="submit"
            className="inline-flex h-11 items-center justify-center rounded-md bg-emerald-600 px-5 text-sm font-semibold text-white transition hover:bg-emerald-700"
          >
            Start Checklist
          </button>
        </form>
      </div>

      <div className="mt-8 space-y-5">
        {template.sections.map((section) => (
          <section key={section.id} className="rounded-lg border border-slate-200 bg-white p-5">
            <h2 className="text-xl font-semibold text-slate-950">{section.title}</h2>
            {section.description ? (
              <p className="mt-2 text-sm leading-6 text-slate-600">{section.description}</p>
            ) : null}
            <ol className="mt-4 space-y-3">
              {section.items.map((item) => (
                <li key={item.id} className="flex gap-3 text-sm leading-6 text-slate-700">
                  <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-emerald-500" />
                  <span>{item.text}</span>
                </li>
              ))}
            </ol>
          </section>
        ))}
      </div>
    </section>
  );
}
