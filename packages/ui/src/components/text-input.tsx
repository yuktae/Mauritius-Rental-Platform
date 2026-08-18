"use client";

import { useId, type ComponentPropsWithRef } from "react";

import { cn } from "../cn";
import { Field, controlClass, controlBorder, describedBy } from "./field";

// ComponentPropsWithRef rather than InputHTMLAttributes so `ref` is part of
// the props and reaches the input through the spread. Forms need it to move
// focus to the field that failed.
export type TextInputProps = Omit<ComponentPropsWithRef<"input">, "id"> & {
  label: string;
  hint?: string;
  error?: string;
  id?: string;
  hideLabel?: boolean;
  fieldClassName?: string;
};

export function TextInput({
  label,
  hint,
  error,
  id,
  hideLabel,
  required,
  className,
  fieldClassName,
  ...props
}: TextInputProps) {
  const generated = useId();
  const inputId = id ?? generated;
  const hasError = Boolean(error);

  return (
    <Field
      id={inputId}
      label={label}
      hint={hint}
      error={error}
      required={required}
      hideLabel={hideLabel}
      className={fieldClassName}
    >
      <input
        {...props}
        id={inputId}
        required={required}
        aria-invalid={hasError || undefined}
        aria-describedby={describedBy(inputId, hasError, Boolean(hint))}
        className={cn(controlClass, controlBorder(hasError), className)}
      />
    </Field>
  );
}
