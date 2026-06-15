import NextAuth, { type AuthOptions } from "next-auth";
import Google from "next-auth/providers/google";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcrypt";

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

    async jwt({ token, user, trigger, session }) {
      // ── Login pe user se inject karo ──────────────────
      if (user) {
        token.isAdmin = user.isAdmin ?? false;
        token.isBanned = user.isBanned ?? false;
        token.id = user.id;
      }

      // ── DB se fresh data lo har baar token refresh pe ─
      // (admin status change ho to token stale na rahe)
      if (trigger === "update" || (!user && token.id)) {
        const [freshUser] = await db
          .select()
          .from(users)
          .where(eq(users.id, token.id as string));

        if (freshUser) {
          token.isAdmin = freshUser.isAdmin;
          token.isBanned = freshUser.isBanned;
        }
      }

      return token;
    },

async session({ session, token }) {
  if (session.user) {
    session.user.id       = token.id as string;
    session.user.isAdmin  = token.isAdmin;
    session.user.isBanned = token.isBanned;
  }
  return session;
},

    // ── Login ke baad role based redirect ─────────────
    async redirect({ url, baseUrl }) {
      // callback URL already set hai (e.g. ?callbackUrl=...)
      if (url.startsWith(baseUrl)) return url;
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      return baseUrl;
    },
  },

  pages: {
    signIn: "/login",
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };