import ExcelJS from "exceljs";

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

export async function buildTestScoreSheetXlsx(test: {
  title: string;
  subject: string;
  type: string;
  date: Date;
  maxScore: number;
  scores: {
    points: number;
    remarks: string | null;
    student: { firstName: string; lastName: string; rollNo: string | null };
  }[];
}): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Results");

  sheet.columns = [
    { header: "Student", key: "student", width: 28 },
    { header: "Roll No.", key: "rollNo", width: 14 },
    { header: "Score", key: "score", width: 12 },
    { header: "Max", key: "max", width: 10 },
    { header: "Percentage", key: "percentage", width: 14 },
    { header: "Remarks", key: "remarks", width: 30 },
  ];

  sheet.mergeCells("A1:F1");
  sheet.spliceRows(1, 0, [`${test.title} (${test.subject})`]);
  sheet.getRow(1).font = { bold: true, size: 14 };

  const headerRow = sheet.getRow(2);
  headerRow.font = { bold: true };
  headerRow.eachCell((cell) => {
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFE5E7EB" },
    };
  });

  for (const score of test.scores) {
    sheet.addRow({
      student: `${score.student.firstName} ${score.student.lastName}`,
      rollNo: score.student.rollNo ?? "",
      score: score.points,
      max: test.maxScore,
      percentage: `${((score.points / test.maxScore) * 100).toFixed(1)}%`,
      remarks: score.remarks ?? "",
    });
  }

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}
