import { forwardRef } from "react";
import { Loader2 } from "lucide-react";

const VARIANTS = {
  primary:
    "bg-pulse text-white shadow-glow hover:bg-pulse-600 active:scale-[0.98]",
  dark: "bg-ink text-paper hover:bg-ink-600 active:scale-[0.98]",
  outline:
    "border border-ink/15 bg-transparent text-ink hover:bg-ink/5 active:scale-[0.98]",
  ghost: "bg-transparent text-ink-500 hover:bg-ink/5 hover:text-ink",
  success: "bg-vital text-white hover:brightness-95 active:scale-[0.98]",
};

const SIZES = {
  sm: "text-sm px-3 py-1.5 rounded-lg gap-1.5",
  md: "text-sm px-4 py-2.5 rounded-xl gap-2",
  lg: "text-base px-6 py-3.5 rounded-xl gap-2.5",
};

const Button = forwardRef(
  (
    { as: Component = "button", variant = "primary", size = "md", loading, disabled, icon: Icon, children, className = "", ...props },
    ref
  ) => {
    return (
      <Component
        ref={ref}
        disabled={Component === "button" ? disabled || loading : undefined}
        aria-disabled={disabled || loading || undefined}
        className={`inline-flex items-center justify-center font-medium transition-all duration-150 ease-out
          disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100
          ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
        {...props}
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          Icon && <Icon className="w-4 h-4" strokeWidth={2.25} />
        )}
        {children}
      </Component>
    );
  }
);
Button.displayName = "Button";
export default Button;
