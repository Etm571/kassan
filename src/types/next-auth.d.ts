import 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name?: string;
      userId?: string;
      email?: string;
    };
  }

  interface User {
    id: string;
    name?: string;
    userId?: string;
    email?: string;
  }
}

declare module '@auth/core/jwt' {
  interface JWT {
    userId: string;
  }
}