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

// Timestamp utility functions for API compatibility
// Backend expects 10-digit Unix timestamps (seconds), frontend uses 13-digit timestamps (milliseconds)

/**
 * Convert a Date object or ISO string to 10-digit Unix timestamp (seconds) for API calls
 * @param date Date object, ISO string, or null/undefined
 * @returns 10-digit Unix timestamp in seconds, or null if input is invalid
 */
export function toApiTimestamp(date: Date | string | null | undefined): number | null {
  if (!date) return null;
  
  try {
    const dateObj = date instanceof Date ? date : new Date(date);
    if (isNaN(dateObj.getTime())) return null;
    return Math.floor(dateObj.getTime() / 1000);
  } catch {
    return null;
  }
}

/**
 * Convert current time to 10-digit Unix timestamp (seconds) for API calls
 * @returns 10-digit Unix timestamp in seconds
 */
export function getCurrentApiTimestamp(): number {
  return Math.floor(Date.now() / 1000);
}

/**
 * Convert 10-digit Unix timestamp (seconds) from API to Date object for frontend use
 * @param timestamp 10-digit Unix timestamp in seconds
 * @returns Date object or null if timestamp is invalid
 */
export function fromApiTimestamp(timestamp: number | null | undefined): Date | null {
  if (!timestamp || timestamp <= 0) return null;
  
  try {
    // Convert seconds to milliseconds by multiplying by 1000
    return new Date(timestamp * 1000);
  } catch {
    return null;
  }
}

/**
 * Add seconds to current time and return as 10-digit Unix timestamp for API calls
 * @param seconds Number of seconds to add
 * @returns 10-digit Unix timestamp in seconds
 */
export function addSecondsToCurrentTime(seconds: number): number {
  return getCurrentApiTimestamp() + seconds;
}

/**
 * Convert a date string (like from date input) to 10-digit Unix timestamp for API calls
 * @param dateString Date string (YYYY-MM-DD format)
 * @returns 10-digit Unix timestamp in seconds, or null if invalid
 */
export function dateStringToApiTimestamp(dateString: string | null | undefined): number | null {
  if (!dateString) return null;
  return toApiTimestamp(new Date(dateString));
}
