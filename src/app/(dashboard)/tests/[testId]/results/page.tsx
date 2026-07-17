import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { getResultsRows } from "@/lib/results";

const TYPE_LABELS = {
  WEEKLY: "Weekly Test",
  AFTER_CLASS: "After-Class Test",
  MOCK: "Mock Exam",
} as const;

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
  });

  const isMock = test.type === "MOCK";
  const rows = getResultsRows(test, scores);

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">{test.title} — Results</h1>
          <p className="text-sm text-gray-700">
            {TYPE_LABELS[test.type]} · {test.subject} · {test.date.toLocaleDateString()}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
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
            href={`/api/tests/${test.id}/export/docx`}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Export Word
          </a>
          <a
            href={`/api/tests/${test.id}/export/pdf`}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Export PDF
          </a>
          <a
            href={`/api/tests/${test.id}/export/docx-bundle`}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Export Word (zipped, per student)
          </a>
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-lg border border-gray-200 bg-white">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-700">
                SN
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-700">
                Name
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-700">
                Course
              </th>
              {isMock ? (
                <>
                  <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-700">
                    Objective
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-700">
                    Theory
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-700">
                    Total
                  </th>
                </>
              ) : (
                <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-700">
                  Score
                </th>
              )}
              <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-700">
                Grade
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-700">
                Remarks
              </th>
              <th className="px-4 py-2" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {rows.map((row) => (
              <tr key={row.studentId}>
                <td className="px-4 py-2 text-sm text-gray-700">{row.sn}</td>
                <td className="px-4 py-2 text-sm text-gray-900">{row.name}</td>
                <td className="px-4 py-2 text-sm text-gray-700">{row.course}</td>
                {isMock ? (
                  <>
                    <td className="px-4 py-2 text-sm text-gray-700">{row.objective ?? "—"}</td>
                    <td className="px-4 py-2 text-sm text-gray-700">{row.theory ?? "—"}</td>
                    <td className="px-4 py-2 text-sm text-gray-700">{row.total}</td>
                  </>
                ) : (
                  <td className="px-4 py-2 text-sm text-gray-700">
                    {Math.round(row.percentage)}%
                  </td>
                )}
                <td className="px-4 py-2 text-sm text-gray-700">{row.grade}</td>
                <td className="px-4 py-2 text-sm text-gray-700">{row.remarks || "—"}</td>
                <td className="px-4 py-2 text-right text-sm">
                  <a
                    href={`/api/students/${row.studentId}/tests/${test.id}/export/docx`}
                    className="text-blue-600 hover:underline"
                  >
                    Export Word
                  </a>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td
                  colSpan={isMock ? 9 : 7}
                  className="px-4 py-6 text-center text-sm text-gray-700"
                >
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
