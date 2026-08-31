import Link from "next/link";
import { cn } from "@/lib/utils";

type ButtonProps = {
  children: React.ReactNode;
  href?: string;
  variant?: "primary" | "secondary" | "ghost" | "inverted" | "destructive";
  size?: "sm" | "base";
  type?: "button" | "submit";
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
};

const variantStyles: Record<string, string> = {
  primary:
    "border border-neutral-900 bg-neutral-900 text-white hover:bg-neutral-800",
  secondary:
    "border border-neutral-200 bg-white text-neutral-900 hover:bg-neutral-100",
  ghost:
    "border border-transparent bg-transparent text-neutral-600 shadow-none hover:bg-neutral-100",
  inverted:
    "border border-white bg-white text-neutral-950 hover:bg-neutral-200",
  destructive:
    "border border-red-600 bg-red-600 text-white hover:bg-red-700",
};

const sizeStyles: Record<string, string> = {
  sm: "h-8 px-3 text-sm",
  base: "h-9 px-4 text-sm",
};

export function Button({
  children,
  href,
  variant = "primary",
  size = "base",
  type = "button",
  disabled = false,
  onClick,
  className = "",
}: ButtonProps) {
  const classes = cn(
    "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50",
    variantStyles[variant],
    sizeStyles[size],
    className
  );

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} disabled={disabled} onClick={onClick} className={classes}>
      {children}
    </button>
  );
}
