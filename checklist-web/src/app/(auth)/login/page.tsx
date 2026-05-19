import { redirect } from "next/navigation";

import { LoginForm } from "@/app/components/LoginForm";
import { getCurrentUser } from "@/lib/auth";

export default async function LoginPage() {
  const user = await getCurrentUser();

  if (user) {
    redirect("/");
  }

  return (
    <section className="mx-auto flex w-full max-w-md flex-col px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950">Login</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Access your personal checklists and saved templates.
        </p>
      </div>
      <LoginForm />
    </section>
  );
}
