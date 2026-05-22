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

function sanitizeFileName(input: string) {
  return input
    .trim()
    .replace(/[\\/:*?"<>|]+/g, "-")
    .replace(/\s+/g, " ")
    .slice(0, 80);
}

export default function ChecklistClient({ checklist }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleExportPdf = async () => {
    if (isExporting) {
      return;
    }

    setIsExporting(true);

    try {
      const { jsPDF } = await import("jspdf");

      const doc = new jsPDF({ unit: "pt", format: "a4" });
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const marginX = 40;
      const marginTop = 50;
      const marginBottom = 50;
      const maxWidth = pageWidth - marginX * 2;

      const ensureSpace = (y: number, neededHeight: number) => {
        if (y + neededHeight <= pageHeight - marginBottom) {
          return y;
        }

        doc.addPage();
        return marginTop;
      };

      const writeWrapped = (input: {
        text: string;
        x: number;
        y: number;
        fontSize: number;
        fontStyle?: "normal" | "bold";
        maxWidth: number;
        lineGap?: number;
      }) => {
        const lineGap = input.lineGap ?? 4;
        doc.setFont("helvetica", input.fontStyle ?? "normal");
        doc.setFontSize(input.fontSize);

        const lines = doc.splitTextToSize(input.text, input.maxWidth);
        let cursorY = input.y;
        const lineHeight = input.fontSize + lineGap;

        for (const line of lines) {
          cursorY = ensureSpace(cursorY, lineHeight);
          doc.text(String(line), input.x, cursorY);
          cursorY += lineHeight;
        }

        return cursorY;
      };

      let y = marginTop;

      y = writeWrapped({
        text: checklist.title,
        x: marginX,
        y,
        fontSize: 18,
        fontStyle: "bold",
        maxWidth,
        lineGap: 6,
      });

      if (checklist.description) {
        y += 6;
        y = writeWrapped({
          text: checklist.description,
          x: marginX,
          y,
          fontSize: 11,
          maxWidth,
        });
      }

      y += 8;
      y = writeWrapped({
        text: `Progress: ${checklist.progress.completedItems} / ${checklist.progress.totalItems} complete (${checklist.progress.percentage}%)`,
        x: marginX,
        y,
        fontSize: 10,
        maxWidth,
      });

      y += 14;

      checklist.sections.forEach((section, sectionIndex) => {
        const sectionTitle = `${sectionIndex + 1}. ${section.title}`;
        y = ensureSpace(y, 24);
        y = writeWrapped({
          text: sectionTitle,
          x: marginX,
          y,
          fontSize: 13,
          fontStyle: "bold",
          maxWidth,
          lineGap: 5,
        });

        for (const item of section.items) {
          const prefix = item.isCompleted ? "[x]" : "[ ]";
          y = writeWrapped({
            text: `${prefix} ${item.text}`,
            x: marginX + 12,
            y,
            fontSize: 11,
            maxWidth: maxWidth - 12,
            lineGap: 4,
          });
        }

        y += 10;
      });

      const safeTitle = sanitizeFileName(checklist.title) || "checklist";
      doc.save(`${safeTitle}.pdf`);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <section className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="rounded-lg border border-white/80 bg-white/90 p-6 shadow-sm backdrop-blur">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-3">
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
              <button
                type="button"
                onClick={() => void handleExportPdf()}
                disabled={isExporting}
                className="rounded-lg bg-slate-800 px-3 py-2 text-white transition hover:bg-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isExporting ? "Exporting..." : "Export as PDF"}
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
