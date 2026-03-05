import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return "—";
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateString));
}

export function getRiskZoneColor(zone: string | null): string {
  switch (zone) {
    case "low": return "text-green-600 bg-green-50";
    case "moderate": return "text-yellow-600 bg-yellow-50";
    case "high": return "text-orange-600 bg-orange-50";
    case "critical": return "text-red-600 bg-red-50";
    default: return "text-gray-500 bg-gray-50";
  }
}
