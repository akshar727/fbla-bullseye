import {
  CircleAlert,
  CheckCircle,
  BadgeCheck,
  Search,
  Smartphone,
  Shirt,
  Backpack,
  FileText,
  User,
  type LucideIcon,
} from "lucide-react";

/** Tailwind color classes for each item status */
export const STATUS_COLORS: Record<string, string> = {
  unclaimed: "bg-red-100 text-red-700",
  found: "bg-green-100 text-green-700",
  claimed: "bg-blue-100 text-blue-700",
  lost: "bg-orange-100 text-orange-700",
};

/** Tailwind color classes for each item category */
export const CATEGORY_BADGE_COLORS: Record<string, string> = {
  electronics: "bg-blue-100 text-blue-700",
  clothing: "bg-pink-100 text-pink-700",
  bags: "bg-amber-100 text-amber-700",
  documents: "bg-emerald-100 text-emerald-700",
  personal: "bg-violet-100 text-violet-700",
};

/** Icon for each item status */
export const STATUS_ICONS: Record<string, LucideIcon> = {
  unclaimed: CircleAlert,
  found: CheckCircle,
  claimed: BadgeCheck,
  lost: Search,
};

/** Icon for each item category */
export const CATEGORY_ICONS: Record<string, LucideIcon> = {
  electronics: Smartphone,
  clothing: Shirt,
  bags: Backpack,
  documents: FileText,
  personal: User,
};
