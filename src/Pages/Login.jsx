import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { signIn, selectAuthStatus } from '../features/auth/authSlice';
import { authAPI } from '../features/auth/authAPI';
import { AuthLayout, Field } from '../components/AuthLayout';

export const Login = () => {
  const [submitError, setSubmitError] = useState('');

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const authStatus = useSelector(selectAuthStatus);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: { email: '', password: '' },
    mode: 'onBlur',
  });

  const onSubmit = async (data) => {
    setSubmitError('');
    try {
      const result = await authAPI.login(data);
      dispatch(signIn({ user: result.user, token: result.token }));
      navigate('/dashboard');
    } catch (err) {
      setSubmitError(err.message || 'Sign in failed. Check your email and password.');
    }
  };

  const busy = isSubmitting || authStatus === 'loading';

  return (
    <AuthLayout
      title="Sign in"
      subtitle="Read the replies to your feedback links."
      footer={
        <>
          New to TrueFeedback?{' '}
          <Link to="/signup" className="font-semibold text-accent hover:underline underline-offset-4">
            Create an account
          </Link>
        </>
      }
    >
      {submitError && <div className="alert mb-6">{submitError}</div>}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
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
            autoComplete="current-password"
            className="input"
            aria-invalid={!!errors.password}
            aria-describedby={errors.password ? 'password-error' : undefined}
            {...register('password', {
              required: 'Enter your password.',
              minLength: { value: 6, message: 'Passwords are at least 6 characters.' },
            })}
          />
        </Field>

        <button type="submit" disabled={busy} className="btn-primary w-full h-11">
          {busy ? 'Signing in' : 'Sign in'}
        </button>
      </form>
    </AuthLayout>
  );
};
