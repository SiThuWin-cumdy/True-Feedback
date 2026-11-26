// Labelled input for react-hook-form: `registration` is `register(id, rules)`.
export const TextField = ({ id, label, error, hint, registration, ...inputProps }) => {
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;
  const describedBy = error ? errorId : hint ? hintId : undefined;

  return (
    <div>
      <label className="label" htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        className="input"
        aria-invalid={!!error}
        aria-describedby={describedBy}
        {...inputProps}
        {...registration}
      />
      {error ? (
        <p id={errorId} className="field-error">
          {error.message}
        </p>
      ) : (
        hint && (
          <p id={hintId} className="hint">
            {hint}
          </p>
        )
      )}
    </div>
  );
};
