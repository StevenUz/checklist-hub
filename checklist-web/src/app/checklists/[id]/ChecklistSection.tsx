"use client";

import { useEffect, useMemo, useState } from "react";

import {
  toggleChecklistItemAction,
  updateChecklistItemAction,
  deleteChecklistItemAction,
  updateChecklistSectionAction,
  deleteChecklistSectionAction,
} from "@/actions/checklistActions";

type ChecklistSectionProps = {
  section: {
    id: number;
    title: string;
    items: Array<{
      id: number;
      text: string;
      isCompleted: boolean;
    }>;
  };
  isEditing?: boolean;
};

export function ChecklistSection({ section, isEditing = false }: ChecklistSectionProps) {
  const isComplete = useMemo(
    () => section.items.length > 0 && section.items.every((item) => item.isCompleted),
    [section.items],
  );
  const [isCollapsed, setIsCollapsed] = useState(isComplete);
  const [editingSectionTitle, setEditingSectionTitle] = useState(false);
  const [editingItemId, setEditingItemId] = useState<number | null>(null);

  useEffect(() => {
    if (!isEditing) {
      setEditingSectionTitle(false);
      setEditingItemId(null);
    }
  }, [isEditing]);

  useEffect(() => {
    if (isComplete) {
      setIsCollapsed(true);
    }
  }, [isComplete]);

  return (
    <section className="rounded-lg border border-white/80 bg-white/90 p-5 shadow-sm backdrop-blur">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          {editingSectionTitle ? (
            <form action={updateChecklistSectionAction} className="inline-flex items-center gap-2">
              <input type="hidden" name="sectionId" value={section.id} />
              <input
                name="title"
                defaultValue={section.title}
                className="rounded border px-2 py-1 text-sm"
              />
              <button type="submit" className="rounded bg-emerald-50 px-2 py-1 text-emerald-800">
                Save
              </button>
              <button
                type="button"
                onClick={() => setEditingSectionTitle(false)}
                className="rounded px-2 py-1 text-sm"
              >
                Cancel
              </button>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => setIsCollapsed((current) => !current)}
              className="flex w-full items-center justify-between gap-4 rounded-md text-left outline-none transition focus-visible:ring-2 focus-visible:ring-emerald-500/50"
              aria-expanded={!isCollapsed}
            >
              <h2 className={`text-lg font-semibold ${isComplete ? "text-emerald-700" : "text-slate-950"}`}>
                {section.title}
              </h2>
              <span
                className={`text-sm font-semibold ${isComplete ? "text-emerald-700" : "text-slate-500"}`}
              >
                {isCollapsed ? "Show" : "Hide"}
              </span>
            </button>
          )}
        </div>

        {isEditing ? (
          <div className="flex items-center gap-2">
            {!editingSectionTitle ? (
              <button
                type="button"
                onClick={() => setEditingSectionTitle(true)}
                className="rounded bg-amber-100 px-3 py-1 text-sm text-amber-800"
              >
                Edit
              </button>
            ) : null}

            <form action={deleteChecklistSectionAction}>
              <input type="hidden" name="sectionId" value={section.id} />
              <button
                type="submit"
                className="rounded bg-red-100 px-3 py-1 text-sm text-red-800"
                onClick={() => confirm("Delete this section?")}
              >
                Delete
              </button>
            </form>
          </div>
        ) : null}
      </div>

      {!isCollapsed ? (
        <div className="mt-4 space-y-3">
          {section.items.map((item) => (
            <div
              key={item.id}
              className="flex items-start gap-3 rounded-md border border-slate-100 bg-slate-50 p-3"
            >
              <form action={toggleChecklistItemAction}>
                <input type="hidden" name="itemId" value={item.id} />
                <button
                  className={`mt-0.5 flex h-6 w-6 items-center justify-center rounded-md border text-sm font-semibold ${
                    item.isCompleted
                      ? "border-emerald-600 bg-emerald-600 text-white"
                      : "border-slate-300 bg-white text-transparent"
                  }`}
                  aria-label={item.isCompleted ? "Mark incomplete" : "Mark complete"}
                >
                  ✓
                </button>
              </form>

              {editingItemId === item.id ? (
                <form action={updateChecklistItemAction} className="flex-1">
                  <input type="hidden" name="itemId" value={item.id} />
                  <input name="text" defaultValue={item.text} className="w-full rounded border px-2 py-1 text-sm" />
                  <div className="mt-2 flex gap-2">
                    <button type="submit" className="rounded bg-emerald-50 px-3 py-1 text-emerald-800">
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingItemId(null)}
                      className="rounded px-3 py-1 text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <p
                    className={`flex-1 text-sm leading-6 ${
                      item.isCompleted ? "font-medium text-emerald-700" : "text-slate-800"
                    }`}
                  >
                    {item.text}
                  </p>

                  {isEditing ? (
                    <div className="flex flex-col gap-2">
                      <button
                        type="button"
                        onClick={() => setEditingItemId(item.id)}
                        className="rounded bg-amber-100 px-3 py-1 text-sm text-amber-800"
                      >
                        Edit
                      </button>

                      <form action={deleteChecklistItemAction}>
                        <input type="hidden" name="itemId" value={item.id} />
                        <button
                          type="submit"
                          className="rounded bg-red-100 px-3 py-1 text-sm text-red-800"
                          onClick={() => confirm("Delete this item?")}
                        >
                          Delete
                        </button>
                      </form>
                    </div>
                  ) : null}
                </>
              )}
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}
