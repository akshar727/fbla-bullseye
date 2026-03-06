"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import {
  DataTable,
  type ColumnDef,
  type FieldDef,
} from "@/components/admin/data-table";

interface Claim {
  id: string;
  claimant: string;
  extra_descriptions: string;
  created_at: string;
  claimed_item: {
    id: string;
    name: string;
    status: string;
  } | null;
}

const columns: ColumnDef<Claim>[] = [
  { key: "id", label: "ID" },
  {
    key: "claimed_item",
    label: "Item",
    render: (value) => {
      const item = value as Claim["claimed_item"];
      return item?.name || "Unknown";
    },
  },
  {
    key: "claimant",
    label: "Claimant ID",
    render: (value) => {
      const id = String(value);
      return id.substring(0, 8) + "...";
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
    label: "Item Status",
    render: (value) => {
      const item = value as Claim["claimed_item"];
      const status = item?.status || "unknown";
      const className =
        status === "unclaimed"
          ? "bg-gray-100 text-gray-800"
          : status === "found"
            ? "bg-blue-100 text-blue-800"
            : status === "claimed"
              ? "bg-yellow-100 text-yellow-800"
              : "";
      return (
        <Badge variant="outline" className={className + " capitalize"}>
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
];

const addFields: FieldDef[] = [];

export default function ClaimsPage() {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      />
    </div>
  );
}
