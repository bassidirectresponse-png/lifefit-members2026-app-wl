"use client";

import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface NetflixRowProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}

export function NetflixRow({
  title,
  subtitle,
  children,
  className,
}: NetflixRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  };

  const scroll = (direction: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const scrollAmount = el.clientWidth * 0.75;
    el.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  return (
    <section className={cn("relative group/row", className)}>
      {/* Header */}
      <div className="flex items-end justify-between mb-4 px-1">
        <div>
          <h2 className="font-display text-h3 text-text-primary">{title}</h2>
          {subtitle && (
            <p className="text-body-sm text-text-secondary mt-0.5">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Scroll container */}
      <div className="relative">
        {/* Left arrow */}
        {canScrollLeft && (
          <button
            onClick={() => scroll("left")}
            className="absolute left-0 top-0 bottom-0 z-10 w-12 bg-gradient-to-r from-bg-primary/90 to-transparent flex items-center justify-start pl-1 opacity-0 group-hover/row:opacity-100 transition-opacity duration-300"
            aria-label="Scroll left"
          >
            <div className="w-9 h-9 rounded-full bg-bg-secondary/90 border border-border flex items-center justify-center hover:border-pink-border transition-colors">
              <ChevronLeft className="w-5 h-5 text-text-primary" />
            </div>
          </button>
        )}

        {/* Right arrow */}
        {canScrollRight && (
          <button
            onClick={() => scroll("right")}
            className="absolute right-0 top-0 bottom-0 z-10 w-12 bg-gradient-to-l from-bg-primary/90 to-transparent flex items-center justify-end pr-1 opacity-0 group-hover/row:opacity-100 transition-opacity duration-300"
            aria-label="Scroll right"
          >
            <div className="w-9 h-9 rounded-full bg-bg-secondary/90 border border-border flex items-center justify-center hover:border-pink-border transition-colors">
              <ChevronRight className="w-5 h-5 text-text-primary" />
            </div>
          </button>
        )}

        {/* Scrollable row */}
        <div
          ref={scrollRef}
          onScroll={checkScroll}
          className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 snap-x snap-mandatory"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            WebkitOverflowScrolling: "touch",
          }}
        >
          {children}
        </div>
      </div>
    </section>
  );
}

export function NetflixCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "shrink-0 snap-start w-[280px] md:w-[320px]",
        className
      )}
    >
      {children}
    </div>
  );
}
