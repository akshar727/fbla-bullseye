import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const spamColor = (score: number) => {
  if (score >= 0.85) return "bg-red-100 text-red-800";
  if (score >= 0.7) return "bg-orange-100 text-orange-800";
  if (score <= 0.4) return "bg-green-100 text-green-700";
  return "bg-yellow-100 text-yellow-700";
};
