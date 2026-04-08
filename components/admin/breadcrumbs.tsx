"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface Crumb {
  label: string;
  href?: string;
}

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav className="flex items-center gap-1.5 text-[13px] text-text-tertiary mb-6 flex-wrap">
      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        return (
          <span key={i} className="flex items-center gap-1.5">
            {i > 0 && <ChevronRight className="w-3.5 h-3.5" />}
            {item.href && !isLast ? (
              <Link
                href={item.href}
                className="hover:text-text-secondary transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              <span className={isLast ? "text-text-secondary" : ""}>
                {item.label}
              </span>
            )}
          </span>
        );
      })}
    </nav>
  );
}
