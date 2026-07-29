"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdminUser } from "@/lib/admin-auth";
import {
  deleteAdminMember,
  setAdminMemberActive,
} from "@/lib/admin-members";

export async function setMemberActiveAction(formData: FormData) {
  await requireAdminUser();
  const memberId = String(formData.get("memberId") ?? "");
  const active = String(formData.get("active")) === "true";
  await setAdminMemberActive(memberId, active);
  revalidatePath("/admin/members");
  revalidatePath(`/admin/members/${memberId}`);
}

export async function deleteMemberAction(formData: FormData) {
  await requireAdminUser();
  const memberId = String(formData.get("memberId") ?? "");
  const result = await deleteAdminMember(memberId);
  if (!result.deleted) {
    redirect(`/admin/members/${memberId}?history=1`);
  }
  revalidatePath("/admin/members");
  redirect("/admin/members?deleted=1");
}
