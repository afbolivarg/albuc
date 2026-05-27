import Link from "next/link";
import type { ReactNode } from "react";
import { AlbucLogo } from "@/components/albuc-logo";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type AuthSearchParams = {
  message?: string;
  error?: string;
};

type AuthFormProps = {
  title: string;
  description?: string;
  message?: string;
  messageVariant?: "muted" | "success";
  error?: string;
  action: (formData: FormData) => Promise<void>;
  submitLabel: string;
  children: ReactNode;
  footer?: ReactNode;
};

export function AuthForm({
  title,
  description,
  message,
  messageVariant = "muted",
  error,
  action,
  submitLabel,
  children,
  footer,
}: AuthFormProps) {
  const messageClassName =
    messageVariant === "success"
      ? "text-sm text-green-600 dark:text-green-400"
      : "text-sm text-muted-foreground";

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <Link href="/" className="w-fit" aria-label="Go to home">
          <AlbucLogo className="mb-6" iconClassName="w-8 h-8" />
        </Link>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
        {message && <p className={messageClassName}>{message}</p>}
        {error && <p className="text-sm text-destructive">{error}</p>}
      </CardHeader>
      <CardContent className="space-y-4">
        <form action={action} className="space-y-4">
          {children}
          <Button type="submit" className="w-full">
            {submitLabel}
          </Button>
        </form>
      </CardContent>
      {footer}
    </Card>
  );
}

type AuthFieldProps = {
  id: string;
  name: string;
  label: string;
  type?: string;
  autoComplete?: string;
  placeholder?: string;
  required?: boolean;
  minLength?: number;
  hint?: string;
  labelExtra?: ReactNode;
};

export function AuthField({
  id,
  name,
  label,
  type = "text",
  autoComplete,
  placeholder,
  required,
  minLength,
  hint,
  labelExtra,
}: AuthFieldProps) {
  return (
    <div className="space-y-2">
      {labelExtra ? (
        <div className="flex items-center justify-between gap-2">
          <Label htmlFor={id}>{label}</Label>
          {labelExtra}
        </div>
      ) : (
        <Label htmlFor={id}>{label}</Label>
      )}
      <Input
        id={id}
        name={name}
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required={required}
        minLength={minLength}
      />
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function AuthFooter({ children }: { children: ReactNode }) {
  return (
    <CardFooter className="justify-center border-t-0 px-6 pt-0">
      <div className="text-center text-sm text-muted-foreground">
        {children}
      </div>
    </CardFooter>
  );
}
