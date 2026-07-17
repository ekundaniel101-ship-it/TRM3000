import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { saveScores } from "../actions";
import { ScoreEntryTable } from "@/components/ScoreEntryTable";

const TYPE_LABELS = {
  WEEKLY: "Weekly Test",
  AFTER_CLASS: "After-Class Test",
  MOCK: "Mock Exam",
} as const;

export default async function TestScoreEntryPage({
  params,
}: {
  params: Promise<{ testId: string }>;
}) {
  const { testId } = await params;

  const test = await prisma.test.findUnique({ where: { id: testId } });
  if (!test) notFound();

  const [students, scores] = await Promise.all([
    prisma.student.findMany({
      where: test.className ? { className: test.className } : undefined,
      orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
    }),
    prisma.score.findMany({ where: { testId } }),
  ]);

  const scoresByStudentId = Object.fromEntries(
    scores.map((s) => [
      s.studentId,
      {
        points: s.points,
        objectivePoints: s.objectivePoints,
        theoryPoints: s.theoryPoints,
        remarks: s.remarks,
      },
    ])
  );
  const action = saveScores.bind(null, testId);
  const isMock = test.type === "MOCK";

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">{test.title}</h1>
          <p className="text-sm text-gray-700">
            {TYPE_LABELS[test.type]} · {test.subject} · {test.date.toLocaleDateString()} ·{" "}
            {isMock
              ? `Objective /${test.maxObjective} · Theory /${test.maxTheory}`
              : `Max ${test.maxScore}`}
          </p>
        </div>
        <Link
          href={`/tests/${test.id}/results`}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          View results
        </Link>
      </div>

      {students.length === 0 ? (
        <p className="mt-6 text-sm text-gray-700">
          No students in the roster{test.className ? ` for course "${test.className}"` : ""}.{" "}
          <Link href="/students/new" className="text-blue-600 hover:underline">
            Add a student
          </Link>{" "}
          first.
        </p>
      ) : (
        <ScoreEntryTable
          students={students}
          scoresByStudentId={scoresByStudentId}
          isMock={isMock}
          maxObjective={test.maxObjective}
          maxTheory={test.maxTheory}
          maxScore={test.maxScore}
          action={action}
        />
      )}
    </div>
  );
}
