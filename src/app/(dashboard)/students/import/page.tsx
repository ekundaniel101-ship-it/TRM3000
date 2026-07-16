"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { importStudents, type ImportRow } from "../actions";

export default function ImportStudentsPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [rows, setRows] = useState<ImportRow[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "previewed" | "importing">(
    "idle"
  );
  const [error, setError] = useState<string | null>(null);

  async function handlePreview() {
    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      setError("Choose a .xlsx or .docx file first");
      return;
    }

    setStatus("loading");
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/students/import", { method: "POST", body: formData });
    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? "Failed to read file");
      setStatus("idle");
      return;
    }

    setRows(data.rows);
    setStatus("previewed");
  }

  async function handleConfirm() {
    setStatus("importing");
    await importStudents(rows);
    router.push("/students");
  }

  return (
    <div>
      <h1 className="text-lg font-semibold text-gray-900">Import Students</h1>
      <p className="mt-1 max-w-xl text-sm text-gray-500">
        Upload an Excel (.xlsx) roster with columns for First Name, Last Name, Roll No.,
        and Class, or a Word (.docx) document listing students one per line. You&apos;ll
        get a preview before anything is saved. Excel import is the most reliable — Word
        import is best-effort, so double check the preview.
      </p>

      <div className="mt-6 flex items-center gap-3">
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.docx"
          className="text-sm text-gray-700"
        />
        <button
          type="button"
          onClick={handlePreview}
          disabled={status === "loading"}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          {status === "loading" ? "Reading…" : "Preview"}
        </button>
      </div>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      {rows.length > 0 && (
        <div className="mt-6">
          <p className="text-sm text-gray-600">
            Found {rows.length} row{rows.length === 1 ? "" : "s"}. Review before importing:
          </p>
          <div className="mt-2 max-h-96 overflow-auto rounded-lg border border-gray-200 bg-white">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-500">
                    First name
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-500">
                    Last name
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-500">
                    Roll No.
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-500">
                    Class
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {rows.map((row, i) => (
                  <tr key={i}>
                    <td className="px-4 py-2 text-sm text-gray-900">{row.firstName}</td>
                    <td className="px-4 py-2 text-sm text-gray-900">{row.lastName}</td>
                    <td className="px-4 py-2 text-sm text-gray-500">{row.rollNo || "—"}</td>
                    <td className="px-4 py-2 text-sm text-gray-500">{row.className || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button
            type="button"
            onClick={handleConfirm}
            disabled={status === "importing"}
            className="mt-4 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {status === "importing" ? "Importing…" : `Import ${rows.length} students`}
          </button>
        </div>
      )}
    </div>
  );
}
