import { Card, CardContent } from "@/components/ui/card";
import { getCategoryLabel } from "@/lib/categories";

const STATUS_COLORS: Record<string, string> = {
  unclaimed: "bg-red-100 text-red-700",
  found: "bg-green-100 text-green-700",
  claimed: "bg-blue-100 text-blue-700",
  lost: "bg-orange-100 text-orange-700",
};

const CATEGORY_BADGE_COLORS: Record<string, string> = {
  electronics: "bg-blue-100 text-blue-700",
  clothing: "bg-pink-100 text-pink-700",
  bags: "bg-amber-100 text-amber-700",
  documents: "bg-emerald-100 text-emerald-700",
  personal: "bg-violet-100 text-violet-700",
};

export interface ItemCardProps {
  name: string;
  status: string;
  category: string;
  description?: string | null;
  location?: string | null;
  date?: string | null;
  postedBy?: string | null;
  imageUrl?: string | null;
  onClick?: () => void;
  className?: string;
  underAdminReview?: boolean;
}

export function ItemCard({
  name,
  status,
  category,
  description,
  location,
  date,
  postedBy,
  imageUrl,
  onClick,
  className = "",
  underAdminReview = false,
}: ItemCardProps) {
  return (
    <Card
      className={`overflow-hidden cursor-pointer hover:shadow-md transition-shadow ${className}`}
      onClick={onClick}
    >
      <div>
        {/* Image or placeholder */}
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl} alt={name} className="h-40 w-full object-cover" />
        ) : (
          <div className="h-40 w-full bg-muted flex items-center justify-center text-muted-foreground text-sm">
            No image
          </div>
        )}

        {underAdminReview && (
          <div className="bg-orange-50 border-b border-orange-200 px-3 py-1.5 text-xs font-medium text-orange-800">
            Under Admin Review
          </div>
        )}
      </div>

      <CardContent className="pt-4 bg-white space-y-2">
        <div className="flex items-start flex-col justify-between gap-2">
          <h2 className="font-semibold text-base leading-tight line-clamp-1">
            {name}
          </h2>
          <div className="flex flex-row gap-1 shrink-0">
            <span
              className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${STATUS_COLORS[status] ?? "bg-slate-100 text-slate-700"}`}
            >
              {status}
            </span>
            <span
              className={`text-xs font-medium px-2 py-0.5 rounded-full ${CATEGORY_BADGE_COLORS[category] ?? "bg-slate-100 text-slate-700"}`}
            >
              {getCategoryLabel(category)}
            </span>
          </div>
        </div>
        <div>
          {description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {description}
            </p>
          )}

          {location && (
            <p className="text-xs text-muted-foreground">
              Last Location: {location}
            </p>
          )}

          {date && (
            <p className="text-xs text-muted-foreground">
              Found on{" "}
              {new Date(date).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          )}

          {postedBy && (
            <p className="text-xs text-muted-foreground">
              Posted by {postedBy}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
