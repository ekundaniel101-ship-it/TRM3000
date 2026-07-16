import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { buildResultsBundleZip } from "@/lib/docx";

export const maxDuration = 60;

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

  const buffer = await buildResultsBundleZip(test, test.scores);
  const filename = `${test.title.replace(/[^a-z0-9_-]/gi, "_")}_results.zip`;

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
