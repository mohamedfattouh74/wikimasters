'use client';

import { useActionState } from 'react';
import { signOutAction } from '@/app/actions/auth';
import { Button } from '@/components/ui/button';

export function SignOutButton() {
  const [, formAction, isPending] = useActionState(signOutAction, null);

  return (
    <form action={formAction}>
      <Button type="submit" disabled={isPending} variant="outline">
        {isPending ? 'Signing out...' : 'Sign Out'}
      </Button>
    </form>
  );
}
