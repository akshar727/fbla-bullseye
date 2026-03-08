"use client";

import { useCallback, useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  DataTable,
  type ColumnDef,
  type FieldDef,
} from "@/components/admin/data-table";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  last_active: string | null;
}
  
const columns: ColumnDef<User>[] = [
  { key: "id", label: "ID" },
  { key: "name", label: "Name" },
  { key: "email", label: "Email" },
  {
    key: "role",
    label: "Role",
    render: (value) => {
      const v = String(value).toLowerCase();
      const variant =
        v === "admin" ? "default" : v === "moderator" ? "secondary" : "outline";
      return (
        <Badge variant={variant}>
          {v.charAt(0).toUpperCase() + v.slice(1)}
        </Badge>
      );
    },
  },
  {
    key: "last_active",
    label: "Last Active",
    render: (value) => {
      if (!value) return "—";
      return new Date(String(value)).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    },
  },
];

const addFields: FieldDef[] = [
  { key: "name", label: "Name", placeholder: "Full name" },
  {
    key: "email",
    label: "Email",
    type: "email",
    placeholder: "user@email.com",
  },
  {
    key: "role",
    label: "Role",
    type: "select",
    options: ["User", "Moderator", "Admin"],
  },
];

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      setError(null);
      const res = await fetch("/api/admin/users");
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Failed to fetch users");
      }

      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch users");
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleAddUser = async (item: Record<string, string>) => {
    try {
      setError(null);
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: item.name,
          email: item.email,
          role: (item.role || "user").toLowerCase(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "Failed to add user");
      }
      await fetchUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add user");
    }
  };

  const handleDeleteUsers = async (ids: (string | number)[]) => {
    try {
      setError(null);
      const res = await fetch("/api/admin/users", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "Failed to delete users");
      }
      await fetchUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete users");
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <DataTable<User>
        title="Users"
        description="Manage all registered users on the platform."
        columns={columns}
        data={users}
        onAdd={handleAddUser}
        onDelete={handleDeleteUsers}
        disableAdd
        addFields={addFields}
        searchableKeys={["name", "email", "role"]}
      />
    </div>
  );
}
