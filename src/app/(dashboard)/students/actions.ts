"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { studentSchema } from "@/lib/validators";

export type StudentFormState = { error?: string };

function parseStudentForm(formData: FormData) {
  return studentSchema.safeParse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    rollNo: formData.get("rollNo"),
    className: formData.get("className"),
  });
}

export async function createStudent(
  _prevState: StudentFormState,
  formData: FormData
): Promise<StudentFormState> {
  const parsed = parseStudentForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { firstName, lastName, rollNo, className } = parsed.data;

  try {
    await prisma.student.create({
      data: {
        firstName,
        lastName,
        rollNo: rollNo || null,
        className: className || null,
      },
    });
  } catch {
    return { error: "A student with that name and class already exists" };
  }

  revalidatePath("/students");
  redirect("/students");
}

export async function updateStudent(
  studentId: string,
  _prevState: StudentFormState,
  formData: FormData
): Promise<StudentFormState> {
  const parsed = parseStudentForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { firstName, lastName, rollNo, className } = parsed.data;

  try {
    await prisma.student.update({
      where: { id: studentId },
      data: {
        firstName,
        lastName,
        rollNo: rollNo || null,
        className: className || null,
      },
    });
  } catch {
    return { error: "A student with that name and class already exists" };
  }

  revalidatePath("/students");
  redirect("/students");
}

export async function deleteStudent(formData: FormData) {
  const studentId = formData.get("studentId");
  if (typeof studentId !== "string") return;

  await prisma.student.delete({ where: { id: studentId } });
  revalidatePath("/students");
}

export type ImportRow = {
  firstName: string;
  lastName: string;
  rollNo: string;
  className: string;
};

export async function importStudents(rows: ImportRow[]): Promise<{ imported: number }> {
  const validRows = rows.filter((row) => row.firstName && row.lastName);

  let imported = 0;
  for (const row of validRows) {
    const className = row.className || null;
    const existing = await prisma.student.findFirst({
      where: { firstName: row.firstName, lastName: row.lastName, className },
    });

    if (existing) {
      await prisma.student.update({
        where: { id: existing.id },
        data: { rollNo: row.rollNo || undefined },
      });
    } else {
      await prisma.student.create({
        data: {
          firstName: row.firstName,
          lastName: row.lastName,
          rollNo: row.rollNo || null,
          className,
        },
      });
    }
    imported += 1;
  }

  revalidatePath("/students");
  return { imported };
}
