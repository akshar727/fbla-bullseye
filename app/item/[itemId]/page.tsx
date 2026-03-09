"use client";

import { useMemo, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useUser } from "@/hooks/use-user";
import { getCategoryLabel } from "@/lib/categories";
import { Button } from "@/components/ui/button";
import { LoadingButton } from "@/components/ui/loading-button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ItemCard } from "@/components/item-card";
import type { ItemResponse } from "@/lib/types";
import Footer from "@/components/footer";

const STATUS_STYLES: Record<string, string> = {
  unclaimed: "bg-red-100 text-red-700 border-red-200",
  found: "bg-green-100 text-green-700 border-green-200",
  claimed: "bg-blue-100 text-blue-700 border-blue-200",
};

export default function ItemPage({
  params,
}: {
  params: Promise<{ itemId: string }>;
}) {
  const router = useRouter();
  const { user, u_loading } = useUser();

  const [item, setItem] = useState<ItemResponse | null>(null);
  const [itemId, setItemId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [inquiryOpen, setInquiryOpen] = useState(false);
  const [inquiryMessage, setInquiryMessage] = useState("");
  const [inquiryLoading, setInquiryLoading] = useState(false);
  const [relatedItems, setRelatedItems] = useState<ItemResponse[]>([]);

  useEffect(() => {
    params.then((p) => setItemId(p.itemId));
  }, [params]);

  useEffect(() => {
    if (!itemId) return;
    setLoading(true);
    fetch(`/api/item/${itemId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data?.error) {
          toast.error(data.error);
          return;
        }
        setItem(data);

        // Fetch related unclaimed items in the same category, excluding this one
        if (data?.category) {
          fetch(
            `/api/items?category=${encodeURIComponent(data.category)}&status=unclaimed`,
          )
            .then((r) => r.json())
            .then((all: ItemResponse[]) => {
              if (Array.isArray(all)) {
                setRelatedItems(
                  all.filter((i) => i.id !== data.id).slice(0, 5),
                );
              }
            })
            .catch(() => {});
        }
      })
      .catch(() => toast.error("Failed to load item."))
      .finally(() => setLoading(false));
  }, [itemId]);

  const isOwner = useMemo(() => {
    console.log("Checking ownership:", { user, item });
    return !!user && item?.posted_by?.id === user.id;
  }, [user, item?.posted_by]);

  const handleDelete = async () => {
    if (!itemId) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/item/${itemId}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) toast.error(data?.error ?? "Failed to delete item.");
      else {
        toast.success("Item deleted.");
        router.push("/dashboard");
      }
    } catch {
      toast.error("An unexpected error occurred.");
    } finally {
      setDeleteLoading(false);
    }
  };

  if (loading || u_loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Skeleton className="aspect-square w-full rounded-xl" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-2/3" />
            <Skeleton className="h-5 w-1/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="container mx-auto px-4 py-16 text-center text-muted-foreground">
        <p className="text-lg font-medium">Item not found.</p>
        <Button
          className="mt-4"
          variant="outline"
          onClick={() => router.push("/browse")}
        >
          Back to Browse
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Back */}
        <Button
          variant="ghost"
          className="mb-4 -ml-2"
          onClick={() => router.back()}
        >
          ← Back
        </Button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Image gallery */}
          <div className="space-y-2">
            {item.image_urls && item.image_urls.length > 0 ? (
              <>
                <img
                  src={item.image_urls[activeImage]}
                  alt={item.name}
                  className="w-full aspect-square object-cover rounded-xl border"
                />
                {item.image_urls.length > 1 && (
                  <div className="flex gap-2 flex-wrap">
                    {item.image_urls.map((url, i) => (
                      <button
                        key={i}
                        onClick={() => setActiveImage(i)}
                        className={`w-16 h-16 rounded-md border-2 overflow-hidden transition-all ${
                          i === activeImage
                            ? "border-primary"
                            : "border-transparent opacity-60 hover:opacity-100"
                        }`}
                      >
                        <img
                          src={url}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="w-full aspect-square rounded-xl border bg-muted flex items-center justify-center text-muted-foreground">
                No images
              </div>
            )}
          </div>

          {/* Details */}
          <div className="space-y-4">
            {item.spam_likeliness != null && item.spam_likeliness >= 0.6 && (
              <div className="rounded-md border border-orange-200 bg-orange-50 px-3 py-2 text-sm text-orange-800">
                <span className="font-semibold">Under Admin Review</span>
                {" - "}This listing is not visible to other users while
                it&apos;s being reviewed.
              </div>
            )}
            <div className="flex items-start gap-3 flex-wrap">
              <h1 className="text-2xl font-bold flex-1">{item.name}</h1>
              <span
                className={`text-xs font-medium px-2.5 py-1 rounded-full border capitalize ${STATUS_STYLES[item.status] ?? ""}`}
              >
                {item.status}
              </span>
            </div>

            <p className="text-sm text-muted-foreground">
              {getCategoryLabel(item.category)}
            </p>

            {item.description && (
              <p className="text-sm leading-relaxed">{item.description}</p>
            )}

            <div className="space-y-1 text-sm text-muted-foreground">
              {item.last_location && (
                <p>
                  Last Location:{" "}
                  <span className="text-foreground">{item.last_location}</span>
                </p>
              )}
              {item.date_lost && (
                <p>
                  Found on{" "}
                  <span className="text-foreground">
                    {new Date(item.date_lost).toLocaleDateString(undefined, {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </p>
              )}
              {item.date_returned && (
                <p>
                  Returned on{" "}
                  <span className="text-foreground">
                    {new Date(item.date_returned).toLocaleDateString(
                      undefined,
                      {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      },
                    )}
                  </span>
                </p>
              )}
              <p>
                Posted by:{" "}
                <span className="text-foreground">
                  {(item.posted_by as any)?.name ?? "someone"}
                </span>
              </p>
            </div>

            {/* Actions */}
            <div className="pt-2 space-y-2">
              {/* Visitor / non-owner: show Claim button */}
              {!isOwner && item.status === "unclaimed" && (
                <>
                  <Button
                    className="w-full"
                    disabled={!user}
                    onClick={() => router.push(`/claim/${item.id}`)}
                  >
                    Claim This Item
                  </Button>
                  <Button
                    className="w-full"
                    disabled={!user}
                    onClick={() => setInquiryOpen(true)}
                  >
                    Inquire for Information
                  </Button>
                  {!user && (
                    <p className="text-xs text-center text-muted-foreground">
                      <button
                        className="underline underline-offset-4 text-foreground"
                        onClick={() =>
                          router.push(
                            `/login?next=${encodeURIComponent(`/item/${itemId}`)}`,
                          )
                        }
                      >
                        Sign in
                      </button>{" "}
                      to claim or inquire about this item.
                    </p>
                  )}
                </>
              )}

              {/* Owner actions */}
              {isOwner && (
                <div className="space-y-2">
                  <Button
                    className="w-full"
                    variant="outline"
                    onClick={() => router.push("/dashboard")}
                  >
                    Manage Claims
                  </Button>
                  <LoadingButton
                    className="w-full"
                    variant="destructive"
                    loading={deleteLoading}
                    onClick={handleDelete}
                  >
                    Delete Listing
                  </LoadingButton>
                </div>
              )}
            </div>
          </div>
        </div>
        {/* Item Inquiry dialog */}
        <Dialog
          open={inquiryOpen}
          onOpenChange={(open) => {
            setInquiryOpen(open);
            if (!open) setInquiryMessage("");
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Item Inquiry Request</DialogTitle>
              <DialogDescription>
                Ask any questions that would help you determine whether this is
                your item — for example, details about distinguishing features,
                contents, or where exactly it was found.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-2">
              <Label htmlFor="inquiry-message">Your message</Label>
              <Textarea
                id="inquiry-message"
                placeholder="e.g. Does the bag have a small keychain attached? Was anything inside it when found?"
                className="min-h-[120px]"
                value={inquiryMessage}
                onChange={(e) => setInquiryMessage(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Your message will be sent to the person who posted this item.
              </p>
            </div>
            <DialogFooter className="gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setInquiryOpen(false);
                  setInquiryMessage("");
                }}
              >
                Cancel
              </Button>
              <LoadingButton
                loading={inquiryLoading}
                disabled={!inquiryMessage.trim()}
                onClick={async () => {
                  if (!itemId) return;
                  setInquiryLoading(true);
                  try {
                    const res = await fetch("/api/inquiry", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        inquiry_text: inquiryMessage,
                        inquired_item: itemId,
                      }),
                    });
                    const data = await res.json();
                    if (!res.ok) {
                      toast.error(data?.error ?? "Failed to send inquiry.");
                    } else {
                      toast.success("Inquiry sent!");
                      setInquiryOpen(false);
                      setInquiryMessage("");
                    }
                  } catch {
                    toast.error("An unexpected error occurred.");
                  } finally {
                    setInquiryLoading(false);
                  }
                }}
              >
                Submit
              </LoadingButton>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      {/* Related Items */}
      {relatedItems.length > 0 && (
        <div className="container mx-auto px-4 py-10 max-w-4xl">
          <h2 className="text-lg font-semibold mb-4">Other Lost Items</h2>
          <Carousel opts={{ align: "start", loop: false }} className="w-full">
            <CarouselContent className="-ml-3">
              {relatedItems.map((related) => (
                <CarouselItem
                  key={related.id}
                  className="pl-3 basis-full sm:basis-1/2"
                >
                  <ItemCard
                    name={related.name}
                    status={related.status}
                    category={related.category}
                    description={related.description}
                    location={related.last_location}
                    foundDate={related.date_lost}
                    returnDate={(related as any).date_returned ?? null}
                    postedBy={(related.posted_by as any)?.name}
                    imageUrl={related.image_urls?.[0] ?? null}
                    onClick={() => router.push(`/item/${related.id}`)}
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-0 -translate-x-1/2" />
            <CarouselNext className="right-0 translate-x-1/2" />
          </Carousel>
        </div>
      )}
      <Footer />
    </>
  );
}
