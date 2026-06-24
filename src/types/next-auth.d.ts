// types/next-auth.d.ts
import { DefaultSession, DefaultJWT } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      isAdmin: boolean;
      isBanned: boolean;
      isDeleted?: boolean;
    } & DefaultSession["user"];
  }

  interface User {
    isAdmin: boolean;
    isBanned: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    isAdmin: boolean;
    isBanned: boolean;
  }
}