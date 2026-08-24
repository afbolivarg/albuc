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
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useActionMessage, useLocale, useT } from "@/lib/i18n/client";

type AuthFormProps = {
  title: string;
  description?: string;
  action: (prevState: SignInState, formData: FormData) => Promise<SignInState>;
  submitLabel: string;
  children: ReactNode;
  footer?: ReactNode;
  initialError?: string;
};

function AuthFormMessage({
  variant,
  children,
  id,
}: {
  variant: "success" | "error";
  children: ReactNode;
  id?: string;
}) {
  const dotClassName =
    variant === "success" ? "bg-green-600 dark:bg-green-400" : "bg-destructive";

  return (
    <p id={id} className="flex items-center gap-2 text-sm">
      <span
        aria-hidden
        className={`size-2 shrink-0 rounded-full ${dotClassName}`}
      />
      {children}
    </p>
  );
}

export function AuthForm({
  title,
  description,
  action,
  submitLabel,
  children,
  footer,
  initialError,
}: AuthFormProps) {
  const [state, formAction] = useActionState(action, {});
  const locale = useLocale();
  const message = useActionMessage();
  const shownError = message(state.error ?? initialError);
  const shownMessage = message(state.message);

  return (
    <Card className="w-full">
      <CardHeader>
        <Link href="/" className="w-fit" aria-label="Albuc">
          <AlbucLogo className="mb-6" iconClassName="w-8 h-8" />
        </Link>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="space-y-4">
        <form action={formAction} className="space-y-4">
          <input name="locale" type="hidden" value={locale} />
          {children}
          <AuthSubmitButton>{submitLabel}</AuthSubmitButton>
          {shownMessage && (
            <AuthFormMessage variant="success">{shownMessage}</AuthFormMessage>
          )}
          {shownError && (
            <AuthFormMessage variant="error">{shownError}</AuthFormMessage>
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
  const t = useT();
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

    const isValid = z.email().safeParse(value).success;
    setFieldError(isValid ? null : t("auth.invalidEmail"));
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
        <AuthFormMessage variant="error" id={errorId}>
          {fieldError}
        </AuthFormMessage>
      )}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
