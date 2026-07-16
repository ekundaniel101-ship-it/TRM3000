import mammoth from "mammoth";
import { Document, HeadingLevel, Packer, Paragraph, Table, TableCell, TableRow, TextRun, WidthType, AlignmentType } from "docx";
import JSZip from "jszip";
import type { ImportedStudentRow } from "@/lib/xlsx";
import { getResultsHeading, getResultsRows, type ScoreForSheet, type TestForSheet } from "@/lib/results";

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

function headerCell(text: string): TableCell {
  return new TableCell({
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text, bold: true })],
      }),
    ],
  });
}

function dataCell(text: string, align: (typeof AlignmentType)[keyof typeof AlignmentType] = AlignmentType.LEFT): TableCell {
  return new TableCell({
    children: [new Paragraph({ alignment: align, text })],
  });
}

export async function buildClassResultsDocx(
  test: TestForSheet,
  scores: ScoreForSheet[]
): Promise<Buffer> {
  const isMock = test.type === "MOCK";
  const { title, subtitle } = getResultsHeading(test);
  const rows = getResultsRows(test, scores);

  const headerRow = new TableRow({
    children: isMock
      ? [
          headerCell("SN"),
          headerCell("NAME"),
          headerCell("COURSE"),
          headerCell("OBJECTIVE (40)"),
          headerCell("THEORY (60)"),
          headerCell("TOTAL (100)"),
          headerCell("GRADE"),
        ]
      : [headerCell("SN"), headerCell("NAME"), headerCell("COURSE"), headerCell("SCORE"), headerCell("GRADE")],
  });

  const dataRows = rows.map(
    (row) =>
      new TableRow({
        children: isMock
          ? [
              dataCell(String(row.sn), AlignmentType.CENTER),
              dataCell(row.name),
              dataCell(row.course),
              dataCell(row.objective != null ? String(row.objective) : "", AlignmentType.CENTER),
              dataCell(row.theory != null ? String(row.theory) : "", AlignmentType.CENTER),
              dataCell(String(row.total), AlignmentType.CENTER),
              dataCell(row.grade, AlignmentType.CENTER),
            ]
          : [
              dataCell(String(row.sn), AlignmentType.CENTER),
              dataCell(row.name),
              dataCell(row.course),
              dataCell(`${Math.round(row.percentage)}%`, AlignmentType.CENTER),
              dataCell(row.grade, AlignmentType.CENTER),
            ],
      })
  );

  const doc = new Document({
    sections: [
      {
        children: [
          new Paragraph({
            text: title,
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: subtitle, bold: true })],
            spacing: { after: 200 },
          }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [headerRow, ...dataRows],
          }),
        ],
      },
    ],
  });

  return Packer.toBuffer(doc);
}
