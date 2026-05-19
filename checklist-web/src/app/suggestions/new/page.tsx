import { redirect } from "next/navigation";

import { SuggestionForm } from "@/app/suggestions/components/SuggestionForm";
import { getCurrentUser } from "@/lib/auth";

export default async function NewSuggestionPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <section className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950">
          Submit a suggestion
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Propose new templates, activities, or edits. Your suggestions help keep official
          checklists sharp.
        </p>
      </div>
      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <SuggestionForm />
      </div>
    </section>
  );
}
