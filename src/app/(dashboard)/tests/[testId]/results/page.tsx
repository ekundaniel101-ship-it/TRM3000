import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";

export default async function TestResultsPage({
  params,
}: {
  params: Promise<{ testId: string }>;
}) {
  const { testId } = await params;

  const test = await prisma.test.findUnique({ where: { id: testId } });
  if (!test) notFound();

  const scores = await prisma.score.findMany({
    where: { testId },
    include: { student: true },
    orderBy: [{ student: { lastName: "asc" } }, { student: { firstName: "asc" } }],
  });

  const typeLabel = test.type === "WEEKLY" ? "Weekly Test" : "After-Class Test";

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">{test.title} — Results</h1>
          <p className="text-sm text-gray-500">
            {typeLabel} · {test.subject} · {test.date.toLocaleDateString()} · Max{" "}
            {test.maxScore}
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/tests/${test.id}`}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Edit scores
          </Link>
          <a
            href={`/api/tests/${test.id}/export/xlsx`}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Export Excel
          </a>
          <a
            href={`/api/tests/${test.id}/export/docx-bundle`}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Export Word (all)
          </a>
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-lg border border-gray-200 bg-white">
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
                Percentage
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-500">
                Remarks
              </th>
              <th className="px-4 py-2" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {scores.map((score) => (
              <tr key={score.id}>
                <td className="px-4 py-2 text-sm text-gray-900">
                  {score.student.firstName} {score.student.lastName}
                </td>
                <td className="px-4 py-2 text-sm text-gray-500">
                  {score.points} / {test.maxScore}
                </td>
                <td className="px-4 py-2 text-sm text-gray-500">
                  {((score.points / test.maxScore) * 100).toFixed(1)}%
                </td>
                <td className="px-4 py-2 text-sm text-gray-500">{score.remarks || "—"}</td>
                <td className="px-4 py-2 text-right text-sm">
                  <a
                    href={`/api/students/${score.studentId}/tests/${test.id}/export/docx`}
                    className="text-blue-600 hover:underline"
                  >
                    Export Word
                  </a>
                </td>
              </tr>
            ))}
            {scores.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-sm text-gray-500">
                  No scores recorded yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
