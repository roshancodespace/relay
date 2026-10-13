import React, { forwardRef } from "react";
import { Loader2 } from "lucide-react";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "success";
export type ButtonSize = "xs" | "sm" | "md";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  isLoading?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-[#111111] dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 border border-transparent shadow-sm",
  secondary:
    "border border-[#e7e7e5] dark:border-white/[0.08] bg-white dark:bg-[#121215] text-zinc-700 dark:text-zinc-300 hover:text-[#111111] dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-[#18181c]",
  ghost:
    "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/[0.08] border border-transparent",
  danger:
    "text-zinc-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 border border-transparent",
  success:
    "bg-emerald-600 text-white hover:bg-emerald-700 border border-transparent shadow-sm",
};

const sizeStyles: Record<ButtonSize, string> = {
  xs: "h-6 px-2 text-[11px] gap-1 rounded",
  sm: "h-7 px-2.5 text-xs gap-1.5 rounded-md",
  md: "h-8 px-3 text-xs gap-1.5 rounded-md",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "secondary",
      size = "sm",
      icon,
      iconPosition = "left",
      isLoading = false,
      disabled,
      className = "",
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`inline-flex items-center justify-center font-medium font-sans transition-colors select-none disabled:opacity-50 disabled:pointer-events-none cursor-pointer ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          icon && iconPosition === "left" && <span className="shrink-0">{icon}</span>
        )}
        {children}
        {!isLoading && icon && iconPosition === "right" && (
          <span className="shrink-0">{icon}</span>
        )}
      </button>
    );
  }
);
Button.displayName = "Button";

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon: React.ReactNode;
  isLoading?: boolean;
}

const iconSizeStyles: Record<ButtonSize, string> = {
  xs: "h-6 w-6 rounded",
  sm: "h-7 w-7 rounded-md",
  md: "h-8 w-8 rounded-md",
};

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      variant = "ghost",
      size = "sm",
      icon,
      isLoading = false,
      disabled,
      className = "",
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`inline-flex items-center justify-center transition-colors select-none disabled:opacity-50 disabled:pointer-events-none cursor-pointer shrink-0 ${variantStyles[variant]} ${iconSizeStyles[size]} ${className}`}
        {...props}
      >
        {isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : icon}
      </button>
    );
  }
);
IconButton.displayName = "IconButton";
