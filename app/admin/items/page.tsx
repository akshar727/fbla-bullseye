"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import {
  DataTable,
  type ColumnDef,
  type FieldDef,
} from "@/components/admin/data-table";

interface Item {
  id: string;
  name: string;
  category: string;
  last_location: string;
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
const statuses = ["unclaimed", "found", "claimed"];

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
      const className =
        v === "unclaimed"
          ? "bg-gray-100 text-gray-800"
          : v === "found"
            ? "bg-blue-100 text-blue-800"
            : v === "claimed"
              ? "bg-yellow-100 text-yellow-800"
              : "";
      return (
        <Badge variant="outline" className={className + " capitalize"}>
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
        onDelete={handleDeleteItems}
      />
    </div>
  );
}
