"use client";

import { useId, useRef, type ChangeEvent } from "react";

import { cn } from "../cn";
import { Spinner } from "./spinner";

export const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
export const ACCEPTED_PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];

export type AvatarUploadProps = {
  /** Object URL or remote URL of the current photo. */
  previewUrl?: string | null;
  uploading?: boolean;
  /** 0 to 100. Only shown while uploading. */
  progress?: number;
  error?: string;
  onSelect: (file: File) => void;
  onRemove?: () => void;
  disabled?: boolean;
};

export function validatePhoto(file: File): string | null {
  if (!ACCEPTED_PHOTO_TYPES.includes(file.type)) {
    return "That file type isn't supported. Use a JPG, PNG or WebP.";
  }
  if (file.size > MAX_PHOTO_BYTES) {
    return "That image is over 5MB.";
  }
  return null;
}

export function AvatarUpload({
  previewUrl,
  uploading = false,
  progress = 0,
  error,
  onSelect,
  onRemove,
  disabled = false
}: AvatarUploadProps) {
  const id = useId();
  const input = useRef<HTMLInputElement | null>(null);

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) onSelect(file);
    // Allows re-picking the same file after an error
    event.target.value = "";
  }

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => input.current?.click()}
          disabled={disabled || uploading}
          aria-describedby={error ? `${id}-error` : undefined}
          className={cn(
            "relative flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-dashed transition-colors",
            previewUrl ? "border-solid border-line" : "border-line-strong hover:border-primary",
            error && "border-danger",
            (disabled || uploading) && "cursor-not-allowed"
          )}
        >
          {previewUrl ? (
            // Object URLs and Supabase URLs are both fine here; next/image would
            // need a remote pattern per environment for no benefit at this size.
            // eslint-disable-next-line @next/next/no-img-element
            <img src={previewUrl} alt="" className="size-full object-cover" />
          ) : (
            <svg viewBox="0 0 24 24" fill="none" className="size-7 text-ink-subtle">
              <path
                d="M4 8.5A2.5 2.5 0 0 1 6.5 6h1.2a1 1 0 0 0 .84-.46l.72-1.1A1 1 0 0 1 10.1 4h3.8a1 1 0 0 1 .84.44l.72 1.1a1 1 0 0 0 .84.46h1.2A2.5 2.5 0 0 1 20 8.5v8A2.5 2.5 0 0 1 17.5 19h-11A2.5 2.5 0 0 1 4 16.5v-8Z"
                stroke="currentColor"
                strokeWidth="1.6"
              />
              <circle cx="12" cy="12.5" r="3.2" stroke="currentColor" strokeWidth="1.6" />
            </svg>
          )}

          {uploading ? (
            <span className="absolute inset-0 flex items-center justify-center bg-ink/45 text-white">
              <Spinner className="size-6" />
            </span>
          ) : null}
        </button>

        <div className="flex min-w-0 flex-col gap-1">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => input.current?.click()}
              disabled={disabled || uploading}
              className="min-h-12 rounded-control border border-line-strong px-5 text-sm font-semibold transition-colors hover:bg-surface-sunken disabled:cursor-not-allowed disabled:opacity-60"
            >
              {previewUrl ? "Change photo" : "Add photo"}
            </button>
            {previewUrl && onRemove ? (
              <button
                type="button"
                onClick={onRemove}
                disabled={disabled || uploading}
                className="min-h-12 rounded-control px-4 text-sm font-semibold text-ink-muted transition-colors hover:text-danger disabled:cursor-not-allowed"
              >
                Remove
              </button>
            ) : null}
          </div>

          {uploading ? (
            <div className="flex flex-col gap-1">
              <span className="h-1 w-40 overflow-hidden rounded-full bg-line">
                <span
                  className="block h-full rounded-full bg-primary transition-[width]"
                  style={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }}
                />
              </span>
              <span className="text-label text-ink-subtle" aria-live="polite">
                Uploading {Math.round(progress)}%
              </span>
            </div>
          ) : (
            <span className="text-label text-ink-subtle">JPG, PNG or WebP, up to 5MB</span>
          )}
        </div>
      </div>

      <input
        ref={input}
        id={id}
        type="file"
        accept={ACCEPTED_PHOTO_TYPES.join(",")}
        onChange={handleChange}
        className="sr-only"
        tabIndex={-1}
      />

      <div className="min-h-[1.0625rem]">
        {error ? (
          <p id={`${id}-error`} className="text-label text-danger">
            {error}
          </p>
        ) : null}
      </div>
    </div>
  );
}
