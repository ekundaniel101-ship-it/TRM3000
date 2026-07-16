"use client";

import { useActionState } from "react";
import type { TestFormState } from "@/app/(dashboard)/tests/actions";

export function TestForm({
  action,
  type,
}: {
  action: (prevState: TestFormState, formData: FormData) => Promise<TestFormState>;
  type: "WEEKLY" | "AFTER_CLASS" | "MOCK";
}) {
  const [state, formAction, pending] = useActionState(action, {});
  const isMock = type === "MOCK";

  return (
    <form action={formAction} className="max-w-md space-y-4">
      <div>
        <label htmlFor="subject" className="block text-sm font-medium text-gray-700">
          Subject
        </label>
        <input
          id="subject"
          name="subject"
          type="text"
          required
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          Title
        </label>
        <input
          id="title"
          name="title"
          type="text"
          required
          placeholder="e.g. Week 12 Fractions Quiz"
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <div>
        <label htmlFor="date" className="block text-sm font-medium text-gray-700">
          Date
        </label>
        <input
          id="date"
          name="date"
          type="date"
          required
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      {isMock ? (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="maxObjective" className="block text-sm font-medium text-gray-700">
              Max Objective
            </label>
            <input
              id="maxObjective"
              name="maxObjective"
              type="number"
              step="0.01"
              defaultValue={40}
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label htmlFor="maxTheory" className="block text-sm font-medium text-gray-700">
              Max Theory
            </label>
            <input
              id="maxTheory"
              name="maxTheory"
              type="number"
              step="0.01"
              defaultValue={60}
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
      ) : (
        <div>
          <label htmlFor="maxScore" className="block text-sm font-medium text-gray-700">
            Max score
          </label>
          <input
            id="maxScore"
            name="maxScore"
            type="number"
            step="0.01"
            defaultValue={100}
            required
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      )}

      <div>
        <label htmlFor="className" className="block text-sm font-medium text-gray-700">
          Course (optional)
        </label>
        <input
          id="className"
          name="className"
          type="text"
          placeholder="Leave blank if students from multiple courses sit this test"
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {pending ? "Creating…" : "Create test"}
      </button>
    </form>
  );
}
