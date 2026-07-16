import { TestForm } from "@/components/TestForm";
import { createTest } from "../../actions";

export default function NewMockExamPage() {
  const action = createTest.bind(null, "MOCK");

  return (
    <div>
      <h1 className="text-lg font-semibold text-gray-900">New Mock Exam</h1>
      <div className="mt-6">
        <TestForm action={action} type="MOCK" />
      </div>
    </div>
  );
}
