import { prisma } from "@/lib/db";

export default async function DashboardPage() {
  const [studentCount, weeklyCount, afterClassCount, mockCount] = await Promise.all([
    prisma.student.count(),
    prisma.test.count({ where: { type: "WEEKLY" } }),
    prisma.test.count({ where: { type: "AFTER_CLASS" } }),
    prisma.test.count({ where: { type: "MOCK" } }),
  ]);

  const stats = [
    { label: "Students", value: studentCount },
    { label: "Weekly Tests", value: weeklyCount },
    { label: "After-Class Tests", value: afterClassCount },
    { label: "Mock Exams", value: mockCount },
  ];

  return (
    <div>
      <h1 className="text-lg font-semibold text-gray-900">Dashboard</h1>
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-lg border border-gray-200 bg-white p-6"
          >
            <p className="text-sm text-gray-700">{stat.label}</p>
            <p className="mt-2 text-2xl font-semibold text-gray-900">{stat.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
