import { forwardRef } from "react";

export const Field = ({ label, hint, error, children, required }) => (
  <label className="block">
    <span className="block text-sm font-medium text-ink mb-1.5">
      {label} {required && <span className="text-pulse">*</span>}
    </span>
    {children}
    {error ? (
      <span className="block text-xs text-pulse mt-1.5">{error}</span>
    ) : hint ? (
      <span className="block text-xs text-ink-500 mt-1.5">{hint}</span>
    ) : null}
  </label>
);

const baseStyles =
  "w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-300 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-pulse/20 focus:border-pulse";

export const Input = forwardRef(({ error, className = "", ...props }, ref) => (
  <input
    ref={ref}
    className={`${baseStyles} ${error ? "border-pulse" : "border-ink/10"} ${className}`}
    {...props}
  />
));
Input.displayName = "Input";

export const Select = forwardRef(({ error, className = "", children, ...props }, ref) => (
  <select
    ref={ref}
    className={`${baseStyles} ${error ? "border-pulse" : "border-ink/10"} ${className}`}
    {...props}
  >
    {children}
  </select>
));
Select.displayName = "Select";

export const Textarea = forwardRef(({ error, className = "", ...props }, ref) => (
  <textarea
    ref={ref}
    className={`${baseStyles} resize-none ${error ? "border-pulse" : "border-ink/10"} ${className}`}
    {...props}
  />
));
Textarea.displayName = "Textarea";
