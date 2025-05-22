

import { PrismaAdapter } from "@auth/prisma-adapter";
import { getServerSession } from "next-auth";
import { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/app/lib/prisma";
import crypto from "crypto";


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
            name: 'User ID',
            credentials: {
                userId: { label: 'User ID', type: 'text' }
            },
            async authorize(credentials) {
                try {
                    if (!credentials || !credentials.userId) {
                        return null;
                    }
                    const user = await prisma.user.findUnique({
                        where: { userId: credentials.userId as string }
                    });

                    if (!user) return null;

                    return {
                        ...user,
                        id: user.id.toString(),
                    };
                } catch (error) {
                    console.error('Authorization error:', error);
                    return null;
                }
            }
        })
    ],
    pages: {
        signIn: "/login",
    },

    callbacks: {
    async jwt({ token, user }) {
        if (user) {
            token.userId = user.userId;
        }
        return token;
    },
    async session({ session, token }) {
        if (session.user && token.userId) {
            session.user.userId = token.userId as string;
        }
        return session;
    },
}

};

export function auth() {
  return getServerSession(authOptions);
}