import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, parseISO, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isWithinInterval } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency: string = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDateLabel(dateStr: string, pattern: string = "MMM d, yyyy"): string {
  try {
    if (!dateStr) return "";
    const date = parseISO(dateStr);
    return format(date, pattern);
  } catch (error) {
    return dateStr;
  }
}

export function isDateInWeek(dateStr: string, referenceDate: Date = new Date()): boolean {
  try {
    const date = parseISO(dateStr);
    const start = startOfWeek(referenceDate, { weekStartsOn: 1 }); // Monday start
    const end = endOfWeek(referenceDate, { weekStartsOn: 1 });
    return isWithinInterval(date, { start, end });
  } catch (error) {
    return false;
  }
}

export function isDateInMonth(dateStr: string, referenceDate: Date = new Date()): boolean {
  try {
    const date = parseISO(dateStr);
    const start = startOfMonth(referenceDate);
    const end = endOfMonth(referenceDate);
    return isWithinInterval(date, { start, end });
  } catch (error) {
    return false;
  }
}

export function generateId(): string {
  return "id-" + Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
}
