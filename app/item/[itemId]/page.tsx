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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import type { ItemResponse } from "@/lib/types";

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
  const [markFoundLoading, setMarkFoundLoading] = useState(false);
  const [confirmMarkFound, setConfirmMarkFound] = useState(false);
  const [inquiryOpen, setInquiryOpen] = useState(false);
  const [inquiryMessage, setInquiryMessage] = useState("");
  const [inquiryLoading, setInquiryLoading] = useState(false);

  useEffect(() => {
    params.then((p) => setItemId(p.itemId));
  }, [params]);

  useEffect(() => {
    if (!itemId) return;
    setLoading(true);
    fetch(`/api/item/${itemId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data?.error) toast.error(data.error);
        else setItem(data);
      })
      .catch(() => toast.error("Failed to load item."))
      .finally(() => setLoading(false));
  }, [itemId]);

  const isOwner = useMemo(() => {
    console.log("Checking ownership:", { user, item });
    return !!user && item?.posted_by?.id === user.id;
  }, [user, item?.posted_by]);

  const handleMarkFound = async () => {
    if (!itemId) return;
    setMarkFoundLoading(true);
    try {
      const res = await fetch(`/api/item/${itemId}`, { method: "PUT" });
      const data = await res.json();
      if (!res.ok) toast.error(data?.error ?? "Failed to mark as found.");
      else {
        toast.success("Item marked as found!");
        setItem((prev) => (prev ? { ...prev, status: "found" } : prev));
      }
    } catch {
      toast.error("An unexpected error occurred.");
    } finally {
      setMarkFoundLoading(false);
    }
  };

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
                Lost on{" "}
                <span className="text-foreground">
                  {new Date(item.date_lost).toLocaleDateString(undefined, {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
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
                  onClick={() => router.push(`/claim/${item.id}`)}
                >
                  Claim This Item
                </Button>
                <Button className="w-full" onClick={() => setInquiryOpen(true)}>
                  Inquire for Information
                </Button>
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
                {item.status === "unclaimed" && (
                  <LoadingButton
                    className="w-full"
                    variant="secondary"
                    loading={markFoundLoading}
                    onClick={() => setConfirmMarkFound(true)}
                  >
                    Mark as Found (No Claim)
                  </LoadingButton>
                )}
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

      {/* Mark as Found confirmation dialog */}
      <Dialog open={confirmMarkFound} onOpenChange={setConfirmMarkFound}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mark as Found?</DialogTitle>
            <DialogDescription>
              This will mark the item as found without approving any pending
              claims. Any existing claims will remain on record. This cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              disabled={markFoundLoading}
              onClick={() => setConfirmMarkFound(false)}
            >
              Cancel
            </Button>
            <LoadingButton
              variant="secondary"
              loading={markFoundLoading}
              onClick={async () => {
                await handleMarkFound();
                setConfirmMarkFound(false);
              }}
            >
              Yes, Mark as Found
            </LoadingButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
