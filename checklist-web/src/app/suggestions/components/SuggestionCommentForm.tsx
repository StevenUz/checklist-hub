"use client";

import { useActionState } from "react";

import { addSuggestionCommentAction } from "@/actions/suggestionActions";

type SuggestionCommentFormProps = {
  suggestionId: number;
};

export function SuggestionCommentForm({ suggestionId }: SuggestionCommentFormProps) {
  const [state, formAction, isPending] = useActionState(addSuggestionCommentAction, {});

  return (
    <form action={formAction} className="mt-4 space-y-3">
      {state.error ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      ) : null}
      <input type="hidden" name="suggestionId" value={suggestionId} />
      <div>
        <label htmlFor={`comment-${suggestionId}`} className="block text-sm font-medium text-slate-800">
          Add a comment
        </label>
        <textarea
          id={`comment-${suggestionId}`}
          name="text"
          rows={3}
          required
          maxLength={1000}
          className="mt-2 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
          placeholder="Share extra context or clarifications"
        />
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="inline-flex h-9 items-center justify-center rounded-md border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-100"
      >
        {isPending ? "Posting..." : "Post comment"}
      </button>
    </form>
  );
}
