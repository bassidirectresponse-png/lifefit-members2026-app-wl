import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  active: boolean;
  className?: string;
}

export function StatusBadge({ active, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-tag text-[12px] font-semibold",
        active
          ? "bg-pink-primary/15 text-pink-primary"
          : "bg-bg-tertiary text-text-tertiary",
        className
      )}
    >
      <span
        className={cn(
          "w-1.5 h-1.5 rounded-full",
          active ? "bg-pink-primary" : "bg-text-tertiary"
        )}
      />
      {active ? "Actif" : "Inactif"}
    </span>
  );
}
