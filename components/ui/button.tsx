import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva("inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50", {
  variants: {
    variant: {
      primary: "bg-ink text-white shadow-sm hover:bg-ink/90",
      secondary: "border border-line bg-surface text-ink hover:bg-muted",
      ghost: "text-muted-ink hover:bg-muted hover:text-ink",
      subtle: "bg-brand-soft text-brand-ink hover:bg-brand-soft/70",
      danger: "bg-red-600 text-white hover:bg-red-700",
    },
    size: {
      default: "h-11 px-4",
      sm: "h-9 rounded-lg px-3 text-xs",
      icon: "size-10",
    },
  },
  defaultVariants: { variant: "primary", size: "default" },
});

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonVariants> & { asChild?: boolean };

export function Button({ className, variant, size, asChild = false, ...props }: ButtonProps) {
  const Component = asChild ? Slot : "button";
  return <Component className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
