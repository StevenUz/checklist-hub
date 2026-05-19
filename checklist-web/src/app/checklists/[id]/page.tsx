import { notFound, redirect } from "next/navigation";

import {
  addChecklistItemAction,
  addChecklistSectionAction,
  deleteChecklistItemAction,
  deleteChecklistSectionAction,
  toggleChecklistItemAction,
  updateChecklistItemAction,
  updateChecklistSectionAction,
} from "@/actions/checklistActions";
import { getCurrentUser } from "@/lib/auth";
import { getUserChecklistDetails } from "@/services/checklistService";

type ChecklistPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ChecklistPage({ params }: ChecklistPageProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const resolvedParams = await params;
  const checklistId = Number(resolvedParams.id);

  if (!Number.isInteger(checklistId) || checklistId <= 0) {
    notFound();
  }

  const checklist = await getUserChecklistDetails({ checklistId, userId: user.id });

  if (!checklist) {
    notFound();
  }

  return (
    <section className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-950">
              {checklist.title}
            </h1>
            {checklist.description ? (
              <p className="mt-2 text-sm leading-6 text-slate-600">{checklist.description}</p>
            ) : null}
          </div>
          <div className="rounded-lg bg-emerald-50 px-4 py-3 text-emerald-800">
            <p className="text-2xl font-semibold">{checklist.progress.percentage}%</p>
            <p className="text-xs font-medium">
              {checklist.progress.completedItems} / {checklist.progress.totalItems} complete
            </p>
          </div>
        </div>
        <div className="mt-5 h-3 rounded-full bg-slate-100">
          <div
            className="h-3 rounded-full bg-emerald-500"
            style={{ width: `${checklist.progress.percentage}%` }}
          />
        </div>
      </div>

      <form action={addChecklistSectionAction} className="mt-6 flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4 sm:flex-row">
        <input type="hidden" name="checklistId" value={checklist.id} />
        <input
          name="title"
          required
          placeholder="Add a new section"
          className="min-h-10 flex-1 rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
        />
        <button className="rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white">
          Add section
        </button>
      </form>

      <div className="mt-6 space-y-5">
        {checklist.sections.map((section) => (
          <section key={section.id} className="rounded-lg border border-slate-200 bg-white p-5">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <form action={updateChecklistSectionAction} className="flex flex-1 gap-2">
                <input type="hidden" name="sectionId" value={section.id} />
                <input
                  name="title"
                  defaultValue={section.title}
                  required
                  className="min-h-10 flex-1 rounded-md border border-slate-300 px-3 text-sm font-semibold text-slate-950 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
                />
                <button className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium">
                  Save
                </button>
              </form>
              <form action={deleteChecklistSectionAction}>
                <input type="hidden" name="sectionId" value={section.id} />
                <button className="rounded-md border border-red-200 px-3 py-2 text-sm font-medium text-red-700">
                  Delete section
                </button>
              </form>
            </div>

            <div className="mt-4 space-y-3">
              {section.items.map((item) => (
                <div key={item.id} className="grid gap-2 rounded-md border border-slate-100 p-3 lg:grid-cols-[auto_1fr_auto] lg:items-center">
                  <form action={toggleChecklistItemAction}>
                    <input type="hidden" name="itemId" value={item.id} />
                    <button
                      className={`h-7 w-7 rounded-md border text-sm font-semibold ${
                        item.isCompleted
                          ? "border-emerald-600 bg-emerald-600 text-white"
                          : "border-slate-300 bg-white text-slate-400"
                      }`}
                      aria-label={item.isCompleted ? "Mark incomplete" : "Mark complete"}
                    >
                      {item.isCompleted ? "✓" : ""}
                    </button>
                  </form>
                  <form action={updateChecklistItemAction} className="flex gap-2">
                    <input type="hidden" name="itemId" value={item.id} />
                    <input
                      name="text"
                      defaultValue={item.text}
                      required
                      className="min-h-10 flex-1 rounded-md border border-slate-300 px-3 text-sm text-slate-800 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
                    />
                    <button className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium">
                      Save
                    </button>
                  </form>
                  <form action={deleteChecklistItemAction}>
                    <input type="hidden" name="itemId" value={item.id} />
                    <button className="rounded-md border border-red-200 px-3 py-2 text-sm font-medium text-red-700">
                      Delete
                    </button>
                  </form>
                </div>
              ))}
            </div>

            <form action={addChecklistItemAction} className="mt-4 flex flex-col gap-2 sm:flex-row">
              <input type="hidden" name="sectionId" value={section.id} />
              <input
                name="text"
                required
                placeholder="Add an item"
                className="min-h-10 flex-1 rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
              />
              <button className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white">
                Add item
              </button>
            </form>
          </section>
        ))}
      </div>
    </section>
  );
}
