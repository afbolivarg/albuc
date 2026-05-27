"use client";

import Link from "next/link";
import {
  type FocusEvent,
  type ReactNode,
  useActionState,
  useState,
} from "react";
import { useFormStatus } from "react-dom";
import { z } from "zod";
import type { SignInState } from "@/app/(auth)/actions";
import { AlbucLogo } from "@/components/albuc-logo";
import { LoaderButton } from "@/components/loader-button";
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

type AuthFormProps = {
  title: string;
  description?: string;
  action: (prevState: SignInState, formData: FormData) => Promise<SignInState>;
  submitLabel: string;
  children: ReactNode;
  footer?: ReactNode;
};

export function AuthForm({
  title,
  description,
  action,
  submitLabel,
  children,
  footer,
}: AuthFormProps) {
  const [state, formAction] = useActionState(action, {});
  const messageClassName = state.message
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
      </CardHeader>
      <CardContent className="space-y-4">
        <form action={formAction} className="space-y-4">
          {children}
          <AuthSubmitButton>{submitLabel}</AuthSubmitButton>
          {state.message && <p className={messageClassName}>{state.message}</p>}
          {state.error && (
            <p className="text-sm text-destructive">{state.error}</p>
          )}
        </form>
      </CardContent>
      {footer}
    </Card>
  );
}

function AuthSubmitButton({ children }: { children: ReactNode }) {
  const { pending } = useFormStatus();

  return (
    <LoaderButton type="submit" loading={pending} className="w-full">
      {children}
    </LoaderButton>
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
  validateEmailOnBlur?: boolean;
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
  validateEmailOnBlur,
}: AuthFieldProps) {
  const [fieldError, setFieldError] = useState<string | null>(null);
  const errorId = `${id}-error`;

  function handleBlur(event: FocusEvent<HTMLInputElement>) {
    if (!validateEmailOnBlur) {
      return;
    }

    const value = event.target.value.trim();
    if (!value) {
      setFieldError(null);
      return;
    }

    const isValid = z.string().email().safeParse(value).success;
    setFieldError(isValid ? null : "Enter a valid email address.");
  }

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
        onBlur={handleBlur}
        aria-invalid={fieldError ? true : undefined}
        aria-describedby={fieldError ? errorId : undefined}
      />
      {fieldError && (
        <p id={errorId} className="text-sm text-destructive">
          {fieldError}
        </p>
      )}
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
