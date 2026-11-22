import { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { selectAuthStatus } from '../features/auth/authSlice';
import { authAPI } from '../features/auth/authAPI';
import { AuthLayout, Field } from '../components/AuthLayout';

export const Signup = () => {
  const [submitError, setSubmitError] = useState('');

  const navigate = useNavigate();
  const authStatus = useSelector(selectAuthStatus);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: { username: '', email: '', password: '' },
    mode: 'onBlur',
  });

  const onSubmit = async (data) => {
    setSubmitError('');
    try {
      await authAPI.register(data);
      navigate('/login');
    } catch (err) {
      setSubmitError(err.message || 'Account could not be created. Try again.');
    }
  };

  const busy = isSubmitting || authStatus === 'loading';

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Make a link, share it, and get feedback people wouldn't say to your face."
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-accent hover:underline underline-offset-4">
            Sign in
          </Link>
        </>
      }
    >
      {submitError && <div className="alert mb-6">{submitError}</div>}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        <Field id="username" label="Username" error={errors.username?.message}>
          <input
            id="username"
            type="text"
            autoComplete="username"
            className="input"
            aria-invalid={!!errors.username}
            aria-describedby={errors.username ? 'username-error' : undefined}
            {...register('username', {
              required: 'Choose a username.',
              minLength: { value: 3, message: 'Use at least 3 characters.' },
            })}
          />
        </Field>

        <Field id="email" label="Email" error={errors.email?.message}>
          <input
            id="email"
            type="email"
            autoComplete="email"
            className="input"
            placeholder="you@example.com"
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? 'email-error' : undefined}
            {...register('email', {
              required: 'Enter your email address.',
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: 'Enter an email like name@example.com.',
              },
            })}
          />
        </Field>

        <Field id="password" label="Password" error={errors.password?.message}>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            className="input"
            aria-invalid={!!errors.password}
            aria-describedby={errors.password ? 'password-error' : 'password-hint'}
            {...register('password', {
              required: 'Choose a password.',
              minLength: { value: 6, message: 'Use at least 6 characters.' },
            })}
          />
          {!errors.password && (
            <p id="password-hint" className="hint">
              At least 6 characters.
            </p>
          )}
        </Field>

        <button type="submit" disabled={busy} className="btn-primary w-full h-11">
          {busy ? 'Creating account' : 'Create account'}
        </button>
      </form>
    </AuthLayout>
  );
};
