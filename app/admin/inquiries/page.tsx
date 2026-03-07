"use client";

import { useState, useEffect, useCallback } from "react";
import {
  DataTable,
  type ColumnDef,
  type FieldDef,
} from "@/components/admin/data-table";

interface Inquiry {
  id: number;
  inquiry_text: string;
  inquiry_response: string | null;
  created_at: string;
  inquirer: { id: string; name: string; email: string } | null;
  inquired_item: { id: number; name: string } | null;
}

const columns: ColumnDef<Inquiry>[] = [
  { key: "id", label: "ID" },
  {
    key: "inquirer",
    label: "From",
    render: (value) => {
      const u = value as Inquiry["inquirer"];
      return u ? `${u.name} (${u.email})` : "Unknown";
    },
  },
  {
    key: "inquired_item",
    label: "Item",
    render: (value) => {
      const item = value as Inquiry["inquired_item"];
      return item?.name || "—";
    },
  },
  {
    key: "inquiry_text",
    label: "Message",
    render: (value) => {
      const msg = String(value || "");
      return msg.length > 60 ? msg.substring(0, 60) + "..." : msg;
    },
  },
  {
    key: "inquiry_response",
    label: "Response",
    render: (value) => {
      if (!value)
        return (
          <span className="text-muted-foreground italic">No response</span>
        );
      const msg = String(value);
      return msg.length > 60 ? msg.substring(0, 60) + "..." : msg;
    },
  },
  {
    key: "created_at",
    label: "Submitted",
    render: (value) =>
      new Date(String(value)).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
  },
];

const addFields: FieldDef[] = [];

export default function InquiriesPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchInquiries = useCallback(async () => {
    try {
      setError(null);
      const res = await fetch("/api/admin/inquiries");
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to fetch inquiries");
      setInquiries(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch inquiries",
      );
    }
  }, []);

  useEffect(() => {
    fetchInquiries();
  }, [fetchInquiries]);

  const handleDeleteInquiries = async (ids: (string | number)[]) => {
    try {
      setError(null);
      const res = await fetch("/api/admin/inquiries", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to delete inquiries");
      await fetchInquiries();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete inquiries",
      );
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <DataTable<Inquiry>
        title="Inquiries"
        description="View and manage all support inquiries submitted by users."
        columns={columns}
        data={inquiries}
        addFields={addFields}
        searchableKeys={["inquiry_text", "inquiry_response"]}
        onDelete={handleDeleteInquiries}
        disableAdd
      />
    </div>
  );
}
