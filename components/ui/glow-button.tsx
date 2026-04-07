"use client";

import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const glowButtonVariants = cva(
  "inline-flex items-center justify-center font-body font-semibold transition-all duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-bg-primary disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary:
          "bg-pink-primary text-bg-primary hover:bg-pink-vibrant active:scale-[0.98] hover:scale-[1.02] btn-glow",
        secondary:
          "bg-bg-tertiary text-text-primary border border-border hover:border-pink-border hover:bg-bg-secondary active:scale-[0.98]",
        ghost:
          "text-text-secondary hover:text-pink-primary hover:bg-bg-tertiary active:scale-[0.98]",
        outline:
          "border border-pink-border text-pink-primary hover:bg-pink-primary/10 active:scale-[0.98]",
      },
      size: {
        sm: "h-9 px-4 text-[14px] rounded-[10px]",
        md: "h-11 px-6 text-[15px] rounded-button",
        lg: "h-13 px-8 text-body rounded-button",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

interface GlowButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof glowButtonVariants> {}

const GlowButton = forwardRef<HTMLButtonElement, GlowButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(glowButtonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
GlowButton.displayName = "GlowButton";

export { GlowButton, glowButtonVariants };
