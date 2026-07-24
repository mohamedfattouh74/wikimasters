import Link from 'next/link';
import { SignOutButton } from '@/components/auth/sign-out-button';
import { Button } from '@/components/ui/button';

type NavBarProps = {
  session: {
    user?: {
      name?: string | null;
      email?: string | null;
    } | null;
  } | null;
};

export default function NavBar({ session }: NavBarProps) {
  return (
    <nav className="w-full border-b bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 sticky top-0 z-50">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link
          href="/"
          className="font-bold text-xl tracking-tight text-gray-900"
        >
          Wikimasters
        </Link>
        <div className="flex items-center gap-2">
          {session ? (
            <>
              <p className="text-sm text-gray-700">
                Welcome,{' '}
                {session.user?.name ?? session.user?.email ?? 'User'}
              </p>
              <SignOutButton />
            </>
          ) : (
            <>
              <Button variant="outline" nativeButton={false} render={<Link href="/auth/sign-in" />}>
                Sign In
              </Button>
              <Button variant="outline" nativeButton={false} render={<Link href="/auth/sign-up" />}>
                Sign Up
              </Button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
