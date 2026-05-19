import Link from "next/link";
import { redirect } from "next/navigation";

import { updateUserRoleAction } from "@/actions/adminActions";
import { AdminActionForm } from "@/app/admin/components/AdminActionForm";
import { getCurrentUser } from "@/lib/auth";
import { listAdminUsers } from "@/services/adminService";

type AdminUsersPageProps = {
  searchParams: Promise<{
    page?: string;
  }>;
};

function formatDate(value: Date) {
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function buildUsersHref(page: number) {
  return page > 1 ? `/admin/users?page=${page}` : "/admin/users";
}

export default async function AdminUsersPage({ searchParams }: AdminUsersPageProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "admin") {
    redirect("/dashboard");
  }

  const resolvedSearchParams = await searchParams;
  const page = Number(resolvedSearchParams.page ?? "1");

  const users = await listAdminUsers({
    page: Number.isInteger(page) && page > 0 ? page : 1,
    pageSize: 10,
  });

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
          Admin users
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">User roles</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Assign admin roles and keep access aligned with the team.
        </p>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-5">
        <div className="space-y-4">
          {users.data.map((member) => (
            <div
              key={member.id}
              className="flex flex-col gap-3 border-b border-slate-100 pb-4 last:border-b-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="text-sm font-semibold text-slate-950">{member.name}</p>
                <p className="text-xs text-slate-500">{member.email}</p>
                <p className="mt-1 text-xs text-slate-500">
                  Joined {formatDate(member.createdAt)}
                </p>
              </div>
              <AdminActionForm action={updateUserRoleAction} className="flex items-center gap-2">
                <input type="hidden" name="userId" value={member.id} />
                <select
                  name="role"
                  defaultValue={member.role}
                  className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
                <button
                  type="submit"
                  className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-800 transition hover:bg-slate-100"
                >
                  Update
                </button>
              </AdminActionForm>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
        <p>
          Page {users.pagination.page} of {users.pagination.totalPages} · {users.pagination.total} users
        </p>
        <div className="flex gap-2">
          <Link
            href={buildUsersHref(Math.max(1, users.pagination.page - 1))}
            aria-disabled={users.pagination.page <= 1}
            className="rounded-md border border-slate-300 bg-white px-3 py-2 font-medium text-slate-800 transition hover:bg-slate-100 aria-disabled:pointer-events-none aria-disabled:opacity-50"
          >
            Previous
          </Link>
          <Link
            href={buildUsersHref(Math.min(users.pagination.totalPages, users.pagination.page + 1))}
            aria-disabled={users.pagination.page >= users.pagination.totalPages}
            className="rounded-md border border-slate-300 bg-white px-3 py-2 font-medium text-slate-800 transition hover:bg-slate-100 aria-disabled:pointer-events-none aria-disabled:opacity-50"
          >
            Next
          </Link>
        </div>
      </div>
    </section>
  );
}
