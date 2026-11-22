import { LogoMark } from './Logo';

export const AuthLayout = ({ title, subtitle, children, footer }) => (
  <main className="min-h-[calc(100vh-3.5rem)] flex items-start sm:items-center justify-center px-4 py-12">
    <div className="w-full max-w-[400px]">
      <LogoMark className="w-9 h-9 text-ink mb-6" />
      <h1 className="text-[28px] leading-tight font-extrabold tracking-[-0.02em] text-ink">
        {title}
      </h1>
      <p className="mt-2 text-muted leading-relaxed">{subtitle}</p>
      <div className="mt-8">{children}</div>
      <p className="mt-8 pt-6 border-t border-line text-sm text-muted">{footer}</p>
    </div>
  </main>
);

export const Field = ({ id, label, error, children }) => (
  <div>
    <label className="label" htmlFor={id}>
      {label}
    </label>
    {children}
    {error && (
      <p id={`${id}-error`} className="field-error">
        {error}
      </p>
    )}
  </div>
);
