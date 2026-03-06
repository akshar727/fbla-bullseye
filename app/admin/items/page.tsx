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
import { Eye, Trash2 } from "lucide-react";

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

  useEffect(() => {
    fetchItems();
  }, []);

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

  const statusClass = (status: string) =>
    status === "unclaimed"
      ? "bg-gray-100 text-gray-800"
      : status === "found"
        ? "bg-blue-100 text-blue-800"
        : status === "claimed"
          ? "bg-yellow-100 text-yellow-800"
          : "";

  const columns: ColumnDef<Item>[] = [
    { key: "id", label: "ID" },
    { key: "name", label: "Item Name" },
    {
      key: "category",
      label: "Category",
      render: (value) => (
        <Badge variant="outline" className="capitalize">
          {String(value)}
        </Badge>
      ),
    },
    { key: "last_location", label: "Location" },
    {
      key: "status",
      label: "Status",
      render: (value) => {
        const v = String(value);
        return (
          <Badge variant="outline" className={statusClass(v) + " capitalize"}>
            {v}
          </Badge>
        );
      },
    },
    {
      key: "posted_by",
      label: "Posted By",
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
      />

      {/* Item Detail Dialog */}
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
                  <Badge variant="outline" className="capitalize mt-0.5">
                    {viewItem.category}
                  </Badge>
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">Status</p>
                  <Badge
                    variant="outline"
                    className={
                      statusClass(viewItem.status) + " capitalize mt-0.5"
                    }
                  >
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
              disabled={deleteLoading}
            >
              Close
            </Button>
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
