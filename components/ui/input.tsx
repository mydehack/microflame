import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn("h-11 w-full rounded-xl border border-line bg-surface px-3.5 text-sm text-ink shadow-sm outline-none transition placeholder:text-faint focus:border-brand focus:ring-4 focus:ring-brand/10", className)} {...props} />;
}
export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn("min-h-28 w-full resize-y rounded-xl border border-line bg-surface px-3.5 py-3 text-sm text-ink shadow-sm outline-none transition placeholder:text-faint focus:border-brand focus:ring-4 focus:ring-brand/10", className)} {...props} />;
}
