import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { buildTestScoreSheetXlsx } from "@/lib/xlsx";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ testId: string }> }
) {
  const session = await auth();
  if (!session) return new NextResponse("Unauthorized", { status: 401 });

  const { testId } = await params;
  const test = await prisma.test.findUnique({
    where: { id: testId },
    include: { scores: { include: { student: true }, orderBy: { student: { lastName: "asc" } } } },
  });

  if (!test) return new NextResponse("Not found", { status: 404 });

  const buffer = await buildTestScoreSheetXlsx(test);
  const filename = `${test.title.replace(/[^a-z0-9_-]/gi, "_")}.xlsx`;

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
