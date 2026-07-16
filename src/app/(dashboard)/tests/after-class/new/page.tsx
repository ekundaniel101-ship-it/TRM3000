import { TestForm } from "@/components/TestForm";
import { createTest } from "../../actions";

export default function NewAfterClassTestPage() {
  const action = createTest.bind(null, "AFTER_CLASS");

  return (
    <div>
      <h1 className="text-lg font-semibold text-gray-900">New After-Class Test</h1>
      <div className="mt-6">
        <TestForm action={action} type="AFTER_CLASS" />
      </div>
    </div>
  );
}
