import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

type Role = 'ADMIN' | 'STAFF' | 'CUSTOMER';

const protectedRoutes: {
  path: string;
  roles: Role[];
  type: 'api' | 'page';
}[] = [
  // API
  { path: '/api/admin', roles: ['ADMIN'], type: 'api' },
  { path: '/api/staff', roles: ['ADMIN', 'STAFF'], type: 'api' },
  
  // Page
  { path: '/admin', roles: ['ADMIN'], type: 'page' },
  { path: '/staff', roles: ['ADMIN', 'STAFF'], type: 'page' },
  { path: '/dashboard', roles: ['ADMIN', 'STAFF', 'CUSTOMER'], type: 'page' },
];

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  const { pathname } = request.nextUrl;

  try {
    const matchedRoute = protectedRoutes.find(route => 
      pathname.startsWith(route.path)
    );

    if (matchedRoute) {
      if (!token) {
        if (matchedRoute.type === 'api') {
          return NextResponse.json(
            { error: 'Authentication required' },
            { status: 401 }
          );
        } else {
          const loginUrl = new URL('/login', request.url);
          loginUrl.searchParams.set('callbackUrl', pathname);
          return NextResponse.redirect(loginUrl);
        }
      }

      const userRole = token.role as Role;
      if (!matchedRoute.roles.includes(userRole)) {
        if (matchedRoute.type === 'api') {
          return NextResponse.json(
            { error: 'Insufficient permissions' },
            { status: 403 }
          );
        } else {
          return NextResponse.redirect(new URL('/unauthorized', request.url));
        }
      }
    }

    return NextResponse.next();
  } catch (error) {
    console.error('Middleware error:', error);
    return NextResponse.next();
  }
}

export const config = {
  matcher: [

    '/((?!api/auth|api/items|_next/static|_next/image|favicon.ico|login|unauthorized).*)',
    '/api/:path*',

  ],
};