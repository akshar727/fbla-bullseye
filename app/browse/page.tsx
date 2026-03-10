"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/use-user"; // Custom hook that returns the currently logged-in Supabase user
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton"; // Animated placeholder shown while data is loading
import { ItemCard } from "@/components/item-card"; // Reusable card component for displaying a single item
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ItemResponse } from "@/lib/types"; // TypeScript type for an item returned by the API
import { CATEGORY_KEYS, CATEGORY_MAP } from "@/lib/categories"; // Category keys their readable labels
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Footer from "@/components/footer";

export default function BrowsePage() {
  const router = useRouter();
  const { user } = useUser(); // Used to determine if an "Under Admin Review" banner should show

  // All items fetched from the API — unfiltered
  const [items, setItems] = useState<ItemResponse[]>([]);

  // UI state flags
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Controlled values for the three filter inputs
  const [search, setSearch] = useState("");         // Free-text search string
  const [category, setCategory] = useState("all");  // Selected category key, or "all"
  const [statusTab, setStatusTab] = useState("unclaimed"); // Active status tab

  // Fetch all items once on mount — filtering is done client-side
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

  // Get the visible items by applying all three filters simultaneously.
  const filtered = items.filter((item) => {
    // Text search matches against name, description, and last known location
    const matchesSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.description?.toLowerCase().includes(search.toLowerCase()) ||
      item.last_location?.toLowerCase().includes(search.toLowerCase());

    // Category filter "all" bypasses this check
    const matchesCategory = category === "all" || item.category === category;
    const matchesStatus = item.status === statusTab;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <>
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-2">Browse Found Items</h1>
        <p className="text-muted-foreground mb-6">
          Search through reported found items. Found something? Click an item to
          learn more.
        </p>

        {/* Status tabs */}
        <Tabs value={statusTab} onValueChange={setStatusTab} className="mb-6">
          <TabsList className="w-full">
            <TabsTrigger value="unclaimed">Unclaimed</TabsTrigger>
            <TabsTrigger value="claimed">Claimed</TabsTrigger>
            <TabsTrigger value="found">Found</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Filter bar — search input, category dropdown, and optional clear button */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <Input
            placeholder="Search by name, description, or location…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1"
          />

          {/* Category dropdown — populated from the shared CATEGORY_KEYS/CATEGORY_MAP constants */}
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
          {/* Clear button thats only visible when filters applied */}
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

        {/* Results count shown once data has loaded without errors */}
        {!loading && !error && (
          <p className="text-sm text-muted-foreground mb-4">
            {filtered.length} item{filtered.length !== 1 ? "s" : ""} found
          </p>
        )}

        {/* Error banner: displayed when the API request fails */}
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

        {/* Empty state which is shown when filters produce no results */}
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
                foundDate={item.date_lost}
                returnDate={item.date_returned}
                postedBy={item.posted_by?.name}
                imageUrl={item.image_urls?.[0]} // show only the first image
                underAdminReview={
                  !!user &&
                  item.spam_likeliness != null &&
                  item.spam_likeliness >= 0.6
                } // only show under admin review if the spam_likeliness is >= 0.6.
                onClick={() => router.push(`/item/${item.id}`)} // Navigate to the item detail page on click
              />
            ))}
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}
