import { prisma } from "@/lib/db";

export default async function DashboardPage() {
  const [studentCount, weeklyCount, afterClassCount, mockCount] = await Promise.all([
    prisma.student.count(),
    prisma.test.count({ where: { type: "WEEKLY" } }),
    prisma.test.count({ where: { type: "AFTER_CLASS" } }),
    prisma.test.count({ where: { type: "MOCK" } }),
  ]);

  const stats = [
    {
      label: "Students",
      value: studentCount,
      accent: "from-blue-500 to-blue-600",
      icon: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z"
        />
      ),
    },
    {
      label: "Weekly Tests",
      value: weeklyCount,
      accent: "from-purple-500 to-purple-600",
      icon: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"
        />
      ),
    },
    {
      label: "After-Class Tests",
      value: afterClassCount,
      accent: "from-indigo-500 to-indigo-600",
      icon: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
        />
      ),
    },
    {
      label: "Mock Exams",
      value: mockCount,
      accent: "from-fuchsia-500 to-purple-600",
      icon: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 12h3.75M9 15h3.75M9 18h3.75M16.5 3.75a2.25 2.25 0 0 0-2.25-2.25h-4.5A2.25 2.25 0 0 0 7.5 3.75m9 0v2.25a2.25 2.25 0 0 1-2.25 2.25h-4.5a2.25 2.25 0 0 1-2.25-2.25V3.75m9 0h1.5a2.25 2.25 0 0 1 2.25 2.25v13.5A2.25 2.25 0 0 1 18 21.75H6a2.25 2.25 0 0 1-2.25-2.25V6a2.25 2.25 0 0 1 2.25-2.25h1.5"
        />
      ),
    },
  ];

  return (
    <div>
      <h1 className="text-lg font-semibold text-gray-900">Dashboard</h1>
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
          >
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${stat.accent}`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.75}
                stroke="white"
                className="h-5 w-5"
              >
                {stat.icon}
              </svg>
            </div>
            <p className="mt-4 text-sm text-gray-700">{stat.label}</p>
            <p className="mt-1 text-2xl font-semibold text-gray-900">{stat.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
