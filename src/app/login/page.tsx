//src/app/login/page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { loginUser, clearError } from '@/lib/features/auth/authSlice';
import { loginSchema, type LoginFormData } from '@/lib/validations/auth';
import { DASHBOARD_HOME } from '@/config/navigation';
import { AuthShell } from '@/components/auth/AuthShell';
import { TextField, PasswordField } from '@/components/forms/FormField';
import { FormAlert } from '@/components/shared/FormAlert';
import { LoadingButton } from '@/components/shared/LoadingButton';

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((state) => state.auth);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  // Don't show an error left over from the register page
  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  const onSubmit = async (data: LoginFormData) => {
    const result = await dispatch(loginUser(data));

    if (loginUser.fulfilled.match(result)) {
      // Redirect based on role
      router.push(DASHBOARD_HOME[result.payload.user.role]);
    }
  };

  return (
    <AuthShell title="Welcome back" description="Sign in to your account to continue">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {/* Global error from Redux */}
        <FormAlert message={error} />

        <TextField
          label="Email address"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          error={errors.email?.message}
          {...register('email')}
        />

        <PasswordField
          label="Password"
          placeholder="••••••••"
          autoComplete="current-password"
          error={errors.password?.message}
          {...register('password')}
        />

        <LoadingButton type="submit" loading={loading} loadingText="Signing in..." className="mt-2 h-11 w-full">
          Sign in
        </LoadingButton>

        <p className="pt-2 text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="font-medium text-primary hover:underline">
            Create account
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
