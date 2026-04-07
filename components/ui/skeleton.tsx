import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return <div className={cn("skeleton", className)} />;
}

export function CardSkeleton() {
  return (
    <div className="bg-bg-secondary rounded-card p-card-padding border border-border">
      <Skeleton className="w-full h-40 mb-4" />
      <Skeleton className="w-3/4 h-5 mb-2" />
      <Skeleton className="w-1/2 h-4" />
    </div>
  );
}

export function HeroSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="w-64 h-10" />
      <Skeleton className="w-96 h-5" />
      <div className="flex items-center gap-6 mt-6">
        <Skeleton className="w-[140px] h-[140px] rounded-full" />
        <div className="space-y-3">
          <Skeleton className="w-48 h-6" />
          <Skeleton className="w-32 h-4" />
        </div>
      </div>
    </div>
  );
}
