import { cva } from "class-variance-authority";

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/15 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "border border-transparent bg-button-primary text-button-primary-foreground shadow-[0_12px_30px_rgba(15,23,42,0.14)] hover:bg-button-primary-hover hover:translate-y-[-1px] hover:shadow-[0_16px_34px_rgba(15,23,42,0.18)]",
        destructive:
          "border border-transparent bg-gradient-to-b from-danger to-[#b91c1c] text-white shadow-[0_12px_30px_rgba(239,68,68,0.18)] hover:translate-y-[-1px]",
        outline:
          "border border-border bg-card text-text hover:border-primary/40 hover:bg-bg-subtle hover:text-text shadow-[0_10px_24px_rgba(15,23,42,0.08)]",
        secondary:
          "border border-border bg-bg-subtle text-text hover:border-primary/30 hover:bg-surface-container-high/60",
        ghost:
          "text-text-muted hover:bg-bg-subtle hover:text-text",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-4 py-2.5",
        sm: "h-9 rounded-lg px-3",
        lg: "h-12 rounded-xl px-5",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);
