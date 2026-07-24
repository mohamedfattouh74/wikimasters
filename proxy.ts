import { auth } from '@/lib/auth/server';
import type { NextRequest } from 'next/server';

const authMiddleware = auth.middleware({
  // Redirects unauthenticated users to sign-in page
  loginUrl: '/auth/sign-in',
});

export default function proxy(request: NextRequest) {
  // Server Actions must not be redirected by auth middleware —
  // they check the session themselves. Redirecting them returns HTML
  // instead of an action response → "unexpected response from the server".
  if (request.headers.has('Next-Action')) {
    return;
  }

  return authMiddleware(request);
}

export const config = {
  matcher: [
    // Protected routes requiring authentication
    '/wiki/edit/:path*',
  ],
};
