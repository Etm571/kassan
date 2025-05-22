import { PrismaAdapter } from "@auth/prisma-adapter";
import { getServerSession } from "next-auth";
import { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/app/lib/prisma";
import crypto from "crypto";

declare module "next-auth" {
  interface Session {
    user: {
      name?: string | null;
      email?: string | null;
      image?: string | null;
      userId: string;
      token: string;
    };
  }
}

function patchPrismaAdapter(adapter: any) {
  return {
    ...adapter,
    getUser: async (id: string) => {
      const user = await adapter.getUser?.(id);
      if (user && user.name === null) {
        return { ...user, name: undefined };
      }
      return user;
    },
  };
}

export const authOptions: NextAuthOptions = {
  adapter: patchPrismaAdapter(PrismaAdapter(prisma)),
  session: {
    strategy: "jwt",
  },
  providers: [
    Credentials({
      name: "User ID",
      credentials: {
        userId: { label: "User ID", type: "text" },
      },
      async authorize(credentials) {
        try {
          if (!credentials || !credentials.userId) {
            return null;
          }

          const user = await prisma.user.findUnique({
            where: { userId: credentials.userId as string },
          });

          if (!user) return null;

          const generatedToken = crypto.randomBytes(16).toString("hex");

          const tokenExpiry = new Date(Date.now() + 4 * 60 * 60 * 1000);


          await prisma.user.update({
            where: { userId: user.userId },
            data: {
              token: generatedToken,
              tokenExpiry,
            },
          });

          return {
            ...user,
            id: user.id.toString(),
            token: generatedToken,
          };
        } catch (error) {
          console.error("Authorization error:", error);
          return null;
        }
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.userId = user.userId;
        token.authToken = (user as any).token;
      }
      return token;
    },
    async session({ session, token }) {
    if (session.user && token.userId) {
        session.user.userId = token.userId as string;
        session.user.token = token.authToken as string;
    }
    return session;
}

  },
};

export function auth() {
  return getServerSession(authOptions);
}
