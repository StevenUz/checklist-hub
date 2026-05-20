import { notFound, redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth";
import { getUserChecklistDetails } from "@/services/checklistService";
import ChecklistClient from "./ChecklistClient";

type ChecklistPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ChecklistPage({ params }: ChecklistPageProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const resolvedParams = await params;
  const checklistId = Number(resolvedParams.id);

  if (!Number.isInteger(checklistId) || checklistId <= 0) {
    notFound();
  }

  const checklist = await getUserChecklistDetails({ checklistId, userId: user.id });

  if (!checklist) {
    notFound();
  }

  return <ChecklistClient checklist={checklist} />;
}
