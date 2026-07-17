"use client";

import { useState } from "react";

type Student = {
  id: string;
  firstName: string;
  lastName: string;
};

type ScoreEntry = {
  points: number;
  objectivePoints: number | null;
  theoryPoints: number | null;
  remarks: string | null;
};

export function ScoreEntryTable({
  students,
  scoresByStudentId,
  isMock,
  maxObjective,
  maxTheory,
  maxScore,
  action,
}: {
  students: Student[];
  scoresByStudentId: Record<string, ScoreEntry>;
  isMock: boolean;
  maxObjective: number | null;
  maxTheory: number | null;
  maxScore: number;
  action: (formData: FormData) => Promise<void>;
}) {
  const [query, setQuery] = useState("");

  const normalized = query.trim().toLowerCase();
  const filtered = normalized
    ? students.filter((s) =>
        `${s.firstName} ${s.lastName}`.toLowerCase().includes(normalized)
      )
    : students;

  return (
    <form action={action} className="mt-6">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search students by name…"
        className="mb-4 w-full max-w-sm rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
      />

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-700">
                Student
              </th>
              {isMock ? (
                <>
                  <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-700">
                    Objective
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-700">
                    Theory
                  </th>
                </>
              ) : (
                <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-700">
                  Score
                </th>
              )}
              <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-700">
                Remarks
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filtered.map((student) => {
              const existing = scoresByStudentId[student.id];
              return (
                <tr key={student.id}>
                  <td className="px-4 py-2 text-sm text-gray-900">
                    <input type="hidden" name="studentId" value={student.id} />
                    {student.firstName} {student.lastName}
                  </td>
                  {isMock ? (
                    <>
                      <td className="px-4 py-2">
                        <input
                          type="number"
                          step="0.01"
                          min={0}
                          max={maxObjective ?? undefined}
                          name={`objective_${student.id}`}
                          defaultValue={existing?.objectivePoints ?? ""}
                          className="w-20 rounded-md border border-gray-300 px-2 py-1 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="number"
                          step="0.01"
                          min={0}
                          max={maxTheory ?? undefined}
                          name={`theory_${student.id}`}
                          defaultValue={existing?.theoryPoints ?? ""}
                          className="w-20 rounded-md border border-gray-300 px-2 py-1 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </td>
                    </>
                  ) : (
                    <td className="px-4 py-2">
                      <input
                        type="number"
                        step="0.01"
                        min={0}
                        max={maxScore}
                        name={`points_${student.id}`}
                        defaultValue={existing?.points ?? ""}
                        className="w-24 rounded-md border border-gray-300 px-2 py-1 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </td>
                  )}
                  <td className="px-4 py-2">
                    <input
                      type="text"
                      name={`remarks_${student.id}`}
                      defaultValue={existing?.remarks ?? ""}
                      className="w-full rounded-md border border-gray-300 px-2 py-1 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={isMock ? 4 : 3}
                  className="px-4 py-6 text-center text-sm text-gray-700"
                >
                  No students match &quot;{query}&quot;.
                </td>
              </tr>
            )}
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
  );
}
