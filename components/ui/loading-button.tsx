import * as React from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { buttonVariants } from "@/components/ui/button";
import { VariantProps } from "class-variance-authority";

interface LoadingButtonProps extends React.ComponentProps<"button">,
  VariantProps<typeof buttonVariants> {
  loading?: boolean;
  asChild?: boolean;
}

export function LoadingButton({
  loading,
  disabled,
  children,
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: LoadingButtonProps) {
  return (
    <Button disabled={loading || disabled} className={className} variant={variant} size={size} asChild={asChild} {...props}>
      {loading && <Loader2 className="animate-spin" />}
      {children}
    </Button>
  );
}
