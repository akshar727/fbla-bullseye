"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ItemResponse } from "@/lib/types";
import {
  CATEGORY_KEYS,
  CATEGORY_MAP,
  getCategoryLabel,
} from "@/lib/categories";

const STATUS_COLORS: Record<string, string> = {
  unclaimed: "bg-red-100 text-red-700",
  found: "bg-green-100 text-green-700",
  claimed: "bg-blue-100 text-blue-700",
};

const CATEGORY_BADGE_COLORS: Record<string, string> = {
  electronics: "bg-blue-100 text-blue-700",
  clothing: "bg-pink-100 text-pink-700",
  bags: "bg-amber-100 text-amber-700",
  documents: "bg-emerald-100 text-emerald-700",
  personal: "bg-violet-100 text-violet-700",
};

export default function BrowsePage() {
  const router = useRouter();
  const [items, setItems] = useState<ItemResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");

  useEffect(() => {
    async function fetchItems() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/items");
        if (!res.ok) throw new Error("Failed to fetch items");
        const data: ItemResponse[] = await res.json();
        setItems(data);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    }
    fetchItems();
  }, []);

  const filtered = items.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.description?.toLowerCase().includes(search.toLowerCase()) ||
      item.last_location?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === "all" || item.category === category;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">Browse Found Items</h1>
      <p className="text-muted-foreground mb-6">
        Search through reported found items. Found something? Click an item to
        learn more.
      </p>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <Input
          placeholder="Search by name, description, or location…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1"
        />
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-full sm:w-56">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {CATEGORY_KEYS.map((key) => (
              <SelectItem key={key} value={key}>
                {CATEGORY_MAP[key]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {(search || category !== "all") && (
          <Button
            variant="outline"
            onClick={() => {
              setSearch("");
              setCategory("all");
            }}
          >
            Clear
          </Button>
        )}
      </div>

      {/* Results count */}
      {!loading && !error && (
        <p className="text-sm text-muted-foreground mb-4">
          {filtered.length} item{filtered.length !== 1 ? "s" : ""} found
        </p>
      )}

      {/* Error */}
      {error && (
        <div className="rounded-md bg-red-50 border border-red-200 text-red-700 px-4 py-3 mb-6">
          {error}
        </div>
      )}

      {/* Loading skeletons */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="h-40 w-full" />
              <CardContent className="pt-4 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-3 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && filtered.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-lg font-medium">No items match your search.</p>
          <p className="text-sm mt-1">Try adjusting your filters.</p>
        </div>
      )}

      {/* Item grid */}
      {!loading && !error && filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((item) => (
            <Card
              key={item.id}
              className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => router.push(`/item/${item.id}`)}
            >
              {/* Image or placeholder */}
              {item.image_urls && item.image_urls.length > 0 ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.image_urls[0]}
                  alt={item.name}
                  className="h-40 w-full object-cover"
                />
              ) : (
                <div className="h-40 w-full bg-muted flex items-center justify-center text-muted-foreground text-sm">
                  No image
                </div>
              )}

              <CardContent className="pt-4 bg-white space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <h2 className="font-semibold text-base leading-tight line-clamp-1">
                    {item.name}
                  </h2>
                  <div className="flex gap-1 shrink-0 flex-wrap justify-end">
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${STATUS_COLORS[item.status] ?? ""}`}
                    >
                      {item.status}
                    </span>
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full ${CATEGORY_BADGE_COLORS[item.category] ?? "bg-slate-100 text-slate-700"}`}
                    >
                      {getCategoryLabel(item.category)}
                    </span>
                  </div>
                </div>
                <div>
                  {item.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {item.description}
                    </p>
                  )}

                  {item.last_location && (
                    <p className="text-xs text-muted-foreground">
                      Last Location: {item.last_location}
                    </p>
                  )}

                  {item.date_lost && (
                    <p className="text-xs text-muted-foreground">
                      Found on{" "}
                      {new Date(item.date_lost).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  )}
                  {item.posted_by && (
                    <p className="text-xs text-muted-foreground">
                      Posted by {item.posted_by.name}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
