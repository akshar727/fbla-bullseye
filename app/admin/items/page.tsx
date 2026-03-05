"use client";

import { Badge } from "@/components/ui/badge";
import {
  DataTable,
  type ColumnDef,
  type FieldDef,
} from "@/components/admin/data-table";

interface Item {
  id: string;
  title: string;
  category: string;
  location: string;
  status: string;
  uploadedBy: string;
  date: string;
}

const categories = [
  "Electronics",
  "Clothing",
  "Accessories",
  "Bags",
  "Keys",
  "Books",
  "Other",
];
const locations = [
  "Main Library",
  "Student Center",
  "Gym",
  "Parking Lot A",
  "Cafeteria",
  "Bus Stop 3",
  "Science Building",
];
const statuses = ["Available", "Claimed", "Expired"];

const placeholderItems: Item[] = Array.from({ length: 15 }, (_, i) => ({
  id: `itm_${String(i + 1).padStart(3, "0")}`,
  title: [
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
  category: categories[i % categories.length],
  location: locations[i % locations.length],
  status: statuses[i % statuses.length],
  uploadedBy: [
    "Alice Johnson",
    "Bob Smith",
    "Carol White",
    "David Brown",
    "Emma Davis",
    "Frank Wilson",
    "Grace Lee",
    "Henry Taylor",
    "Iris Martinez",
    "Jack Anderson",
    "Kate Thomas",
    "Leo Garcia",
    "Mia Robinson",
    "Noah Clark",
    "Olivia Lewis",
  ][i],
  date: `2025-${String((i % 12) + 1).padStart(2, "0")}-${String((i % 28) + 1).padStart(2, "0")}`,
}));

const columns: ColumnDef<Item>[] = [
  { key: "id", label: "ID" },
  { key: "title", label: "Item Title" },
  {
    key: "category",
    label: "Category",
    render: (value) => <Badge variant="outline">{String(value)}</Badge>,
  },
  { key: "location", label: "Location" },
  {
    key: "status",
    label: "Status",
    render: (value) => {
      const v = String(value);
      const className =
        v === "Available"
          ? "bg-emerald-600 hover:bg-emerald-700 text-white"
          : v === "Claimed"
            ? "bg-blue-600 hover:bg-blue-700 text-white"
            : "";
      const variant = v === "Expired" ? "destructive" : "default";
      return (
        <Badge variant={variant} className={className}>
          {v}
        </Badge>
      );
    },
  },
  { key: "uploadedBy", label: "Uploaded By" },
  { key: "date", label: "Date" },
];

const addFields: FieldDef[] = [
  { key: "title", label: "Item Title", placeholder: "e.g. Blue Thermos" },
  { key: "category", label: "Category", type: "select", options: categories },
  { key: "location", label: "Location", placeholder: "Where was it found?" },
  { key: "status", label: "Status", type: "select", options: statuses },
  { key: "uploadedBy", label: "Uploaded By", placeholder: "User name" },
];

export default function ItemsPage() {
  return (
    <DataTable<Item>
      title="Items"
      description="Manage all found items uploaded to the platform."
      columns={columns}
      data={placeholderItems}
      addFields={addFields}
      searchableKeys={["title", "category", "location", "uploadedBy"]}
    />
  );
}
