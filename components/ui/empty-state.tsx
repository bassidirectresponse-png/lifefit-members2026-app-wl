import { cn } from "@/lib/utils";

interface EmptyStateProps {
  title: string;
  description: string;
  className?: string;
}

export function EmptyState({ title, description, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-16 px-8 text-center",
        className
      )}
    >
      {/* SVG decorativo em traço pink */}
      <svg
        width="120"
        height="120"
        viewBox="0 0 120 120"
        fill="none"
        className="mb-6 opacity-60"
        aria-hidden="true"
      >
        <circle
          cx="60"
          cy="60"
          r="50"
          stroke="#EC4899"
          strokeWidth="1.5"
          strokeDasharray="4 6"
        />
        <path
          d="M60 30C43.4 30 30 43.4 30 60s13.4 30 30 30 30-13.4 30-30"
          stroke="#F472B6"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <circle cx="60" cy="60" r="8" stroke="#EC4899" strokeWidth="1.5" />
        <path
          d="M52 52l16 16M68 52L52 68"
          stroke="#EC4899"
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.5"
        />
      </svg>
      <h3 className="font-display text-h4 text-text-primary mb-2">{title}</h3>
      <p className="text-body-sm text-text-secondary max-w-sm">{description}</p>
    </div>
  );
}
