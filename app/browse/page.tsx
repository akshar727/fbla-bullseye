"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ItemCard } from "@/components/item-card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ItemResponse } from "@/lib/types";
import { CATEGORY_KEYS, CATEGORY_MAP } from "@/lib/categories";

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
            <ItemCard
              key={item.id}
              name={item.name}
              status={item.status}
              category={item.category}
              description={item.description}
              location={item.last_location}
              date={item.date_lost}
              postedBy={item.posted_by?.name}
              imageUrl={item.image_urls?.[0]}
              onClick={() => router.push(`/item/${item.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
