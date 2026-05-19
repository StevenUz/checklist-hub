import { redirect } from "next/navigation";

import { RegisterForm } from "@/app/components/RegisterForm";
import { getCurrentUser } from "@/lib/auth";

export default async function RegisterPage() {
  const user = await getCurrentUser();

  if (user) {
    redirect("/");
  }

  return (
    <section className="mx-auto flex w-full max-w-md flex-col px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950">Register</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Create an account to save, customize, and complete checklist copies.
        </p>
      </div>
      <RegisterForm />
    </section>
  );
}
