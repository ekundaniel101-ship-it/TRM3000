"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { testSchema } from "@/lib/validators";
import type { TestType } from "@/generated/prisma/enums";

export type TestFormState = { error?: string };

export async function createTest(
  type: TestType,
  _prevState: TestFormState,
  formData: FormData
): Promise<TestFormState> {
  const parsed = testSchema.safeParse({
    type,
    subject: formData.get("subject"),
    title: formData.get("title"),
    date: formData.get("date"),
    maxScore: formData.get("maxScore"),
    className: formData.get("className"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const test = await prisma.test.create({
    data: {
      type: parsed.data.type,
      subject: parsed.data.subject,
      title: parsed.data.title,
      date: new Date(parsed.data.date),
      maxScore: parsed.data.maxScore,
      className: parsed.data.className || null,
    },
  });

  const listPath = type === "WEEKLY" ? "/tests/weekly" : "/tests/after-class";
  revalidatePath(listPath);
  redirect(`/tests/${test.id}`);
}

export async function deleteTest(formData: FormData) {
  const testId = formData.get("testId");
  const listPath = formData.get("listPath");
  if (typeof testId !== "string") return;

  await prisma.test.delete({ where: { id: testId } });
  if (typeof listPath === "string") revalidatePath(listPath);
}

export async function saveScores(testId: string, formData: FormData) {
  const studentIds = formData.getAll("studentId").map(String);

  await prisma.$transaction(
    studentIds.map((studentId) => {
      const rawPoints = formData.get(`points_${studentId}`);
      const remarks = formData.get(`remarks_${studentId}`);
      const points = rawPoints === "" || rawPoints === null ? null : Number(rawPoints);

      if (points === null || Number.isNaN(points)) {
        return prisma.score.deleteMany({ where: { testId, studentId } });
      }

      return prisma.score.upsert({
        where: { testId_studentId: { testId, studentId } },
        create: {
          testId,
          studentId,
          points,
          remarks: typeof remarks === "string" && remarks ? remarks : null,
        },
        update: {
          points,
          remarks: typeof remarks === "string" && remarks ? remarks : null,
        },
      });
    })
  );

  revalidatePath(`/tests/${testId}`);
  revalidatePath(`/tests/${testId}/results`);
  redirect(`/tests/${testId}/results`);
}
