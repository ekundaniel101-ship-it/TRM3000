import Link from "next/link";
import { prisma } from "@/lib/db";
import { deleteTest } from "../actions";

export default async function MockExamsPage() {
  const tests = await prisma.test.findMany({
    where: { type: "MOCK" },
    orderBy: { date: "desc" },
    include: { _count: { select: { scores: true } } },
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-gray-900">Mock Exams</h1>
        <Link
          href="/tests/mock/new"
          className="rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          New Mock Exam
        </Link>
      </div>

      <div className="mt-6 overflow-hidden rounded-lg border border-gray-200 bg-white">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-500">
                Title
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-500">
                Subject
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-500">
                Date
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-500">
                Scored
              </th>
              <th className="px-4 py-2" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {tests.map((test) => (
              <tr key={test.id}>
                <td className="px-4 py-2 text-sm text-gray-900">
                  <Link href={`/tests/${test.id}`} className="hover:underline">
                    {test.title}
                  </Link>
                </td>
                <td className="px-4 py-2 text-sm text-gray-500">{test.subject}</td>
                <td className="px-4 py-2 text-sm text-gray-500">
                  {test.date.toLocaleDateString()}
                </td>
                <td className="px-4 py-2 text-sm text-gray-500">{test._count.scores}</td>
                <td className="px-4 py-2 text-right text-sm">
                  <Link
                    href={`/tests/${test.id}/results`}
                    className="text-blue-600 hover:underline"
                  >
                    Results
                  </Link>
                  <form action={deleteTest} className="inline">
                    <input type="hidden" name="testId" value={test.id} />
                    <input type="hidden" name="listPath" value="/tests/mock" />
                    <button type="submit" className="ml-4 text-red-600 hover:underline">
                      Delete
                    </button>
                  </form>
                </td>
              </tr>
            ))}
            {tests.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-sm text-gray-500">
                  No mock exams yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
