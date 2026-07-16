import { TestForm } from "@/components/TestForm";
import { createTest } from "../../actions";

export default function NewWeeklyTestPage() {
  const action = createTest.bind(null, "WEEKLY");

  return (
    <div>
      <h1 className="text-lg font-semibold text-gray-900">New Weekly Test</h1>
      <div className="mt-6">
        <TestForm action={action} type="WEEKLY" />
      </div>
    </div>
  );
}
