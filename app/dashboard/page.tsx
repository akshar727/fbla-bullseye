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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import type { ItemResponse } from "@/lib/types";

type ClaimSummary = {
  id: string;
  claimant: string;
  extra_descriptions: string;
  proof_of_ownerships: string[];
  created_at: string;
};

type ClaimedByUser = {
  id: string;
  name: string;
  email: string;
};

type ItemWithClaims = ItemResponse & {
  claims: ClaimSummary[];
  claimed_by?: ClaimedByUser | null;
};

export default function DashboardPage() {
  const router = useRouter();
  const { user, u_loading } = useUser();

  const [items, setItems] = useState<ItemWithClaims[]>([]);
  const [loading, setLoading] = useState(true);

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedClaim, setSelectedClaim] = useState<ClaimSummary | null>(null);
  const [selectedItem, setSelectedItem] = useState<ItemWithClaims | null>(null);
  const [actionLoading, setActionLoading] = useState<"approve" | "deny" | null>(
    null,
  );

  useEffect(() => {
    if (!u_loading && !user) router.replace("/");
  }, [u_loading, user, router]);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setItems(data);
        else toast.error(data?.error ?? "Failed to load dashboard.");
      })
      .catch(() => toast.error("Failed to load dashboard."))
      .finally(() => setLoading(false));
  }, [user]);

  const handleAction = async (action: "approve" | "deny") => {
    if (!selectedClaim || !selectedItem) return;
    setActionLoading(action);
    try {
      const res = await fetch(`/api/claims/${selectedClaim.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data?.error ?? `Failed to ${action} claim.`);
      } else {
        toast.success(
          action === "approve" ? "Claim approved!" : "Claim denied.",
        );
        setDialogOpen(false);
        // Refresh data
        const refresh = await fetch("/api/dashboard").then((r) => r.json());
        if (Array.isArray(refresh)) setItems(refresh);
      }
    } catch {
      toast.error("An unexpected error occurred.");
    } finally {
      setActionLoading(null);
    }
  };

  if (u_loading || (!user && !u_loading)) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-1">Your Items</h1>
      <p className="text-muted-foreground mb-8">
        Manage items that you've posted to Bullseye.
      </p>

      {loading && (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-4 space-y-2">
                <Skeleton className="h-5 w-1/3" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!loading && items.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-lg font-medium">No found items reported yet.</p>
          <Button className="mt-4" onClick={() => router.push("/report/found")}>
            Report a Found Item
          </Button>
        </div>
      )}

      {!loading && items.length > 0 && (
        <div className="space-y-6">
          {items.map((item) => (
            <Card key={item.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <CardTitle className="text-lg">{item.name}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {getCategoryLabel(item.category)}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => router.push(`/item/${item.id}`)}
                  >
                    View
                  </Button>
                </div>
              </CardHeader>

              <CardContent>
                {item.status === "claimed" && item.claimed_by ? (
                  <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2">
                    <p className="text-sm font-medium text-emerald-900">
                      ✓ Claimed
                    </p>
                    <p className="text-sm text-emerald-700 mt-1">
                      <span className="font-medium">Name:</span>{" "}
                      {item.claimed_by.name}
                    </p>
                    <p className="text-sm text-emerald-700">
                      <span className="font-medium">Email:</span>{" "}
                      {item.claimed_by.email}
                    </p>
                  </div>
                ) : item.claims.length === 0 ? (
                  <p className="text-sm text-muted-foreground italic">
                    No claims yet.
                  </p>
                ) : (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">
                      {item.claims.length} claim
                      {item.claims.length !== 1 ? "s" : ""}
                    </p>
                    {item.claims.map((claim, i) => (
                      <div
                        key={claim.id}
                        className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
                      >
                        <span className="text-muted-foreground">
                          Claim #{i + 1} ·{" "}
                          {new Date(claim.created_at).toLocaleDateString(
                            undefined,
                            { month: "short", day: "numeric", year: "numeric" },
                          )}
                        </span>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => {
                            setSelectedClaim(claim);
                            setSelectedItem(item);
                            setDialogOpen(true);
                          }}
                        >
                          Review
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Claim review dialog */}
      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setDialogOpen(false);
            setTimeout(() => {
              setSelectedClaim(null);
              setSelectedItem(null);
            }, 200);
          }
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Review Claim</DialogTitle>
            <DialogDescription>
              For:{" "}
              <span className="font-medium text-foreground">
                {selectedItem?.name}
              </span>
            </DialogDescription>
          </DialogHeader>

          {selectedClaim && (
            <div className="space-y-4 py-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">
                  Claimant Description
                </p>
                <p className="text-sm whitespace-pre-wrap">
                  {selectedClaim.extra_descriptions || "—"}
                </p>
              </div>

              {selectedClaim.proof_of_ownerships?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                    Proof of Ownership
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {selectedClaim.proof_of_ownerships.map((url, i) => (
                      <a
                        key={i}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <img
                          src={url}
                          alt={`Proof ${i + 1}`}
                          className="w-full aspect-square object-cover rounded-md border hover:opacity-80 transition-opacity"
                        />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="gap-2">
            <LoadingButton
              variant="destructive"
              loading={actionLoading === "deny"}
              disabled={!!actionLoading}
              onClick={() => handleAction("deny")}
            >
              Deny
            </LoadingButton>
            <LoadingButton
              loading={actionLoading === "approve"}
              disabled={!!actionLoading}
              onClick={() => handleAction("approve")}
            >
              Approve
            </LoadingButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
