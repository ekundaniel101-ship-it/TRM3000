export type Grade = "A" | "B" | "C" | "D" | "E" | "F";

export function computeGrade(percentage: number): Grade {
  if (percentage >= 70) return "A";
  if (percentage >= 60) return "B";
  if (percentage >= 50) return "C";
  if (percentage >= 45) return "D";
  if (percentage >= 40) return "E";
  return "F";
}
