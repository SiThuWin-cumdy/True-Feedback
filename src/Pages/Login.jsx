import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { signIn } from '../features/auth/authSlice';
import { authAPI } from '../features/auth/authAPI';
import { AuthLayout } from '../components/AuthLayout';
import { TextField } from '../components/TextField';
import { emailRules } from '../lib/validation';

export const Login = () => {
  const [submitError, setSubmitError] = useState('');
  const dispatch = useDispatch();

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
      // Not a thunk: thunk arguments land in Redux actions, and this one is a password.
      const { user, token } = await authAPI.login(data);
      dispatch(signIn({ user, token })); // GuestRoute redirects to the dashboard
    } catch (err) {
      setSubmitError(err.message || 'Sign in failed. Check your email and password.');
    }
  };

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
      {submitError && (
        <div className="alert mb-6" role="alert">
          {submitError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        <TextField
          id="email"
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          error={errors.email}
          registration={register('email', emailRules)}
        />

        <TextField
          id="password"
          label="Password"
          type="password"
          autoComplete="current-password"
          error={errors.password}
          registration={register('password', { required: 'Enter your password.' })}
        />

        <button type="submit" disabled={isSubmitting} className="btn-primary w-full h-11">
          {isSubmitting ? 'Signing in' : 'Sign in'}
        </button>
      </form>
    </AuthLayout>
  );
};
