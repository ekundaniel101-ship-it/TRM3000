import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { deleteUser } from "./actions";

export default async function AdminPage() {
  const session = await auth();
  if (session?.user?.role !== "OWNER") redirect("/dashboard");

  const users = await prisma.user.findMany({ orderBy: { createdAt: "asc" } });

  return (
    <div>
      <h1 className="text-lg font-semibold text-gray-900">Master Control</h1>
      <p className="mt-1 text-sm text-gray-700">
        Everyone who has created a teacher account on NEXUS.
      </p>

      <div className="mt-6 overflow-hidden rounded-lg border border-gray-200 bg-white">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-700">
                Name
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-700">
                Email
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-700">
                Role
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-700">
                Joined
              </th>
              <th className="px-4 py-2" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-4 py-2 text-sm text-gray-900">{user.name || "—"}</td>
                <td className="px-4 py-2 text-sm text-gray-700">{user.email}</td>
                <td className="px-4 py-2 text-sm">
                  {user.role === "OWNER" ? (
                    <span className="rounded-full bg-gradient-to-r from-blue-600 to-purple-600 px-2 py-0.5 text-xs font-medium text-white">
                      Owner
                    </span>
                  ) : (
                    <span className="text-gray-700">Teacher</span>
                  )}
                </td>
                <td className="px-4 py-2 text-sm text-gray-700">
                  {user.createdAt.toLocaleDateString()}
                </td>
                <td className="px-4 py-2 text-right text-sm">
                  {user.role !== "OWNER" && (
                    <form action={deleteUser} className="inline">
                      <input type="hidden" name="userId" value={user.id} />
                      <button type="submit" className="text-red-600 hover:underline">
                        Remove access
                      </button>
                    </form>
                  )}
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-sm text-gray-700">
                  No accounts yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
