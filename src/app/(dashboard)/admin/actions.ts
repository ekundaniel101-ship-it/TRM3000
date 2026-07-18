"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

async function requireOwner() {
  const session = await auth();
  if (session?.user?.role !== "OWNER") {
    throw new Error("Not authorized");
  }
}

export async function deleteUser(formData: FormData) {
  await requireOwner();

  const userId = formData.get("userId");
  if (typeof userId !== "string") return;

  const target = await prisma.user.findUnique({ where: { id: userId } });
  if (!target || target.role === "OWNER") return;

  await prisma.user.delete({ where: { id: userId } });
  revalidatePath("/admin");
}
