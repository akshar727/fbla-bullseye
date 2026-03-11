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
import { Eye, Trash2, CheckCircle } from "lucide-react";
import { spamColor } from "@/lib/utils";
import {
  STATUS_ICONS,
  CATEGORY_ICONS,
  STATUS_COLORS,
} from "@/lib/status-category-icons";
import { getCategoryLabel } from "@/lib/categories";
import { CATEGORY_BADGE_COLORS } from "@/lib/status-category-icons";

// shape of a single item row
interface Item {
  id: string;
  name: string;
  category: string;
  last_location: string;
  description: string | null;
  date_lost: string | null;
  image_urls: string[];
  status: "unclaimed" | "found" | "claimed";
  posted_by: { id: string; name: string } | null;
  created_at: string;
  spam_likeliness: number | null;
}

const categories = [
  "electronics",
  "clothing",
  "accessories",
  "bags",
  "keys",
  "books",
  "other",
];

const addFields: FieldDef[] = [
  { key: "name", label: "Item Name", placeholder: "e.g. Blue Thermos" },
  { key: "category", label: "Category", type: "select", options: categories },
  {
    key: "last_location",
    label: "Location",
    placeholder: "Where was it found?",
  },
];

export default function ItemsPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewItem, setViewItem] = useState<Item | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [markFoundLoading, setMarkFoundLoading] = useState(false);

  // load all items from API
  const fetchItems = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/admin/items");

      if (!response.ok) {
        throw new Error(`Failed to fetch items: ${response.statusText}`);
      }

      const data = await response.json();
      setItems(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch items");
      console.error("Error fetching items:", err);
    } finally {
      setLoading(false);
    }
  };

  // fetch once on initial mount
  useEffect(() => {
    fetchItems();
  }, []);

  // POST new item then refresh table
  const handleAddItem = async (newItem: Record<string, unknown>) => {
    try {
      const response = await fetch("/api/admin/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newItem),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to add item");
      }

      await fetchItems();
    } catch (err) {
      console.error("Error adding item:", err);
      throw err;
    }
  };

  // bulk DELETE accepts array of ids
  const handleDeleteItems = async (ids: string[]) => {
    try {
      const response = await fetch("/api/admin/items", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete items");
      }

      await fetchItems();
    } catch (err) {
      console.error("Error deleting items:", err);
      throw err;
    }
  };

  // wraps bulk delete for single dialog item
  const handleDeleteSingle = async () => {
    if (!viewItem) return;
    setDeleteLoading(true);
    try {
      await handleDeleteItems([viewItem.id]);
      setViewItem(null);
      setDeleteConfirm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete item");
    } finally {
      setDeleteLoading(false);
    }
  };

  // PATCH action changes status to found
  const handleMarkFound = async () => {
    if (!viewItem) return;
    setMarkFoundLoading(true);
    try {
      const response = await fetch("/api/admin/items", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: viewItem.id, action: "mark_found" }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to mark item as found");
      }
      // optimistically update dialog before refetch
      setViewItem((prev) => (prev ? { ...prev, status: "found" } : prev));
      await fetchItems();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to mark item as found",
      );
    } finally {
      setMarkFoundLoading(false);
    }
  };

  // maps status to tailwind color classes
  const statusClass = (status: string) =>
    STATUS_COLORS[status] ?? "bg-slate-100 text-slate-700";

  // column definitions for the data table
  const columns: ColumnDef<Item>[] = [
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
            variant="outline"
            className={`${CATEGORY_BADGE_COLORS[cat] ?? "bg-slate-100 text-slate-700"} capitalize inline-flex items-center gap-1`}
          >
            {CatIcon && <CatIcon className="size-3" />}
            {getCategoryLabel(cat)}
          </Badge>
        );
      },
    },
    { key: "last_location", label: "Location" },
    {
      key: "status",
      label: "Status",
      render: (value) => {
        const v = String(value);
        const StatusIcon = STATUS_ICONS[v];
        return (
          <Badge
            variant="outline"
            className={
              statusClass(v) + " capitalize inline-flex items-center gap-1"
            }
          >
            {StatusIcon && <StatusIcon className="size-3" />}
            {v}
          </Badge>
        );
      },
    },
    {
      key: "spam_likeliness",
      label: "Spam Score",
      // null score shown as dash
      render: (value) => {
        const score = value as number | null;
        if (score === null)
          return <span className="text-muted-foreground text-xs">—</span>;
        return (
          <Badge
            variant="outline"
            className={spamColor(score) + " font-semibold"}
          >
            {Math.round(score * 100)}%
          </Badge>
        );
      },
    },
    {
      key: "posted_by",
      label: "Posted By",
      sortValue: (value) => {
        const postedBy = value as Item["posted_by"];
        return postedBy?.name ?? "";
      },
      render: (value) => {
        const postedBy = value as Item["posted_by"];
        return postedBy?.name || "Unknown";
      },
    },
    {
      key: "created_at",
      label: "Date",
      render: (value) => {
        return new Date(String(value)).toLocaleDateString();
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
            setDeleteConfirm(false);
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

      <DataTable<Item>
        title="Items"
        description="Manage all found items uploaded to the platform."
        columns={columns}
        data={items}
        addFields={addFields}
        searchableKeys={["name", "category", "last_location"]}
        onAdd={handleAddItem}
        // @ts-ignore
        onDelete={handleDeleteItems}
        disableAdd // items created by users only
      />

      {/* Item Detail Dialog */}
      {/* full info including images and actions */}
      <Dialog
        open={!!viewItem}
        onOpenChange={(open) => {
          if (!open) {
            setViewItem(null);
            setDeleteConfirm(false);
          }
        }}
      >
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Item Details</DialogTitle>
            <DialogDescription>
              Full information for this item listing.
            </DialogDescription>
          </DialogHeader>

          {viewItem && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium text-muted-foreground">Name</p>
                  <p>{viewItem.name}</p>
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">
                    Category / Tag
                  </p>
                  <Badge
                    variant="outline"
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
                  <Badge
                    variant="outline"
                    className={
                      statusClass(viewItem.status) +
                      " capitalize mt-0.5 inline-flex items-center gap-1"
                    }
                  >
                    {STATUS_ICONS[viewItem.status] &&
                      (() => {
                        const StatusIcon = STATUS_ICONS[viewItem.status];
                        return <StatusIcon className="size-3" />;
                      })()}
                    {viewItem.status}
                  </Badge>
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">
                    Location Found
                  </p>
                  <p>{viewItem.last_location || "—"}</p>
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">Posted By</p>
                  <p>{viewItem.posted_by?.name || "Unknown"}</p>
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">Date Lost</p>
                  <p>
                    {viewItem.date_lost
                      ? new Date(viewItem.date_lost).toLocaleDateString()
                      : "—"}
                  </p>
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">Listed On</p>
                  <p>{new Date(viewItem.created_at).toLocaleString()}</p>
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">Item ID</p>
                  <p className="font-mono text-xs break-all">{viewItem.id}</p>
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
                  {/* linked thumbnails open in new tab */}
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

              {deleteConfirm && (
                <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  Are you sure you want to delete{" "}
                  <strong>{viewItem.name}</strong>? This action cannot be
                  undone.
                </div>
              )}
            </div>
          )}

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setViewItem(null);
                setDeleteConfirm(false);
              }}
              disabled={deleteLoading || markFoundLoading}
            >
              Close
            </Button>
            {viewItem?.status === "claimed" && (
              <Button
                className="bg-green-600 hover:bg-green-700 text-white"
                onClick={handleMarkFound}
                disabled={markFoundLoading || deleteLoading}
              >
                <CheckCircle className="size-4 mr-1.5" />
                {markFoundLoading ? "Saving…" : "Mark as Found"}
              </Button>
            )}
            {/* two-step confirm prevents accidental deletes */}
            {!deleteConfirm ? (
              <Button
                variant="destructive"
                onClick={() => setDeleteConfirm(true)}
                disabled={deleteLoading}
              >
                <Trash2 className="size-4 mr-1.5" />
                Delete Item
              </Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={() => setDeleteConfirm(false)}
                  disabled={deleteLoading}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDeleteSingle}
                  disabled={deleteLoading}
                >
                  <Trash2 className="size-4 mr-1.5" />
                  Confirm Delete
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
