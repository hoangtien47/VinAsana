import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date?: Date | string | null): string {
  if (!date) return "";
  return format(new Date(date), "MMM d, yyyy");
}

export function formatDateTime(date?: Date | string | null): string {
  if (!date) return "";
  return format(new Date(date), "MMM d, yyyy h:mm a");
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

export function getInitials(name: string): string {
  if (!name) return "";
  const parts = name.split(" ");
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

export function getStatusColor(status: string): string {
  const statusColors: Record<string, string> = {
    backlog: "bg-gray-400",
    todo: "bg-blue-400",
    in_progress: "bg-yellow-400", 
    review: "bg-purple-400",
    done: "bg-green-400",
  };
  
  return statusColors[status] || "bg-gray-400";
}

export function getPriorityColor(priority: string): string {
  const priorityColors: Record<string, string> = {
    low: "bg-blue-400",
    medium: "bg-yellow-400",
    high: "bg-orange-400",
    urgent: "bg-red-400",
  };
  
  return priorityColors[priority] || "bg-gray-400";
}

export function getRandomColor(): string {
  const colors = [
    "bg-blue-500",
    "bg-green-500",
    "bg-yellow-500",
    "bg-purple-500",
    "bg-pink-500",
    "bg-indigo-500",
    "bg-red-500",
    "bg-teal-500",
  ];
  
  return colors[Math.floor(Math.random() * colors.length)];
}

export function truncateText(text: string, maxLength: number): string {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
}
