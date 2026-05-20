"use client";

import { useState } from "react";

import type { ChecklistDetailsDto } from "@checklisthub/shared";
import {
  addChecklistItemAction,
  deleteChecklistItemAction,
  deleteChecklistSectionAction,
  updateChecklistItemAction,
  updateChecklistSectionAction,
} from "@/actions/checklistActions";
import { ChecklistSection } from "./ChecklistSection";

type Props = {
  checklist: ChecklistDetailsDto;
};

export default function ChecklistClient({ checklist }: Props) {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <section className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="rounded-lg border border-white/80 bg-white/90 p-6 shadow-sm backdrop-blur">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-4">
              <h1 className="text-3xl font-semibold tracking-tight text-slate-950">
                {checklist.title}
              </h1>
              <button
                type="button"
                onClick={() => setIsEditing((v) => !v)}
                className="rounded-lg bg-emerald-50 px-3 py-2 text-emerald-800 transition hover:bg-emerald-100"
              >
                {isEditing ? "Done" : "Edit"}
              </button>
            </div>
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
        <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-3 rounded-full bg-gradient-to-r from-cyan-600 to-emerald-600"
            style={{ width: `${checklist.progress.percentage}%` }}
          />
        </div>
      </div>

      <div className="mt-6 space-y-5">
        {checklist.sections.map((section) => (
          <ChecklistSection key={section.id} section={section} isEditing={isEditing} />
        ))}
      </div>
    </section>
  );
}
