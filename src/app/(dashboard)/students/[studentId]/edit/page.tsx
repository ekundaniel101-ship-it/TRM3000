import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { StudentForm } from "@/components/StudentForm";
import { updateStudent } from "../../actions";

export default async function EditStudentPage({
  params,
}: {
  params: Promise<{ studentId: string }>;
}) {
  const { studentId } = await params;
  const student = await prisma.student.findUnique({ where: { id: studentId } });
  if (!student) notFound();

  const action = updateStudent.bind(null, studentId);

  return (
    <div>
      <h1 className="text-lg font-semibold text-gray-900">Edit Student</h1>
      <div className="mt-6">
        <StudentForm action={action} defaultValues={student} submitLabel="Save changes" />
      </div>
    </div>
  );
}
