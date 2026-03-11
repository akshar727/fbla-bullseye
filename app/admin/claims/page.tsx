"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DataTable,
  type ColumnDef,
  type FieldDef,
} from "@/components/admin/data-table";
import { Eye, CheckCircle, XCircle } from "lucide-react";
import { spamColor } from "@/lib/utils";
import { STATUS_ICONS, STATUS_COLORS } from "@/lib/status-category-icons";

interface Claim {
  id: string;
  claimant: {
    id: string;
    name: string;
    email: string;
  } | null;
  extra_descriptions: string;
  proof_of_ownerships: string[];
  created_at: string;
  spam_likeliness: number;
  claimed_item: {
    id: string;
    name: string;
    status: string;
  } | null;
}

const addFields: FieldDef[] = [];

export default function ClaimsPage() {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewClaim, setViewClaim] = useState<Claim | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchClaims = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/admin/claims");

      if (!response.ok) {
        throw new Error(`Failed to fetch claims: ${response.statusText}`);
      }

      const data = await response.json();
      setClaims(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch claims");
      console.error("Error fetching claims:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClaims();
  }, []);

  const handleDeleteClaims = async (ids: string[]) => {
    try {
      const response = await fetch("/api/admin/claims", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete claims");
      }

      await fetchClaims();
    } catch (err) {
      console.error("Error deleting claims:", err);
      throw err;
    }
  };

  const handleClaimAction = async (action: "accept" | "deny") => {
    if (!viewClaim) return;
    setActionLoading(true);
    try {
      const response = await fetch("/api/admin/claims", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: viewClaim.id, action }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to ${action} claim`);
      }

      setViewClaim(null);
      await fetchClaims();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : `Failed to ${action} claim`,
      );
    } finally {
      setActionLoading(false);
    }
  };

  const columns: ColumnDef<Claim>[] = [
    { key: "id", label: "ID" },
    {
      key: "claimed_item",
      label: "Item",
      sortValue: (value) => {
        const item = value as Claim["claimed_item"];
        return item?.name ?? "";
      },
      render: (value) => {
        const item = value as Claim["claimed_item"];
        return item?.name || "Unknown";
      },
    },
    {
      key: "claimant",
      label: "Claimant",
      sortValue: (value) => {
        const claimant = value as Claim["claimant"];
        return claimant?.name ?? "";
      },
      render: (value) => {
        const claimant = value as Claim["claimant"];
        return claimant?.name || "Unknown";
      },
    },
    {
      key: "extra_descriptions",
      label: "Description",
      render: (value) => {
        const desc = String(value || "");
        return desc.length > 50 ? desc.substring(0, 50) + "..." : desc;
      },
    },
    {
      key: "claimed_item",
      id: "item_status",
      label: "Item Status",
      sortValue: (value) => {
        const item = value as Claim["claimed_item"];
        return item?.status ?? "";
      },
      render: (value) => {
        const item = value as Claim["claimed_item"];
        const status = item?.status || "unknown";
        const className =
          STATUS_COLORS[status] ?? "bg-slate-100 text-slate-700";
        const StatusIcon = STATUS_ICONS[status];
        return (
          <Badge
            variant="outline"
            className={className + " capitalize inline-flex items-center gap-1"}
          >
            {StatusIcon && <StatusIcon className="size-3" />}
            {status}
          </Badge>
        );
      },
    },
    {
      key: "created_at",
      label: "Filed On",
      render: (value) => {
        return new Date(String(value)).toLocaleDateString();
      },
    },
    {
      key: "spam_likeliness",
      label: "Spam Score",
      render: (value) => {
        const score = value as number;
        return (
          <Badge
            variant="outline"
            className={spamColor(score) + " font-semibold"}
          >
            {score !== null ? `${Math.round(score * 100)}%` : "—"}
          </Badge>
        );
      },
    },
    {
      key: "id",
      label: "Actions",
      sortable: false,
      render: (_value, row) => (
        <Button
          variant="outline"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            setViewClaim(row);
          }}
        >
          <Eye className="size-3.5 mr-1.5" />
          View
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <DataTable<Claim>
        title="Claims"
        description="Manage all item claims filed by users."
        columns={columns}
        data={claims}
        addFields={addFields}
        searchableKeys={["extra_descriptions"]}
        // @ts-ignore
        onDelete={handleDeleteClaims}
        disableAdd
      />

      {/* Claim Detail Dialog */}
      <Dialog
        open={!!viewClaim}
        onOpenChange={(open) => !open && setViewClaim(null)}
      >
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Claim Details</DialogTitle>
            <DialogDescription>
              Review the full claim information before accepting or denying.
            </DialogDescription>
          </DialogHeader>

          {viewClaim && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium text-muted-foreground">Item</p>
                  <p>{viewClaim.claimed_item?.name || "Unknown"}</p>
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">
                    Item Status
                  </p>
                  <p className="capitalize inline-flex items-center gap-1">
                    {viewClaim.claimed_item?.status &&
                      STATUS_ICONS[viewClaim.claimed_item.status] &&
                      (() => {
                        const StatusIcon =
                          STATUS_ICONS[viewClaim.claimed_item!.status];
                        return <StatusIcon className="size-3.5" />;
                      })()}
                    {viewClaim.claimed_item?.status || "Unknown"}
                  </p>
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">Claimant</p>
                  <p className="font-mono text-xs break-all">
                    {viewClaim.claimant?.name || "Unknown"}
                  </p>
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">Filed On</p>
                  <p>{new Date(viewClaim.created_at).toLocaleString()}</p>
                </div>
              </div>

              <div>
                <p className="font-medium text-muted-foreground text-sm mb-1">
                  Description / Notes
                </p>
                <p className="text-sm bg-muted rounded-md p-3 whitespace-pre-wrap">
                  {viewClaim.extra_descriptions || "No description provided."}
                </p>
              </div>

              {viewClaim.proof_of_ownerships?.length > 0 && (
                <div>
                  <p className="font-medium text-muted-foreground text-sm mb-2">
                    Proof of Ownership ({viewClaim.proof_of_ownerships.length}{" "}
                    image
                    {viewClaim.proof_of_ownerships.length !== 1 ? "s" : ""})
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {viewClaim.proof_of_ownerships.map((url, i) => (
                      <a
                        key={i}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={url}
                          alt={`Proof of ownership ${i + 1}`}
                          className="rounded-md border object-cover w-full h-40 hover:opacity-90 transition-opacity"
                        />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setViewClaim(null)}
              disabled={actionLoading}
            >
              Close
            </Button>
            {viewClaim && (
              <>
                <Button
                  variant="destructive"
                  onClick={() => handleClaimAction("deny")}
                  disabled={actionLoading}
                >
                  <XCircle className="size-4 mr-1.5" />
                  Deny Claim
                </Button>
                <Button
                  className="bg-green-600 hover:bg-green-700 text-white"
                  onClick={() => handleClaimAction("accept")}
                  disabled={
                    actionLoading ||
                    viewClaim.claimed_item?.status === "claimed"
                  }
                >
                  <CheckCircle className="size-4 mr-1.5" />
                  Accept Claim
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
