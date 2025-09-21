// src/components/admin/StatusBadge.tsx
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import * as React from "react";

type BadgeVariant = React.ComponentProps<typeof Badge>["variant"];

interface StatusBadgeProps {
  status: string;
  variant?: BadgeVariant;
  className?: string;
}

const statusVariants = {
  // Order statuses
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  confirmed: "bg-green-100 text-green-800 border-green-200",
  cancelled: "bg-red-100 text-red-800 border-red-200",

  // Product statuses
  featured: "bg-blue-100 text-blue-800 border-blue-200",
  new: "bg-purple-100 text-purple-800 border-purple-200",
  limited: "bg-orange-100 text-orange-800 border-orange-200",

  // Contact statuses
  handled: "bg-green-100 text-green-800 border-green-200",

  // Stock statuses
  "in-stock": "bg-green-100 text-green-800 border-green-200",
  "out-of-stock": "bg-red-100 text-red-800 border-red-200",

  // Defaults
  active: "bg-green-100 text-green-800 border-green-200",
  inactive: "bg-gray-100 text-gray-800 border-gray-200",
} as const;

export function StatusBadge({
  status,
  variant = "outline",
  className,
}: StatusBadgeProps) {
  const normalized = React.useMemo(
    () => status.toLowerCase().trim().replace(/\s+/g, "-"),
    [status]
  );

  const statusClass =
    statusVariants[normalized as keyof typeof statusVariants] ??
    statusVariants.inactive;

  return (
    <Badge
      variant={variant}
      className={cn("text-xs font-medium border", statusClass, className)}
      title={status}
      aria-label={status}
    >
      {status}
    </Badge>
  );
}

export default StatusBadge;
