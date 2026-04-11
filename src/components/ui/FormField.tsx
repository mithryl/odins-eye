"use client";

import { ReactNode } from "react";

export function Label({
  children,
  htmlFor,
  optional,
}: {
  children: ReactNode;
  htmlFor?: string;
  optional?: boolean;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="block text-sm font-medium text-text-primary mb-1.5"
    >
      {children}
      {optional && (
        <span className="ml-2 text-xs text-text-muted font-normal">
          optional
        </span>
      )}
    </label>
  );
}

export function TextInput({
  id,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <input
      id={id}
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded-lg border border-border bg-bg-input px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:border-border-focus focus:ring-1 focus:ring-border-focus focus:outline-none transition-colors"
    />
  );
}

export function TextArea({
  id,
  value,
  onChange,
  placeholder,
  rows = 3,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <textarea
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full rounded-lg border border-border bg-bg-input px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:border-border-focus focus:ring-1 focus:ring-border-focus focus:outline-none transition-colors resize-none"
    />
  );
}

export function RadioGroup({
  id,
  value,
  onChange,
  options,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={`rounded-lg border px-4 py-2.5 text-sm transition-all cursor-pointer ${
            value === option.value
              ? "border-gold bg-gold-muted text-gold"
              : "border-border bg-bg-input text-text-secondary hover:border-text-muted hover:text-text-primary"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

export function ScaleInput({
  id,
  value,
  onChange,
  leftLabel,
  rightLabel,
  steps = 5,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  leftLabel: string;
  rightLabel: string;
  steps?: number;
}) {
  return (
    <div>
      <div className="flex gap-2 justify-center mb-2">
        {Array.from({ length: steps }, (_, i) => {
          const val = String(i + 1);
          return (
            <button
              key={val}
              type="button"
              onClick={() => onChange(val)}
              className={`w-10 h-10 rounded-full border text-sm font-medium transition-all cursor-pointer ${
                value === val
                  ? "border-gold bg-gold text-bg-deep"
                  : "border-border bg-bg-input text-text-secondary hover:border-text-muted"
              }`}
            >
              {val}
            </button>
          );
        })}
      </div>
      <div className="flex justify-between text-xs text-text-muted px-1">
        <span>{leftLabel}</span>
        <span>{rightLabel}</span>
      </div>
    </div>
  );
}

export function FieldGroup({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`space-y-2 ${className}`}>{children}</div>;
}

export function Hint({ children }: { children: ReactNode }) {
  return <p className="text-xs text-text-muted mt-1">{children}</p>;
}
