import { Loader2 } from "lucide-react";
import type * as React from "react";
import { Button } from "@/components/ui/button";

type LoaderButtonProps = React.ComponentProps<typeof Button> & {
  loading?: boolean;
};

export function LoaderButton({
  loading = false,
  disabled,
  children,
  ...props
}: LoaderButtonProps) {
  return (
    <Button disabled={disabled || loading} aria-busy={loading} {...props}>
      {loading && <Loader2 className="animate-spin" aria-hidden />}
      {children}
    </Button>
  );
}
