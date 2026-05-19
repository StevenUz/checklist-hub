import { RegisterForm } from "@/app/components/RegisterForm";

export default function RegisterPage() {
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
