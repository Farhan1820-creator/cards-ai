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

        const isValid = await bcrypt.compare(credentials.password, user.password);
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

  session: { strategy: "jwt" },

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

    async jwt({ token, user, trigger }) {
      // Pehli baar login — user object available hota hai
      if (user) {
        token.id = user.id;
        token.isAdmin = user.isAdmin ?? false;
        token.isBanned = user.isBanned ?? false;
        token.isDeleted = false;
      }

      // Har signIn pe DB se latest status fetch karo
      // Credentials aur Google dono ke liye kaam karega
      if (trigger === "signIn") {
        const [dbUser] = await db
          .select({
            isAdmin: users.isAdmin,
            isBanned: users.isBanned,
          })
          .from(users)
          .where(eq(users.id, token.id));

        if (!dbUser) {
          // User DB mein exist nahi — deleted hai
          token.isDeleted = true;
        } else {
          token.isAdmin = dbUser.isAdmin;
          token.isBanned = dbUser.isBanned;
          token.isDeleted = false;
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.isAdmin = token.isAdmin;
        session.user.isBanned = token.isBanned;
      }
      return session;
    },
  },

  pages: { signIn: "/login" },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };