import { computeGrade, type Grade } from "@/lib/grade";

export const ORG_NAME = "ODECAZDEO CAMPUS-LINK TUTORIALS";

function ordinalSuffix(day: number): string {
  const j = day % 10;
  const k = day % 100;
  if (j === 1 && k !== 11) return "ST";
  if (j === 2 && k !== 12) return "ND";
  if (j === 3 && k !== 13) return "RD";
  return "TH";
}

export function formatResultDate(date: Date): string {
  const weekday = date.toLocaleDateString("en-US", { weekday: "long" }).toUpperCase();
  const day = date.getDate();
  const month = date.toLocaleDateString("en-US", { month: "long" }).toUpperCase();
  const year = date.getFullYear();
  return `${weekday} ${day}${ordinalSuffix(day)} ${month}, ${year}`;
}

export type TestForSheet = {
  type: "WEEKLY" | "AFTER_CLASS" | "MOCK";
  subject: string;
  maxScore: number;
  date: Date;
};

export function getResultsHeading(test: TestForSheet): { title: string; subtitle: string } {
  const dateLabel = formatResultDate(test.date);
  const subject = test.subject.toUpperCase();

  if (test.type === "MOCK") {
    return {
      title: ORG_NAME,
      subtitle: `${subject} PRE-MOCK EXAMINATION RESULT HELD ${dateLabel}.`,
    };
  }

  const typeLabel = test.type === "WEEKLY" ? "WEEKLY TEST" : "AFTER-CLASS TEST";
  return {
    title: ORG_NAME,
    subtitle: `${subject} ${typeLabel} RESULT HELD ${dateLabel}.`,
  };
}

export type ScoreForSheet = {
  studentId: string;
  points: number;
  objectivePoints: number | null;
  theoryPoints: number | null;
  remarks: string | null;
  student: { firstName: string; lastName: string; rollNo: string | null; className: string | null };
};

export type ResultsRow = {
  sn: number;
  studentId: string;
  name: string;
  course: string;
  objective: number | null;
  theory: number | null;
  total: number;
  percentage: number;
  grade: Grade;
  remarks: string;
};

export function getResultsRows(test: TestForSheet, scores: ScoreForSheet[]): ResultsRow[] {
  const sorted = [...scores].sort((a, b) => b.points - a.points);

  return sorted.map((score, i) => {
    const percentage = (score.points / test.maxScore) * 100;
    return {
      sn: i + 1,
      studentId: score.studentId,
      name: `${score.student.firstName} ${score.student.lastName}`.toUpperCase(),
      course: score.student.className ?? "—",
      objective: score.objectivePoints,
      theory: score.theoryPoints,
      total: score.points,
      percentage,
      grade: computeGrade(percentage),
      remarks: score.remarks ?? "",
    };
  });
}
