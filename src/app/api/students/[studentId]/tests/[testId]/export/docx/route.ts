import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { buildStudentResultDocx } from "@/lib/docx";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ studentId: string; testId: string }> }
) {
  const session = await auth();
  if (!session) return new NextResponse("Unauthorized", { status: 401 });

  const { studentId, testId } = await params;

  const [test, score] = await Promise.all([
    prisma.test.findUnique({ where: { id: testId } }),
    prisma.score.findUnique({
      where: { testId_studentId: { testId, studentId } },
      include: { student: true },
    }),
  ]);

  if (!test || !score) return new NextResponse("Not found", { status: 404 });

  const buffer = await buildStudentResultDocx(test, score);
  const filename = `${score.student.firstName}_${score.student.lastName}.docx`.replace(
    /[^a-z0-9_.-]/gi,
    "_"
  );

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
