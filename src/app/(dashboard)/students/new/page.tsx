import { StudentForm } from "@/components/StudentForm";
import { createStudent } from "../actions";

export default function NewStudentPage() {
  return (
    <div>
      <h1 className="text-lg font-semibold text-gray-900">Add Student</h1>
      <div className="mt-6">
        <StudentForm action={createStudent} submitLabel="Add student" />
      </div>
    </div>
  );
}
