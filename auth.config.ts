import { PrismaAdapter } from "@auth/prisma-adapter";
import { getServerSession } from "next-auth";
import { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/app/lib/prisma";
import crypto from "crypto";

declare module "next-auth" {
  interface User {
    role?: string;
  }
  
  interface Session {
    user: {
      name?: string | null;
      email?: string | null;
      image?: string | null;
      userId: string;
      token: string;
      role: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string;
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
    maxAge: 4 * 60 * 60,
  },
  providers: [
    Credentials({
      name: "User ID",
      credentials: {
        userId: { label: "User ID", type: "text" },
        callbackUrl: { label: "Callback URL", type: "text" },
      },
      async authorize(credentials, req) {
        try {
          if (!credentials || !credentials.userId) {
            return null;
          }

          const user = await prisma.user.findUnique({
            where: { userId: Number(credentials.userId) },
          });

          if (!user) return null;

          if (user.suspended) return null;

          let generatedToken = user.token;

          if (!user.token || !user.tokenExpiry || user.tokenExpiry < new Date()) {
            generatedToken = crypto.randomBytes(16).toString("hex");
            await prisma.user.update({
              where: { userId: user.userId },
              data: {
                token: generatedToken,
                tokenExpiry: new Date(Date.now() + 4 * 60 * 60 * 1000),
              },
            });
          }
          return {
            ...user,
            id: user.id.toString(),
            userId: user.userId.toString(),
            token: generatedToken,
            role: user.role
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
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.userId) {
        session.user.userId = token.userId as string;
        session.user.token = token.authToken as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
};

export function auth() {
  return getServerSession(authOptions);
}