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
import { Eye, RotateCcw, Trash2 } from "lucide-react";

interface SpamClaim {
  id: string;
  claimant: {
    id: string;
    name: string;
    email: string;
  } | null;
  extra_descriptions: string;
  proof_of_ownerships: string[];
  created_at: string;
  spam_likeliness: number | null;
  claimed_item: {
    id: string;
    name: string;
    status: string;
  } | null;
}

const addFields: FieldDef[] = [];

export default function SpamClaimsPage() {
  const [claims, setClaims] = useState<SpamClaim[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewClaim, setViewClaim] = useState<SpamClaim | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchClaims = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/admin/claims/spam");
      if (!response.ok) {
        throw new Error(`Failed to fetch spam claims: ${response.statusText}`);
      }
      const data = await response.json();
      setClaims(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch spam claims",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClaims();
  }, []);

  const handleDeleteClaims = async (ids: string[]) => {
    const response = await fetch("/api/admin/claims/spam", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids }),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to delete claims");
    }
    await fetchClaims();
  };

  const handleRestore = async () => {
    if (!viewClaim) return;
    setActionLoading(true);
    try {
      const response = await fetch("/api/admin/claims/spam", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: viewClaim.id }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to restore claim");
      }
      setViewClaim(null);
      await fetchClaims();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to restore claim");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!viewClaim) return;
    setActionLoading(true);
    try {
      const response = await fetch("/api/admin/claims/spam", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: [viewClaim.id] }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete claim");
      }
      setViewClaim(null);
      await fetchClaims();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete claim");
    } finally {
      setActionLoading(false);
    }
  };

  const spamColor = (score: number | null) => {
    if (score === null) return "bg-gray-100 text-gray-700";
    if (score >= 0.85) return "bg-red-100 text-red-800";
    if (score >= 0.7) return "bg-orange-100 text-orange-800";
    return "bg-yellow-100 text-yellow-800";
  };

  const columns: ColumnDef<SpamClaim>[] = [
    { key: "id", label: "ID" },
    {
      key: "claimed_item",
      label: "Item",
      render: (value) => {
        const item = value as SpamClaim["claimed_item"];
        return item?.name || "Unknown";
      },
    },
    {
      key: "claimant",
      label: "Claimant",
      render: (value) => {
        const claimant = value as SpamClaim["claimant"];
        return claimant?.name || "Unknown";
      },
    },
    {
      key: "spam_likeliness",
      label: "Spam Score",
      render: (value) => {
        const score = value as number | null;
        return (
          <Badge
            variant="outline"
            className={spamColor(score) + " font-mono font-semibold"}
          >
            {score !== null ? `${Math.round(score * 100)}%` : "—"}
          </Badge>
        );
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
      key: "created_at",
      label: "Filed On",
      render: (value) => new Date(String(value)).toLocaleDateString(),
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

      <DataTable<SpamClaim>
        title="Spam Claims"
        description="Claims flagged by AI as likely spam (score ≥ 60%). Restore legitimate ones or delete fraudulent submissions."
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
            <DialogTitle>Spam Claim Details</DialogTitle>
            <DialogDescription>
              Review the flagged claim. Restore it if it looks legitimate, or
              delete it permanently.
            </DialogDescription>
          </DialogHeader>

          {viewClaim && (
            <div className="space-y-4">
              {/* Spam score banner */}
              <div className="flex items-center gap-2 rounded-md border border-orange-200 bg-orange-50 px-4 py-2 text-sm text-orange-800">
                <span className="font-semibold">AI Spam Score:</span>
                <span className="font-mono font-bold text-base">
                  {viewClaim.spam_likeliness !== null
                    ? `${Math.round(viewClaim.spam_likeliness * 100)}%`
                    : "—"}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium text-muted-foreground">Item</p>
                  <p>{viewClaim.claimed_item?.name || "Unknown"}</p>
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">
                    Item Status
                  </p>
                  <p className="capitalize">
                    {viewClaim.claimed_item?.status || "Unknown"}
                  </p>
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">Claimant</p>
                  <p>{viewClaim.claimant?.name || "Unknown"}</p>
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">Email</p>
                  <p className="text-xs break-all">
                    {viewClaim.claimant?.email || "Unknown"}
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
                  onClick={handleDelete}
                  disabled={actionLoading}
                >
                  <Trash2 className="size-4 mr-1.5" />
                  Delete
                </Button>
                <Button
                  className="bg-green-600 hover:bg-green-700 text-white"
                  onClick={handleRestore}
                  disabled={actionLoading}
                >
                  <RotateCcw className="size-4 mr-1.5" />
                  Restore Claim
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
