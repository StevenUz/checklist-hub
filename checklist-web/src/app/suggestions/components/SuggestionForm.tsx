"use client";

import Link from "next/link";
import { useActionState, useMemo, useState } from "react";

import { submitSuggestionAction } from "@/actions/suggestionActions";
import type { SuggestionType } from "@/services/suggestionService";

type SuggestionOption = {
  value: SuggestionType;
  label: string;
  helper: string;
};

const suggestionOptions: SuggestionOption[] = [
  {
    value: "new_activity",
    label: "New activity",
    helper: "Suggest a new activity within an existing category.",
  },
  {
    value: "new_template",
    label: "New template",
    helper: "Propose a brand new checklist template.",
  },
  {
    value: "template_edit",
    label: "Edit existing template",
    helper: "Request edits to an existing official template.",
  },
  {
    value: "template_variant",
    label: "New variant",
    helper: "Request a variant of an existing official template.",
  },
];

function requiresTemplateId(type: SuggestionType) {
  return type === "template_edit" || type === "template_variant";
}

export function SuggestionForm() {
  const [state, formAction, isPending] = useActionState(submitSuggestionAction, {});
  const [selectedType, setSelectedType] = useState<SuggestionType>("new_template");

  const helperText = useMemo(() => {
    return suggestionOptions.find((option) => option.value === selectedType)?.helper ?? "";
  }, [selectedType]);

  return (
    <form action={formAction} className="space-y-5">
      {state.error ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      ) : null}
      <div>
        <label htmlFor="type" className="block text-sm font-medium text-slate-800">
          Suggestion type
        </label>
        <select
          id="type"
          name="type"
          value={selectedType}
          onChange={(event) => setSelectedType(event.target.value as SuggestionType)}
          className="mt-2 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-950 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
        >
          {suggestionOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {helperText ? <p className="mt-2 text-sm text-slate-500">{helperText}</p> : null}
      </div>

      {requiresTemplateId(selectedType) ? (
        <div>
          <label htmlFor="targetTemplateId" className="block text-sm font-medium text-slate-800">
            Template id
          </label>
          <input
            id="targetTemplateId"
            name="targetTemplateId"
            type="number"
            min={1}
            className="mt-2 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
            placeholder="e.g. 42"
            required
          />
          <p className="mt-2 text-sm text-slate-500">
            Find the template id from the template URL in your browser. Browse
            {" "}
            <Link href="/templates" className="text-emerald-700 hover:text-emerald-800">
              templates
            </Link>
            .
          </p>
        </div>
      ) : null}

      <div>
        <label htmlFor="title" className="block text-sm font-medium text-slate-800">
          Title
        </label>
        <input
          id="title"
          name="title"
          type="text"
          required
          maxLength={120}
          className="mt-2 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
          placeholder="Give this suggestion a clear, short title"
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-slate-800">
          Details
        </label>
        <textarea
          id="description"
          name="description"
          required
          rows={6}
          maxLength={2000}
          className="mt-2 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
          placeholder="Share the context, scope, and what you expect to see in the template."
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="inline-flex h-11 w-full items-center justify-center rounded-md bg-emerald-600 px-4 text-sm font-semibold text-white transition hover:bg-emerald-700"
      >
        {isPending ? "Submitting..." : "Submit suggestion"}
      </button>
    </form>
  );
}
