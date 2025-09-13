import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface RatingStarsProps {
  rating: number;
  maxRating?: number;
  size?: "sm" | "md" | "lg";
  showValue?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: "h-3 w-3",
  md: "h-4 w-4",
  lg: "h-5 w-5",
};

export function RatingStars({ 
  rating, 
  maxRating = 5, 
  size = "md", 
  showValue = false,
  className 
}: RatingStarsProps) {
  const stars = Array.from({ length: maxRating }, (_, index) => {
    const starRating = index + 1;
    const isFilled = starRating <= rating;
    const isPartial = starRating - 0.5 <= rating && starRating > rating;
    
    return (
      <Star
        key={index}
        className={cn(
          sizeClasses[size],
          isFilled || isPartial 
            ? "fill-yellow-400 text-yellow-400" 
            : "text-gray-300"
        )}
      />
    );
  });

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <div className="flex items-center">
        {stars}
      </div>
      {showValue && (
        <span className="text-sm text-muted-foreground ml-1">
          ({rating.toFixed(1)})
        </span>
      )}
    </div>
  );
}