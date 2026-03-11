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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DataTable,
  type ColumnDef,
  type FieldDef,
} from "@/components/admin/data-table";
import { Eye, RotateCcw, Trash2 } from "lucide-react";
import { spamColor } from "@/lib/utils";
import {
  STATUS_ICONS,
  CATEGORY_ICONS,
  CATEGORY_BADGE_COLORS,
} from "@/lib/status-category-icons";
import { getCategoryLabel } from "@/lib/categories";

interface SpamClaim {
  id: string;
  claimant: { id: string; name: string; email: string } | null;
  extra_descriptions: string;
  proof_of_ownerships: string[];
  created_at: string;
  spam_likeliness: number | null;
  claimed_item: { id: string; name: string; status: string } | null;
}

interface SpamItem {
  id: string;
  name: string;
  category: string;
  description: string | null;
  last_location: string;
  status: string;
  image_urls: string[];
  created_at: string;
  spam_likeliness: number | null;
  posted_by: { id: string; name: string } | null;
}

const addFields: FieldDef[] = [];

// --- Spam Claims Tab ---

function SpamClaimsTab() {
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
      if (!response.ok)
        throw new Error(`Failed to fetch spam claims: ${response.statusText}`);
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
              <div className="flex items-center gap-1 rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-800">
                <span className="font-semibold">AI Spam Score:</span>
                <span className="font-bold text-base ml-1">
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
                    image{viewClaim.proof_of_ownerships.length !== 1 ? "s" : ""}
                    )
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

// --- Spam Items Tab ---

function SpamItemsTab() {
  const [items, setItems] = useState<SpamItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewItem, setViewItem] = useState<SpamItem | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchItems = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/admin/items/spam");
      if (!response.ok)
        throw new Error(`Failed to fetch spam items: ${response.statusText}`);
      const data = await response.json();
      setItems(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch spam items",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleDeleteItems = async (ids: string[]) => {
    const response = await fetch("/api/admin/items/spam", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids }),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to delete items");
    }
    await fetchItems();
  };

  const handleRestore = async () => {
    if (!viewItem) return;
    setActionLoading(true);
    try {
      const response = await fetch("/api/admin/items/spam", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: viewItem.id }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to restore item");
      }
      setViewItem(null);
      await fetchItems();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to restore item");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!viewItem) return;
    setActionLoading(true);
    try {
      const response = await fetch("/api/admin/items/spam", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: [viewItem.id] }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete item");
      }
      setViewItem(null);
      await fetchItems();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete item");
    } finally {
      setActionLoading(false);
    }
  };

  const columns: ColumnDef<SpamItem>[] = [
    { key: "id", label: "ID" },
    { key: "name", label: "Item Name" },
    {
      key: "category",
      label: "Category",
      render: (value) => {
        const cat = String(value);
        const CatIcon = CATEGORY_ICONS[cat];
        return (
          <Badge
            className={`${CATEGORY_BADGE_COLORS[cat] ?? "bg-slate-100 text-slate-700"} capitalize inline-flex items-center gap-1`}
          >
            {CatIcon && <CatIcon className="size-3" />}
            {getCategoryLabel(cat)}
          </Badge>
        );
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
      key: "posted_by",
      label: "Posted By",
      render: (value) => {
        const user = value as SpamItem["posted_by"];
        return user?.name || "Unknown";
      },
    },
    {
      key: "created_at",
      label: "Posted On",
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
            setViewItem(row);
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
      <DataTable<SpamItem>
        title="Spam Items"
        description="Items flagged by AI as likely spam or inappropriate (score ≥ 60%). Restore clean listings or delete violations."
        columns={columns}
        data={items}
        addFields={addFields}
        searchableKeys={["name", "description"]}
        // @ts-ignore
        onDelete={handleDeleteItems}
        disableAdd
      />
      <Dialog
        open={!!viewItem}
        onOpenChange={(open) => !open && setViewItem(null)}
      >
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Spam Item Details</DialogTitle>
            <DialogDescription>
              Review the flagged item. Restore it if it looks legitimate, or
              delete it permanently.
            </DialogDescription>
          </DialogHeader>
          {viewItem && (
            <div className="space-y-4">
              <div className="flex items-center gap-1 rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-800">
                <span className="font-semibold">AI Spam Score:</span>
                <span className="font-bold text-base ml-1">
                  {viewItem.spam_likeliness !== null
                    ? `${Math.round(viewItem.spam_likeliness * 100)}%`
                    : "—"}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium text-muted-foreground">Name</p>
                  <p>{viewItem.name}</p>
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">Category</p>
                  <Badge
                    className={`${CATEGORY_BADGE_COLORS[viewItem.category] ?? "bg-slate-100 text-slate-700"} capitalize mt-0.5 inline-flex items-center gap-1`}
                  >
                    {CATEGORY_ICONS[viewItem.category] &&
                      (() => {
                        const CatIcon = CATEGORY_ICONS[viewItem.category];
                        return <CatIcon className="size-3" />;
                      })()}
                    {getCategoryLabel(viewItem.category)}
                  </Badge>
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">Status</p>
                  <p className="capitalize inline-flex items-center gap-1">
                    {STATUS_ICONS[viewItem.status] &&
                      (() => {
                        const StatusIcon = STATUS_ICONS[viewItem.status];
                        return <StatusIcon className="size-3.5" />;
                      })()}
                    {viewItem.status}
                  </p>
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">Location</p>
                  <p>{viewItem.last_location || "—"}</p>
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">Posted By</p>
                  <p>{viewItem.posted_by?.name || "Unknown"}</p>
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">Posted On</p>
                  <p>{new Date(viewItem.created_at).toLocaleString()}</p>
                </div>
              </div>
              <div>
                <p className="font-medium text-muted-foreground text-sm mb-1">
                  Description
                </p>
                <p className="text-sm bg-muted rounded-md p-3 whitespace-pre-wrap">
                  {viewItem.description || "No description provided."}
                </p>
              </div>
              {viewItem.image_urls?.length > 0 && (
                <div>
                  <p className="font-medium text-muted-foreground text-sm mb-2">
                    Images ({viewItem.image_urls.length})
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {viewItem.image_urls.map((url, i) => (
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
                          alt={`${viewItem.name} image ${i + 1}`}
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
              onClick={() => setViewItem(null)}
              disabled={actionLoading}
            >
              Close
            </Button>
            {viewItem && (
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
                  Restore Item
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// --- Page ---

export default function SpamReviewPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Spam Review</h1>
        <p className="text-muted-foreground text-sm">
          AI-flagged claims and items awaiting admin review.
        </p>
      </div>
      <Tabs defaultValue="claims">
        <TabsList className="w-full">
          <TabsTrigger value="claims">Spam Claims</TabsTrigger>
          <TabsTrigger value="items">Spam Items</TabsTrigger>
        </TabsList>
        <TabsContent value="claims" className="mt-4">
          <SpamClaimsTab />
        </TabsContent>
        <TabsContent value="items" className="mt-4">
          <SpamItemsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
