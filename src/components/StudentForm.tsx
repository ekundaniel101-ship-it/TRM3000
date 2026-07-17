"use client";

import { useActionState } from "react";
import type { StudentFormState } from "@/app/(dashboard)/students/actions";

export function StudentForm({
  action,
  defaultValues,
  submitLabel,
}: {
  action: (prevState: StudentFormState, formData: FormData) => Promise<StudentFormState>;
  defaultValues?: {
    firstName: string;
    lastName: string;
    rollNo: string | null;
    className: string | null;
  };
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <form action={formAction} className="max-w-md space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
            First name
          </label>
          <input
            id="firstName"
            name="firstName"
            type="text"
            required
            defaultValue={defaultValues?.firstName}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
            Last name
          </label>
          <input
            id="lastName"
            name="lastName"
            type="text"
            required
            defaultValue={defaultValues?.lastName}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      <div>
        <label htmlFor="rollNo" className="block text-sm font-medium text-gray-700">
          Roll no. (optional)
        </label>
        <input
          id="rollNo"
          name="rollNo"
          type="text"
          defaultValue={defaultValues?.rollNo ?? ""}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <div>
        <label htmlFor="className" className="block text-sm font-medium text-gray-700">
          Class (optional)
        </label>
        <input
          id="className"
          name="className"
          type="text"
          defaultValue={defaultValues?.className ?? ""}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {pending ? "Saving…" : submitLabel}
      </button>
    </form>
  );
}
