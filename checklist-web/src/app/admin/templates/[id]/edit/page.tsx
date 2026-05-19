import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import {
  addTemplateItemAction,
  addTemplateSectionAction,
  deleteTemplateItemAction,
  deleteTemplateSectionAction,
  updateAdminTemplateMetaAction,
  updateTemplateItemAction,
  updateTemplateSectionAction,
} from "@/actions/adminActions";
import { AdminActionForm } from "@/app/admin/components/AdminActionForm";
import { getCurrentUser } from "@/lib/auth";
import { listTemplateCategories } from "@/services/templateService";
import { getAdminTemplateDetails, listAdminActivities } from "@/services/adminService";

type AdminTemplateEditPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function AdminTemplateEditPage({ params }: AdminTemplateEditPageProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "admin") {
    redirect("/dashboard");
  }

  const resolvedParams = await params;
  const templateId = Number(resolvedParams.id);

  if (!Number.isInteger(templateId) || templateId <= 0) {
    notFound();
  }

  const [template, categories, activities] = await Promise.all([
    getAdminTemplateDetails(templateId),
    listTemplateCategories(),
    listAdminActivities({ page: 1, pageSize: 300 }),
  ]);

  if (!template) {
    notFound();
  }

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <Link href="/admin/templates" className="text-sm font-medium text-emerald-700 hover:text-emerald-800">
        Back to templates
      </Link>

      <div className="mt-4 rounded-lg border border-slate-200 bg-white p-6">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950">
          Edit template
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Update template details, sections, and items.
        </p>

        <AdminActionForm
          action={updateAdminTemplateMetaAction}
          className="mt-6 grid gap-4 md:grid-cols-2"
        >
          <input type="hidden" name="templateId" value={template.id} />
          <div className="md:col-span-2">
            <label htmlFor="title" className="block text-sm font-medium text-slate-800">
              Title
            </label>
            <input
              id="title"
              name="title"
              defaultValue={template.title}
              required
              className="mt-2 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-950 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
            />
          </div>
          <div className="md:col-span-2">
            <label htmlFor="description" className="block text-sm font-medium text-slate-800">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              defaultValue={template.description ?? ""}
              rows={4}
              required
              className="mt-2 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-950 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
            />
          </div>
          <div>
            <label htmlFor="categoryId" className="block text-sm font-medium text-slate-800">
              Category
            </label>
            <select
              id="categoryId"
              name="categoryId"
              defaultValue={template.categoryId}
              className="mt-2 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-950 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
              required
            >
              {categories.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="activityId" className="block text-sm font-medium text-slate-800">
              Activity
            </label>
            <select
              id="activityId"
              name="activityId"
              defaultValue={template.activityId ?? ""}
              className="mt-2 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-950 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
            >
              <option value="">No activity</option>
              {activities.data.map((activity) => (
                <option key={activity.id} value={activity.id}>
                  {activity.name} · {activity.category.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-slate-800">
              Status
            </label>
            <select
              id="status"
              name="status"
              defaultValue={template.status}
              className="mt-2 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-950 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              className="inline-flex h-10 w-full items-center justify-center rounded-md bg-emerald-600 px-4 text-sm font-semibold text-white transition hover:bg-emerald-700"
            >
              Save template
            </button>
          </div>
        </AdminActionForm>
      </div>

      <AdminActionForm
        action={addTemplateSectionAction}
        className="mt-6 flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4 sm:flex-row"
      >
        <input type="hidden" name="templateId" value={template.id} />
        <input
          name="title"
          required
          placeholder="Add a new section"
          className="min-h-10 flex-1 rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
        />
        <input
          name="description"
          placeholder="Optional description"
          className="min-h-10 flex-1 rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
        />
        <button className="rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white">
          Add section
        </button>
      </AdminActionForm>

      <div className="mt-6 space-y-5">
        {template.sections.map((section) => (
          <section key={section.id} className="rounded-lg border border-slate-200 bg-white p-5">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <AdminActionForm
                action={updateTemplateSectionAction}
                className="flex flex-1 flex-col gap-2 lg:flex-row"
              >
                <input type="hidden" name="templateId" value={template.id} />
                <input type="hidden" name="sectionId" value={section.id} />
                <input
                  name="title"
                  defaultValue={section.title}
                  required
                  className="min-h-10 flex-1 rounded-md border border-slate-300 px-3 text-sm font-semibold text-slate-950 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
                />
                <input
                  name="description"
                  defaultValue={section.description ?? ""}
                  placeholder="Optional description"
                  className="min-h-10 flex-1 rounded-md border border-slate-300 px-3 text-sm text-slate-800 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
                />
                <button className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium">
                  Save
                </button>
              </AdminActionForm>
              <AdminActionForm action={deleteTemplateSectionAction}>
                <input type="hidden" name="templateId" value={template.id} />
                <input type="hidden" name="sectionId" value={section.id} />
                <button className="rounded-md border border-red-200 px-3 py-2 text-sm font-medium text-red-700">
                  Delete section
                </button>
              </AdminActionForm>
            </div>

            <div className="mt-4 space-y-3">
              {section.items.map((item) => (
                <div key={item.id} className="rounded-md border border-slate-100 p-3">
                  <AdminActionForm
                    action={updateTemplateItemAction}
                    className="grid gap-2 lg:grid-cols-[1fr_1fr_auto_auto] lg:items-center"
                  >
                    <input type="hidden" name="templateId" value={template.id} />
                    <input type="hidden" name="itemId" value={item.id} />
                    <input
                      name="text"
                      defaultValue={item.text}
                      required
                      className="min-h-10 w-full rounded-md border border-slate-300 px-3 text-sm text-slate-800 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
                    />
                    <input
                      name="description"
                      defaultValue={item.description ?? ""}
                      placeholder="Optional description"
                      className="min-h-10 w-full rounded-md border border-slate-300 px-3 text-sm text-slate-800 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
                    />
                    <label className="flex items-center gap-2 text-sm text-slate-700">
                      <input
                        type="checkbox"
                        name="isRequired"
                        defaultChecked={item.isRequired}
                        className="h-4 w-4 rounded border-slate-300 text-emerald-600"
                      />
                      Required
                    </label>
                    <button className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium">
                      Save
                    </button>
                  </AdminActionForm>
                  <AdminActionForm action={deleteTemplateItemAction} className="mt-2">
                    <input type="hidden" name="templateId" value={template.id} />
                    <input type="hidden" name="itemId" value={item.id} />
                    <button className="rounded-md border border-red-200 px-3 py-2 text-sm font-medium text-red-700">
                      Delete item
                    </button>
                  </AdminActionForm>
                </div>
              ))}
            </div>

            <AdminActionForm
              action={addTemplateItemAction}
              className="mt-4 grid gap-2 md:grid-cols-[1fr_1fr_auto] md:items-center"
            >
              <input type="hidden" name="templateId" value={template.id} />
              <input type="hidden" name="sectionId" value={section.id} />
              <input
                name="text"
                required
                placeholder="Add an item"
                className="min-h-10 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
              />
              <input
                name="description"
                placeholder="Optional description"
                className="min-h-10 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
              />
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    name="isRequired"
                    className="h-4 w-4 rounded border-slate-300 text-emerald-600"
                  />
                  Required
                </label>
                <button className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white">
                  Add item
                </button>
              </div>
            </AdminActionForm>
          </section>
        ))}
      </div>
    </section>
  );
}
