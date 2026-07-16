import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { parseStudentRosterXlsx } from "@/lib/xlsx";
import { parseStudentRosterDocx } from "@/lib/docx";

export async function POST(request: Request) {
  const session = await auth();
  if (!session) return new NextResponse("Unauthorized", { status: 401 });

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const isDocx = file.name.toLowerCase().endsWith(".docx");

  try {
    const rows = isDocx
      ? await parseStudentRosterDocx(buffer)
      : await parseStudentRosterXlsx(buffer);

    return NextResponse.json({ rows });
  } catch {
    return NextResponse.json(
      { error: "Could not read that file. Make sure it's a valid .xlsx or .docx file." },
      { status: 400 }
    );
  }
}
