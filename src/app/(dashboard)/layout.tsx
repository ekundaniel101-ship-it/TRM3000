import Link from "next/link";
import { auth } from "@/lib/auth";
import { logoutAction } from "./actions";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/students", label: "Students" },
  { href: "/tests/weekly", label: "Weekly Tests" },
  { href: "/tests/after-class", label: "After-Class Tests" },
];

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-6">
            <span className="text-sm font-semibold text-gray-900">TRM3000</span>
            <nav className="flex gap-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">{session?.user?.email}</span>
            <form action={logoutAction}>
              <button
                type="submit"
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Log out
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
    </div>
  );
}
