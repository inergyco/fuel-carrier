import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "../utils";

type ButtonVariant = "primary" | "outline" | "ghost" | "icon" | "danger";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  loadingText?: ReactNode;
}

export type { ButtonVariant, ButtonSize };

const buttonVariantClassName: Record<ButtonVariant, string> = {
  primary:
    "btn btn-primary w-full rounded-lg border-primary font-semibold tracking-widest uppercase shadow-none",
  outline:
    "btn btn-outline btn-primary w-full rounded-lg border-primary bg-panel-card! text-primary shadow-none font-semibold tracking-widest uppercase",
  ghost: "btn btn-ghost w-auto px-2 normal-case tracking-normal",
  icon: "btn btn-ghost btn-circle",
  danger:
    "btn btn-error w-full rounded-lg font-semibold tracking-widest uppercase",
};

export const buttonSizeClassName: Record<ButtonSize, string> = {
  sm: "btn-xs h-9 min-h-9 text-xs",
  md: "btn-sm h-11 min-h-11 text-xs",
  lg: "btn-lg h-14 min-h-14 text-sm",
};

export const buttonIconSizeClassName: Record<ButtonSize, string> = {
  sm: "btn-sm size-9 min-h-9 min-w-9",
  md: "btn-sm size-11 min-h-11 min-w-11",
  lg: "btn-md size-14 min-h-14 min-w-14",
};

const buttonSpinnerClassName: Record<ButtonSize, string> = {
  sm: "loading-xs",
  md: "loading-xs",
  lg: "loading-sm",
};

/** Default (md) class strings for anchors and other non-button elements. */
export const buttonClassName: Record<ButtonVariant, string> = {
  primary: `${buttonVariantClassName.primary} btn-sm text-xs`,
  outline: `${buttonVariantClassName.outline} text-xs btn-sm`,
  ghost: `${buttonVariantClassName.ghost} btn-sm text-xs`,
  icon: `${buttonVariantClassName.icon} btn-sm size-11`,
  danger: `${buttonVariantClassName.danger} btn-sm text-xs`,
};

export function Button({
  variant = "primary",
  size = "md",
  loading,
  loadingText,
  disabled,
  className,
  children,
  ...props
}: ButtonProps) {
  const sizeClassName =
    variant === "icon"
      ? buttonIconSizeClassName[size]
      : buttonSizeClassName[size];

  return (
    <button
      disabled={disabled ?? loading}
      className={cn(
        buttonVariantClassName[variant],
        sizeClassName,
        "cursor-pointer transition-all disabled:cursor-not-allowed",
        loading && "opacity-60",
        className,
      )}
      {...props}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <span
            className={cn(
              "loading loading-spinner",
              buttonSpinnerClassName[size],
            )}
          />
          {loadingText ?? children}
        </span>
      ) : (
        children
      )}
    </button>
  );
}
