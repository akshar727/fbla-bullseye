"use client";

import { Badge } from "@/components/ui/badge";
import {
  DataTable,
  type ColumnDef,
  type FieldDef,
} from "@/components/admin/data-table";

interface Claim {
  id: string;
  itemTitle: string;
  claimedBy: string;
  claimerEmail: string;
  status: string;
  filedOn: string;
  resolvedOn: string;
}

const claimStatuses = ["Pending", "Approved", "Rejected"];

const placeholderClaims: Claim[] = Array.from({ length: 15 }, (_, i) => ({
  id: `clm_${String(i + 1).padStart(3, "0")}`,
  itemTitle: [
    "Blue Thermos",
    "Pink Purse",
    "Car Keys",
    "Black Laptop Bag",
    "Red Jacket",
    "Silver Watch",
    "Green Backpack",
    "Wireless Earbuds",
    "Textbook - Calculus",
    "Sunglasses",
    "Water Bottle",
    "USB Flash Drive",
    "Yellow Umbrella",
    "Wallet (Brown)",
    "Phone Charger",
  ][i],
  claimedBy: [
    "Olivia Lewis",
    "Noah Clark",
    "Mia Robinson",
    "Leo Garcia",
    "Kate Thomas",
    "Jack Anderson",
    "Iris Martinez",
    "Henry Taylor",
    "Grace Lee",
    "Frank Wilson",
    "Emma Davis",
    "David Brown",
    "Carol White",
    "Bob Smith",
    "Alice Johnson",
  ][i],
  claimerEmail: [
    "olivia@email.com",
    "noah@email.com",
    "mia@email.com",
    "leo@email.com",
    "kate@email.com",
    "jack@email.com",
    "iris@email.com",
    "henry@email.com",
    "grace@email.com",
    "frank@email.com",
    "emma@email.com",
    "david@email.com",
    "carol@email.com",
    "bob@email.com",
    "alice@email.com",
  ][i],
  status: claimStatuses[i % claimStatuses.length],
  filedOn: `2025-${String((i % 12) + 1).padStart(2, "0")}-${String((i % 28) + 1).padStart(2, "0")}`,
  resolvedOn:
    i % 3 === 0
      ? "---"
      : `2025-${String(((i + 1) % 12) + 1).padStart(2, "0")}-${String(((i + 3) % 28) + 1).padStart(2, "0")}`,
}));

const columns: ColumnDef<Claim>[] = [
  { key: "id", label: "ID" },
  { key: "itemTitle", label: "Item" },
  { key: "claimedBy", label: "Claimed By" },
  { key: "claimerEmail", label: "Email" },
  {
    key: "status",
    label: "Status",
    render: (value) => {
      const v = String(value);
      const className =
        v === "Approved"
          ? "bg-emerald-600 hover:bg-emerald-700 text-white"
          : v === "Pending"
            ? "bg-amber-500 hover:bg-amber-600 text-white"
            : "";
      const variant = v === "Rejected" ? "destructive" : "default";
      return (
        <Badge variant={variant} className={className}>
          {v}
        </Badge>
      );
    },
  },
  { key: "filedOn", label: "Filed On" },
  { key: "resolvedOn", label: "Resolved On" },
];

const addFields: FieldDef[] = [
  {
    key: "itemTitle",
    label: "Item Title",
    placeholder: "Which item is being claimed?",
  },
  { key: "claimedBy", label: "Claimed By", placeholder: "Claimer name" },
  {
    key: "claimerEmail",
    label: "Email",
    type: "email",
    placeholder: "claimer@email.com",
  },
  { key: "status", label: "Status", type: "select", options: claimStatuses },
];

export default function ClaimsPage() {
  return (
    <DataTable<Claim>
      title="Claims"
      description="Manage all item claims filed by users."
      columns={columns}
      data={placeholderClaims}
      addFields={addFields}
      searchableKeys={["itemTitle", "claimedBy", "claimerEmail", "status"]}
    />
  );
}
