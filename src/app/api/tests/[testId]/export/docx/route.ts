import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { buildClassResultsDocx } from "@/lib/docx";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ testId: string }> }
) {
  const session = await auth();
  if (!session) return new NextResponse("Unauthorized", { status: 401 });

  const { testId } = await params;
  const test = await prisma.test.findUnique({
    where: { id: testId },
    include: { scores: { include: { student: true } } },
  });

  if (!test) return new NextResponse("Not found", { status: 404 });

  const buffer = await buildClassResultsDocx(test, test.scores);
  const filename = `${test.title.replace(/[^a-z0-9_-]/gi, "_")}.docx`;

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
