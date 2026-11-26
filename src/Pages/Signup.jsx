import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { authAPI } from '../features/auth/authAPI';
import { AuthLayout } from '../components/AuthLayout';
import { TextField } from '../components/TextField';
import { emailRules } from '../lib/validation';

export const Signup = () => {
  const [submitError, setSubmitError] = useState('');
  const navigate = useNavigate();

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
      {submitError && (
        <div className="alert mb-6" role="alert">
          {submitError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        <TextField
          id="username"
          label="Username"
          type="text"
          autoComplete="username"
          error={errors.username}
          registration={register('username', {
            required: 'Choose a username.',
            minLength: { value: 3, message: 'Use at least 3 characters.' },
          })}
        />

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
          autoComplete="new-password"
          hint="At least 6 characters."
          error={errors.password}
          registration={register('password', {
            required: 'Choose a password.',
            minLength: { value: 6, message: 'Use at least 6 characters.' },
          })}
        />

        <button type="submit" disabled={isSubmitting} className="btn-primary w-full h-11">
          {isSubmitting ? 'Creating account' : 'Create account'}
        </button>
      </form>
    </AuthLayout>
  );
};
