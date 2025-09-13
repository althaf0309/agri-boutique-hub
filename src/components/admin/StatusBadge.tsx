import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
  variant?: "default" | "secondary" | "destructive" | "outline";
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
  
  // Default
  active: "bg-green-100 text-green-800 border-green-200",
  inactive: "bg-gray-100 text-gray-800 border-gray-200",
};

export function StatusBadge({ status, variant = "outline", className }: StatusBadgeProps) {
  const normalizedStatus = status.toLowerCase().replace(/\s+/g, "-");
  const statusClass = statusVariants[normalizedStatus as keyof typeof statusVariants] || statusVariants.inactive;
  
  return (
    <Badge 
      variant={variant}
      className={cn(
        "text-xs font-medium border",
        statusClass,
        className
      )}
    >
      {status}
    </Badge>
  );
}