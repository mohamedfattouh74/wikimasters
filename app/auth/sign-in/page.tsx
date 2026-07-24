import { SignInForm } from '@/components/auth/sign-in-form';

export default function SignInPage() {
  return (
    <div className="flex flex-col gap-5 min-h-screen items-center justify-center bg-gray-900">
      <div className="w-sm">
        <h1 className="mt-10 text-center text-2xl/9 font-bold text-white">
          Sign in to your account
        </h1>
      </div>
      <SignInForm />
    </div>
  );
}
