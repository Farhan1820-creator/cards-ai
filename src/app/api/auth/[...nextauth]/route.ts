import NextAuth, { type AuthOptions } from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcrypt";

import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export const authOptions: AuthOptions = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    Credentials({
      name: "Email & Password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          throw new Error("Missing credentials");
        }

        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.email, credentials.email));

        if (!user || !user.password) {
          throw new Error("Invalid email or password");
        }

        if (user.isBanned) {
          throw new Error("Your account has been banned");
        }

        const isValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isValid) {
          throw new Error("Invalid email or password");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          isAdmin: user.isAdmin,
          isBanned: user.isBanned,
        };
      },
    }),
  ],

  session: {
    strategy: "jwt",
  },

  callbacks: {
    async signIn({ user, account }) {
      if (!user.email) return false;

      // Google signup handling
      if (account?.provider !== "credentials") {
        const [existingUser] = await db
          .select()
          .from(users)
          .where(eq(users.email, user.email));

        if (existingUser) {
          if (existingUser.isBanned) return false;
        } else {
          await db.insert(users).values({
            id: user.id!,
            email: user.email,
            name: user.name,
            image: user.image,
            isAdmin: false,
            isBanned: false,
          });
        }
      }

      return true;
    },

    // ✅ CLEAN JWT (NO DB CALLS)
async jwt({ token, user, trigger }) {
  if (user) {
    token.id = user.id;
    token.isAdmin = user.isAdmin ?? false;
    token.isBanned = user.isBanned ?? false;
  }

  // Har JWT refresh pe DB se latest status check karo
  // Sirf token issue hone pe (login pe) — middleware pe nahi
  if (trigger === "signIn" || trigger === "update") {
    const [dbUser] = await db
      .select({ isAdmin: users.isAdmin, isBanned: users.isBanned })
      .from(users)
      .where(eq(users.id, token.id as string));

    if (!dbUser) {
      // User deleted hai — token invalid mark karo
      token.isDeleted = true;
    } else {
      token.isAdmin = dbUser.isAdmin;
      token.isBanned = dbUser.isBanned;
      token.isDeleted = false;
    }
  }

  return token;
},

    // session mapping only
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.isAdmin = token.isAdmin as boolean;
        session.user.isBanned = token.isBanned as boolean;
      }
      return session;
    },
  },

  pages: {
    signIn: "/login",
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };