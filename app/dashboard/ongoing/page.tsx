"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useUser } from "@/hooks/use-user";
import { getCategoryLabel } from "@/lib/categories";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { ClaimResponse } from "@/lib/types";

export default function OngoingClaimsPage() {
  const router = useRouter();
  const { user, u_loading } = useUser();

  const [claims, setClaims] = useState<ClaimResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!u_loading && !user) router.replace("/");
  }, [u_loading, user, router]);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    fetch("/api/claims/ongoing")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setClaims(data);
        else toast.error(data?.error ?? "Failed to load ongoing claims.");
      })
      .catch(() => toast.error("Failed to load ongoing claims."))
      .finally(() => setLoading(false));
  }, [user]);

  if (u_loading || (!user && !u_loading)) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-1">Claims in Progress</h1>
      <p className="text-muted-foreground mb-8">
        Claims you have submitted that are awaiting a decision.
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

      {!loading && claims.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-lg font-medium">No claims in progress.</p>
          <Button className="mt-4" onClick={() => router.push("/browse")}>
            Browse Found Items
          </Button>
        </div>
      )}

      {!loading && claims.length > 0 && (
        <div className="space-y-4">
          {claims.map((claim) => (
            <Card key={claim.id}>
              <CardHeader className="pb-2">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                  <div>
                    <CardTitle className="text-lg">
                      {claim.claimed_item?.name ?? "Unknown Item"}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {getCategoryLabel(claim.claimed_item?.category ?? "")}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 sm:shrink-0">
                    {(claim.spam_likeliness ?? 0) >= 0.6 ? (
                      <Badge
                        variant="outline"
                        className="border-orange-300 bg-orange-50 text-orange-700"
                      >
                        Under Admin Review
                      </Badge>
                    ) : (
                      <Badge>Pending</Badge>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        router.push(`/item/${claim.claimed_item?.id}`)
                      }
                    >
                      View Item
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-1 text-sm text-muted-foreground">
                <p>
                  <span className="font-medium text-foreground">
                    Claim submitted:
                  </span>{" "}
                  {new Date(claim.created_at).toLocaleDateString(undefined, {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
                {claim.extra_descriptions && (
                  <p>
                    <span className="font-medium text-foreground">
                      Your description:
                    </span>{" "}
                    {claim.extra_descriptions}
                  </p>
                )}
                {claim.claimed_item?.last_location && (
                  <p>
                    <span className="font-medium text-foreground">
                      Last seen:
                    </span>{" "}
                    {claim.claimed_item.last_location}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
