'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { registerUser, clearError } from '@/lib/features/auth/authSlice';
import { registerSchema, type RegisterFormData } from '@/lib/validations/auth';
import { DASHBOARD_HOME } from '@/config/navigation';
import { AuthShell } from '@/components/auth/AuthShell';
import { RoleSelector } from '@/components/auth/RoleSelector';
import { FormField, TextField, PasswordField } from '@/components/forms/FormField';
import { FormAlert } from '@/components/shared/FormAlert';
import { LoadingButton } from '@/components/shared/LoadingButton';

export default function RegisterPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((state) => state.auth);

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: 'student' },
  });

  const selectedRole = useWatch({ control, name: 'role' });

  // Don't show an error left over from the login page
  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  const onSubmit = async ({ name, email, password, role }: RegisterFormData) => {
    const result = await dispatch(registerUser({ name, email, password, role }));

    if (registerUser.fulfilled.match(result)) {
      router.push(DASHBOARD_HOME[result.payload.user.role]);
    }
  };

  return (
    <AuthShell title="Create account" description="Join Gradedman today — it's free">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <FormAlert message={error} />

        {/* Role Selector — shown first so user knows which form they're filling */}
        <FormField label="I am a" error={errors.role?.message}>
          <RoleSelector value={selectedRole} onChange={(role) => setValue('role', role)} />
        </FormField>

        <TextField
          label="Full name"
          placeholder="John Doe"
          autoComplete="name"
          error={errors.name?.message}
          {...register('name')}
        />

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
          placeholder="Min. 6 characters"
          autoComplete="new-password"
          error={errors.password?.message}
          {...register('password')}
        />

        <PasswordField
          label="Confirm password"
          placeholder="Repeat your password"
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />

        <LoadingButton type="submit" loading={loading} loadingText="Creating account..." className="mt-2 h-11 w-full">
          Create account
        </LoadingButton>

        <p className="pt-2 text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
