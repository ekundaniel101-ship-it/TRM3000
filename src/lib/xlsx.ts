import ExcelJS from "exceljs";
import { getResultsHeading, getResultsRows, type ScoreForSheet, type TestForSheet } from "@/lib/results";

export type ImportedStudentRow = {
  firstName: string;
  lastName: string;
  rollNo: string;
  className: string;
};

const HEADER_ALIASES: Record<string, keyof ImportedStudentRow> = {
  firstname: "firstName",
  "first name": "firstName",
  lastname: "lastName",
  "last name": "lastName",
  rollno: "rollNo",
  "roll no": "rollNo",
  "roll no.": "rollNo",
  "roll number": "rollNo",
  class: "className",
  classname: "className",
  "class name": "className",
};

export async function parseStudentRosterXlsx(
  buffer: ArrayBuffer | Buffer
): Promise<ImportedStudentRow[]> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer as ArrayBuffer);
  const sheet = workbook.worksheets[0];
  if (!sheet) return [];

  const headerRow = sheet.getRow(1);
  const columnMap = new Map<number, keyof ImportedStudentRow>();
  headerRow.eachCell((cell, colNumber) => {
    const key = String(cell.value ?? "")
      .trim()
      .toLowerCase();
    const field = HEADER_ALIASES[key];
    if (field) columnMap.set(colNumber, field);
  });

  const rows: ImportedStudentRow[] = [];
  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;

    const record: ImportedStudentRow = {
      firstName: "",
      lastName: "",
      rollNo: "",
      className: "",
    };
    row.eachCell((cell, colNumber) => {
      const field = columnMap.get(colNumber);
      if (field) record[field] = String(cell.value ?? "").trim();
    });

    if (record.firstName && record.lastName) rows.push(record);
  });

  return rows;
}

const THIN_BORDER: Partial<ExcelJS.Borders> = {
  top: { style: "thin" },
  left: { style: "thin" },
  bottom: { style: "thin" },
  right: { style: "thin" },
};

export async function buildTestScoreSheetXlsx(
  test: TestForSheet & { scores: ScoreForSheet[] }
): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Results");
  const isMock = test.type === "MOCK";

  const columns = isMock
    ? [
        { header: "SN", key: "sn", width: 6 },
        { header: "NAME", key: "name", width: 32 },
        { header: "COURSE", key: "course", width: 16 },
        { header: "OBJECTIVE (40)", key: "objective", width: 16 },
        { header: "THEORY (60)", key: "theory", width: 14 },
        { header: "TOTAL (100)", key: "total", width: 14 },
        { header: "GRADE", key: "grade", width: 10 },
      ]
    : [
        { header: "SN", key: "sn", width: 6 },
        { header: "NAME", key: "name", width: 32 },
        { header: "COURSE", key: "course", width: 16 },
        { header: "SCORE", key: "score", width: 14 },
        { header: "GRADE", key: "grade", width: 10 },
      ];

  sheet.columns = columns;

  const { title, subtitle } = getResultsHeading(test);
  const rows = getResultsRows(test, test.scores);

  sheet.spliceRows(1, 0, [title], [subtitle]);
  sheet.mergeCells(1, 1, 1, columns.length);
  sheet.mergeCells(2, 1, 2, columns.length);
  sheet.getRow(1).font = { bold: true, size: 16 };
  sheet.getRow(2).font = { bold: true, size: 12 };
  sheet.getRow(1).alignment = { horizontal: "center" };
  sheet.getRow(2).alignment = { horizontal: "center" };

  const headerRow = sheet.getRow(3);
  headerRow.font = { bold: true };
  headerRow.eachCell((cell) => {
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFE5E7EB" } };
    cell.border = THIN_BORDER;
  });

  for (const row of rows) {
    const excelRow = isMock
      ? sheet.addRow({
          sn: row.sn,
          name: row.name,
          course: row.course,
          objective: row.objective ?? "",
          theory: row.theory ?? "",
          total: row.total,
          grade: row.grade,
        })
      : sheet.addRow({
          sn: row.sn,
          name: row.name,
          course: row.course,
          score: `${Math.round(row.percentage)}%`,
          grade: row.grade,
        });

    excelRow.eachCell((cell) => {
      cell.border = THIN_BORDER;
    });
  }

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}
