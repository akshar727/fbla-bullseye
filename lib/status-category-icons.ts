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
