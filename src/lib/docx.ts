import mammoth from "mammoth";
import { Document, HeadingLevel, Packer, Paragraph, Table, TableCell, TableRow, TextRun, WidthType } from "docx";
import JSZip from "jszip";
import type { ImportedStudentRow } from "@/lib/xlsx";

export async function parseStudentRosterDocx(
  buffer: Buffer
): Promise<ImportedStudentRow[]> {
  const { value: text } = await mammoth.extractRawText({ buffer });

  const rows: ImportedStudentRow[] = [];
  for (const rawLine of text.split("\n")) {
    const line = rawLine.trim();
    if (!line) continue;

    const parts = line
      .split(/\t|,|\s{2,}/)
      .map((p) => p.trim())
      .filter(Boolean);

    if (parts.length < 2) continue;

    rows.push({
      firstName: parts[0] ?? "",
      lastName: parts[1] ?? "",
      rollNo: parts[2] ?? "",
      className: parts[3] ?? "",
    });
  }

  return rows;
}

type TestInfo = {
  title: string;
  subject: string;
  type: string;
  date: Date;
  maxScore: number;
};

type ScoreWithStudent = {
  points: number;
  remarks: string | null;
  student: { firstName: string; lastName: string; rollNo: string | null; className: string | null };
};

function buildResultDocument(test: TestInfo, score: ScoreWithStudent): Document {
  const typeLabel = test.type === "WEEKLY" ? "Weekly Test" : "After-Class Test";
  const percentage = ((score.points / test.maxScore) * 100).toFixed(1);

  const infoRow = (label: string, value: string) =>
    new TableRow({
      children: [
        new TableCell({
          width: { size: 30, type: WidthType.PERCENTAGE },
          children: [new Paragraph({ children: [new TextRun({ text: label, bold: true })] })],
        }),
        new TableCell({
          width: { size: 70, type: WidthType.PERCENTAGE },
          children: [new Paragraph(value)],
        }),
      ],
    });

  return new Document({
    sections: [
      {
        children: [
          new Paragraph({
            text: typeLabel + " Result",
            heading: HeadingLevel.HEADING_1,
          }),
          new Paragraph({ text: test.title, heading: HeadingLevel.HEADING_2 }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              infoRow("Student", `${score.student.firstName} ${score.student.lastName}`),
              infoRow("Roll No.", score.student.rollNo ?? "—"),
              infoRow("Class", score.student.className ?? "—"),
              infoRow("Subject", test.subject),
              infoRow("Date", test.date.toLocaleDateString()),
              infoRow("Score", `${score.points} / ${test.maxScore} (${percentage}%)`),
              infoRow("Remarks", score.remarks ?? "—"),
            ],
          }),
        ],
      },
    ],
  });
}

export async function buildStudentResultDocx(
  test: TestInfo,
  score: ScoreWithStudent
): Promise<Buffer> {
  const doc = buildResultDocument(test, score);
  return Packer.toBuffer(doc);
}

export async function buildResultsBundleZip(
  test: TestInfo,
  scores: ScoreWithStudent[]
): Promise<Buffer> {
  const zip = new JSZip();

  for (const score of scores) {
    const doc = buildResultDocument(test, score);
    const buffer = await Packer.toBuffer(doc);
    const safeName = `${score.student.firstName}_${score.student.lastName}`.replace(
      /[^a-z0-9_-]/gi,
      ""
    );
    zip.file(`${safeName || score.student.firstName}.docx`, buffer);
  }

  return zip.generateAsync({ type: "nodebuffer" });
}
