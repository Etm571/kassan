import NextAuth from "next-auth";
import { authOptions } from "@/../auth.config";

const fixedAuthConfig = {
  ...authOptions,
  session: {
	...authOptions.session,
	strategy: authOptions.session.strategy as "jwt" | "database",
  },
};

const handler = NextAuth(fixedAuthConfig);
export { handler as GET, handler as POST };
