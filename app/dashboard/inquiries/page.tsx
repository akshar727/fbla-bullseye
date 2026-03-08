"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useUser } from "@/hooks/use-user";
import { getCategoryLabel } from "@/lib/categories";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { LoadingButton } from "@/components/ui/loading-button";
import { Badge } from "@/components/ui/badge";
import { MessageSquareReply, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

type InquiryItem = {
  id: string;
  name: string;
  category: string;
  status: string;
};

type Inquiry = {
  id: string;
  inquiry_text: string;
  inquiry_response: string | null;
  created_at: string;
  inquired_item: InquiryItem;
};

export default function InquiriesPage() {
  const router = useRouter();
  const { user, u_loading } = useUser();

  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);

  // Delete confirm dialog
  const [deleteTarget, setDeleteTarget] = useState<Inquiry | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    if (!u_loading && !user) router.replace("/");
  }, [u_loading, user, router]);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    fetch("/api/inquiry")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setInquiries(data);
        else toast.error(data?.error ?? "Failed to load inquiries.");
      })
      .catch(() => toast.error("Failed to load inquiries."))
      .finally(() => setLoading(false));
  }, [user]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/inquiry/${deleteTarget.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data?.error ?? "Failed to delete inquiry.");
      } else {
        toast.success("Inquiry deleted.");
        setInquiries((prev) => prev.filter((i) => i.id !== deleteTarget.id));
        setDeleteTarget(null);
      }
    } catch {
      toast.error("An unexpected error occurred.");
    } finally {
      setDeleteLoading(false);
    }
  };

  if (u_loading || (!user && !u_loading)) {
    return (
      <div className="flex items-center justify-center py-16">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-1">My Inquiries</h1>
      <p className="text-muted-foreground text-sm mb-8">
        Inquiries you've sent to item finders. You can delete an inquiry as long
        as it hasn't been answered yet.
      </p>

      {/* Skeletons */}
      {loading && (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-4 space-y-2">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && inquiries.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-lg font-medium">No inquiries yet.</p>
          <Button
            className="mt-4"
            variant="outline"
            onClick={() => router.push("/browse")}
          >
            Browse Items
          </Button>
        </div>
      )}

      {/* Inquiry list */}
      {!loading && inquiries.length > 0 && (
        <div className="space-y-4">
          {inquiries.map((inquiry) => (
            <Card key={inquiry.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <CardTitle className="text-base">
                      {inquiry.inquired_item.name}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {getCategoryLabel(inquiry.inquired_item.category)} ·{" "}
                      {new Date(inquiry.created_at).toLocaleDateString(
                        undefined,
                        { month: "short", day: "numeric", year: "numeric" },
                      )}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {inquiry.inquiry_response ? (
                      <Badge variant="default" className="gap-1">
                        <MessageSquareReply className="size-3" />
                        Answered
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Pending</Badge>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        router.push(`/item/${inquiry.inquired_item.id}`)
                      }
                    >
                      View Item
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      disabled={!!inquiry.inquiry_response}
                      title={
                        inquiry.inquiry_response
                          ? "Cannot delete — already answered"
                          : "Delete inquiry"
                      }
                      onClick={() => setDeleteTarget(inquiry)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                {/* Your message */}
                <div className="rounded-md bg-muted/50 px-3 py-2 text-sm">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">
                    Your message
                  </p>
                  <p className="whitespace-pre-wrap">{inquiry.inquiry_text}</p>
                </div>

                {/* Response */}
                {inquiry.inquiry_response && (
                  <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm">
                    <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700 mb-1">
                      Finder's response
                    </p>
                    <p className="whitespace-pre-wrap text-emerald-900">
                      {inquiry.inquiry_response}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Delete confirmation dialog */}
      <Dialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Inquiry?</DialogTitle>
            <DialogDescription>
              This will permanently delete your inquiry about{" "}
              <span className="font-medium text-foreground">
                {deleteTarget?.inquired_item.name}
              </span>
              . This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              disabled={deleteLoading}
              onClick={() => setDeleteTarget(null)}
            >
              Cancel
            </Button>
            <LoadingButton
              variant="destructive"
              loading={deleteLoading}
              onClick={handleDelete}
            >
              Delete
            </LoadingButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
