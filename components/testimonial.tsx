import { Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export interface TestimonialProps {
  name: string;
  rating: number;
  quote: string;
  avatarUrl?: string;
}

export function Testimonial({
  name,
  rating,
  quote,
  avatarUrl,
}: TestimonialProps) {
  const clampedRating = Math.min(5, Math.max(0, Math.round(rating)));

  return (
    <Card className="flex flex-col gap-4 p-6 bg-white shadow-sm h-full">
      <CardContent className="p-0 flex flex-col gap-4">
        {/* Stars */}
        <div className="flex items-center gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`size-4 ${
                i < clampedRating
                  ? "fill-primary text-primary"
                  : "fill-muted text-muted"
              }`}
            />
          ))}
        </div>

        {/* Quote */}
        <p className="text-sm text-muted-foreground leading-relaxed">
          &ldquo;{quote}&rdquo;
        </p>

        {/* Author */}
        <div className="flex items-center gap-3 mt-auto pt-2 border-t">
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={avatarUrl}
              alt={name}
              className="size-9 rounded-full object-cover border"
            />
          ) : (
            <div className="size-9 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold shrink-0">
              {name.charAt(0).toUpperCase()}
            </div>
          )}
          <span className="font-semibold text-sm">{name}</span>
        </div>
      </CardContent>
    </Card>
  );
}
