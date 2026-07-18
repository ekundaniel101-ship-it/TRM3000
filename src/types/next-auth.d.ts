import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "OWNER" | "TEACHER";
    } & DefaultSession["user"];
  }

  interface User {
    role?: "OWNER" | "TEACHER";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: "OWNER" | "TEACHER";
  }
}
