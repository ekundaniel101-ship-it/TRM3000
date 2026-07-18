"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { testSchema } from "@/lib/validators";
import type { TestType } from "@/generated/prisma/enums";

export type TestFormState = { error?: string };

const LIST_PATHS: Record<TestType, string> = {
  WEEKLY: "/tests/weekly",
  AFTER_CLASS: "/tests/after-class",
  MOCK: "/tests/mock",
};

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
    maxObjective: formData.get("maxObjective"),
    maxTheory: formData.get("maxTheory"),
    className: formData.get("className"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const test =
    parsed.data.type === "MOCK"
      ? await prisma.test.create({
          data: {
            type: "MOCK",
            subject: parsed.data.subject,
            title: parsed.data.title,
            date: new Date(parsed.data.date),
            maxScore: parsed.data.maxObjective + parsed.data.maxTheory,
            maxObjective: parsed.data.maxObjective,
            maxTheory: parsed.data.maxTheory,
            className: parsed.data.className || null,
          },
        })
      : await prisma.test.create({
          data: {
            type: parsed.data.type,
            subject: parsed.data.subject,
            title: parsed.data.title,
            date: new Date(parsed.data.date),
            maxScore: parsed.data.maxScore,
            className: parsed.data.className || null,
          },
        });

  revalidatePath(LIST_PATHS[type]);
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
  const test = await prisma.test.findUniqueOrThrow({ where: { id: testId } });
  const studentIds = formData.getAll("studentId").map(String);

  await Promise.all(
    studentIds.map((studentId) => {
      const rawRemarks = formData.get(`remarks_${studentId}`);
      const remarks = typeof rawRemarks === "string" && rawRemarks ? rawRemarks : null;

      if (test.type === "MOCK") {
        const rawObjective = formData.get(`objective_${studentId}`);
        const rawTheory = formData.get(`theory_${studentId}`);
        const objective = rawObjective === "" || rawObjective === null ? null : Number(rawObjective);
        const theory = rawTheory === "" || rawTheory === null ? null : Number(rawTheory);

        if (objective === null || theory === null || Number.isNaN(objective) || Number.isNaN(theory)) {
          return prisma.score.deleteMany({ where: { testId, studentId } });
        }

        const points = objective + theory;
        return prisma.score.upsert({
          where: { testId_studentId: { testId, studentId } },
          create: { testId, studentId, points, objectivePoints: objective, theoryPoints: theory, remarks },
          update: { points, objectivePoints: objective, theoryPoints: theory, remarks },
        });
      }

      const rawPoints = formData.get(`points_${studentId}`);
      const points = rawPoints === "" || rawPoints === null ? null : Number(rawPoints);

      if (points === null || Number.isNaN(points)) {
        return prisma.score.deleteMany({ where: { testId, studentId } });
      }

      return prisma.score.upsert({
        where: { testId_studentId: { testId, studentId } },
        create: { testId, studentId, points, remarks },
        update: { points, remarks },
      });
    })
  );

  revalidatePath(`/tests/${testId}`);
  revalidatePath(`/tests/${testId}/results`);
  redirect(`/tests/${testId}/results`);
}
