import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { saveScores } from "../actions";

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

  const scoreByStudentId = new Map(scores.map((s) => [s.studentId, s]));
  const action = saveScores.bind(null, testId);
  const typeLabel = test.type === "WEEKLY" ? "Weekly Test" : "After-Class Test";

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">{test.title}</h1>
          <p className="text-sm text-gray-500">
            {typeLabel} · {test.subject} · {test.date.toLocaleDateString()} · Max{" "}
            {test.maxScore}
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
        <p className="mt-6 text-sm text-gray-500">
          No students in the roster{test.className ? ` for class "${test.className}"` : ""}.{" "}
          <Link href="/students/new" className="text-blue-600 hover:underline">
            Add a student
          </Link>{" "}
          first.
        </p>
      ) : (
        <form action={action} className="mt-6">
          <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-500">
                    Student
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-500">
                    Score
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-500">
                    Remarks
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {students.map((student) => {
                  const existing = scoreByStudentId.get(student.id);
                  return (
                    <tr key={student.id}>
                      <td className="px-4 py-2 text-sm text-gray-900">
                        <input type="hidden" name="studentId" value={student.id} />
                        {student.firstName} {student.lastName}
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="number"
                          step="0.01"
                          min={0}
                          max={test.maxScore}
                          name={`points_${student.id}`}
                          defaultValue={existing?.points ?? ""}
                          className="w-24 rounded-md border border-gray-300 px-2 py-1 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="text"
                          name={`remarks_${student.id}`}
                          defaultValue={existing?.remarks ?? ""}
                          className="w-full rounded-md border border-gray-300 px-2 py-1 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <button
            type="submit"
            className="mt-4 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Save scores
          </button>
        </form>
      )}
    </div>
  );
}
