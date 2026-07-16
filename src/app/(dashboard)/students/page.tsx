import Link from "next/link";
import { prisma } from "@/lib/db";
import { deleteStudent } from "./actions";

export default async function StudentsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";

  const students = await prisma.student.findMany({
    where: query
      ? {
          OR: [
            { firstName: { contains: query, mode: "insensitive" } },
            { lastName: { contains: query, mode: "insensitive" } },
            { className: { contains: query, mode: "insensitive" } },
            { rollNo: { contains: query, mode: "insensitive" } },
          ],
        }
      : undefined,
    orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-gray-900">Students</h1>
        <div className="flex gap-2">
          <Link
            href="/students/import"
            className="rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Import from Excel/Word
          </Link>
          <Link
            href="/students/new"
            className="rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Add Student
          </Link>
        </div>
      </div>

      <form className="mt-4" action="/students" method="get">
        <input
          type="text"
          name="q"
          defaultValue={query}
          placeholder="Search by name, class, or roll no."
          className="w-full max-w-sm rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </form>

      <div className="mt-6 overflow-hidden rounded-lg border border-gray-200 bg-white">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-500">
                Name
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-500">
                Roll No.
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-500">
                Class
              </th>
              <th className="px-4 py-2" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {students.map((student) => (
              <tr key={student.id}>
                <td className="px-4 py-2 text-sm text-gray-900">
                  {student.firstName} {student.lastName}
                </td>
                <td className="px-4 py-2 text-sm text-gray-500">
                  {student.rollNo || "—"}
                </td>
                <td className="px-4 py-2 text-sm text-gray-500">
                  {student.className || "—"}
                </td>
                <td className="px-4 py-2 text-right text-sm">
                  <Link
                    href={`/students/${student.id}/edit`}
                    className="text-blue-600 hover:underline"
                  >
                    Edit
                  </Link>
                  <form action={deleteStudent} className="inline">
                    <input type="hidden" name="studentId" value={student.id} />
                    <button
                      type="submit"
                      className="ml-4 text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </form>
                </td>
              </tr>
            ))}
            {students.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-sm text-gray-500">
                  No students found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
