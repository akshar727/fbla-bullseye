import { Card, CardContent } from "@/components/ui/card";
import { getCategoryLabel } from "@/lib/categories";
import {
  STATUS_ICONS,
  CATEGORY_ICONS,
  STATUS_COLORS,
  CATEGORY_BADGE_COLORS,
} from "@/lib/status-category-icons";

export interface ItemCardProps {
  name: string;
  status: string;
  category: string;
  description?: string | null;
  location?: string | null;
  foundDate?: string | null;
  returnDate?: string | null;
  postedBy?: string | null;
  imageUrl?: string | null;
  onClick?: () => void;
  className?: string;
  underAdminReview?: boolean;
  showNoImageText?: boolean;
}

export function ItemCard({
  name,
  status,
  category,
  description,
  location,
  foundDate,
  returnDate,
  postedBy,
  imageUrl,
  onClick,
  className = "",
  underAdminReview = false,
  showNoImageText = true,
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
            {showNoImageText ? "No image" : null}
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
              className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize inline-flex items-center gap-1 ${STATUS_COLORS[status] ?? "bg-slate-100 text-slate-700"}`}
            >
              {STATUS_ICONS[status] &&
                (() => {
                  const Icon = STATUS_ICONS[status];
                  return <Icon className="size-3" />;
                })()}
              {status}
            </span>
            <span
              className={`text-xs font-medium px-2 py-0.5 rounded-full inline-flex items-center gap-1 ${CATEGORY_BADGE_COLORS[category] ?? "bg-slate-100 text-slate-700"}`}
            >
              {CATEGORY_ICONS[category] &&
                (() => {
                  const Icon = CATEGORY_ICONS[category];
                  return <Icon className="size-3" />;
                })()}
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

          {status === "found"
            ? returnDate && (
                <p className="text-xs text-muted-foreground">
                  Returned on{" "}
                  {new Date(returnDate).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              )
            : foundDate && (
                <p className="text-xs text-muted-foreground">
                  Found on{" "}
                  {new Date(foundDate).toLocaleDateString(undefined, {
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
