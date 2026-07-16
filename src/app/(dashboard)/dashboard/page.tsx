import { prisma } from "@/lib/db";

export default async function DashboardPage() {
  const [studentCount, weeklyCount, afterClassCount] = await Promise.all([
    prisma.student.count(),
    prisma.test.count({ where: { type: "WEEKLY" } }),
    prisma.test.count({ where: { type: "AFTER_CLASS" } }),
  ]);

  const stats = [
    { label: "Students", value: studentCount },
    { label: "Weekly Tests", value: weeklyCount },
    { label: "After-Class Tests", value: afterClassCount },
  ];

  return (
    <div>
      <h1 className="text-lg font-semibold text-gray-900">Dashboard</h1>
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-lg border border-gray-200 bg-white p-6"
          >
            <p className="text-sm text-gray-500">{stat.label}</p>
            <p className="mt-2 text-2xl font-semibold text-gray-900">{stat.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
