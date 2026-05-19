"use client";

import { useActionState } from "react";

import type { AdminActionState } from "@/actions/adminActions";

type AdminAction = (
  previousState: AdminActionState,
  formData: FormData,
) => Promise<AdminActionState>;

type AdminActionFormProps = {
  action: AdminAction;
  className?: string;
  children: React.ReactNode;
};

export function AdminActionForm({ action, className, children }: AdminActionFormProps) {
  const [state, formAction] = useActionState(action, {});

  return (
    <form action={formAction} className={className}>
      {state.error ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      ) : null}
      {children}
    </form>
  );
}
