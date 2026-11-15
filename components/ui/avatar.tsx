import { cn, initials } from "@/lib/utils";

export function Avatar({ name, image, size = "md", className }: { name: string; image?: string | null; size?: "sm" | "md" | "lg"; className?: string }) {
  const imageUrl = image ? image.startsWith("http") ? image : "/api/media/avatar?path=" + encodeURIComponent(image) : null;
  return <span className={cn("avatar", `avatar-${size}`, className)} aria-label={name}>
    {imageUrl ? <img src={imageUrl} alt="" /> : initials(name)}
  </span>;
}
