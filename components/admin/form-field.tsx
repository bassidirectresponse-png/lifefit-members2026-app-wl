"use client";

import { cn } from "@/lib/utils";

const inputBase =
  "w-full h-10 px-3 rounded-[10px] bg-bg-tertiary border border-border text-text-primary text-[15px] outline-none focus:border-pink-primary focus:ring-1 focus:ring-pink-primary/30 transition-all placeholder:text-text-tertiary";

interface FormFieldProps {
  label: string;
  error?: string;
  children?: React.ReactNode;
  className?: string;
}

export function FormField({ label, error, children, className }: FormFieldProps) {
  return (
    <div className={className}>
      <label className="block text-[14px] text-text-secondary mb-1.5 font-medium">
        {label}
      </label>
      {children}
      {error && (
        <p className="text-[12px] text-pink-primary mt-1">{error}</p>
      )}
    </div>
  );
}

export function Input({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(inputBase, className)} {...props} />;
}

export function Textarea({
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        inputBase,
        "h-auto py-2.5 resize-none",
        className
      )}
      {...props}
    />
  );
}

export function Select({
  className,
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={cn(inputBase, "cursor-pointer", className)} {...props}>
      {children}
    </select>
  );
}
