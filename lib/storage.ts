import { Category, Expense } from "@/types/expense";
import { DEFAULT_CATEGORIES } from "./constants";

const EXPENSES_PREFIX = "daily_expense_tracker_expenses_";
const CATEGORIES_PREFIX = "daily_expense_tracker_categories_";

export function getStoredExpenses(userId: string): Expense[] {
  if (typeof window === "undefined" || !userId) return [];
  try {
    const key = EXPENSES_PREFIX + userId;
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify([]));
      return [];
    }
    return JSON.parse(raw);
  } catch (error) {
    console.error("Error reading expenses from LocalStorage:", error);
    return [];
  }
}

export function saveStoredExpenses(expenses: Expense[], userId: string): void {
  if (typeof window === "undefined" || !userId) return;
  try {
    const key = EXPENSES_PREFIX + userId;
    localStorage.setItem(key, JSON.stringify(expenses));
  } catch (error) {
    console.error("Error saving expenses to LocalStorage:", error);
  }
}

export function getStoredCategories(userId: string): Category[] {
  if (typeof window === "undefined" || !userId) return DEFAULT_CATEGORIES;
  try {
    const key = CATEGORIES_PREFIX + userId;
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(DEFAULT_CATEGORIES));
      return DEFAULT_CATEGORIES;
    }
    return JSON.parse(raw);
  } catch (error) {
    console.error("Error reading categories from LocalStorage:", error);
    return DEFAULT_CATEGORIES;
  }
}

export function saveStoredCategories(categories: Category[], userId: string): void {
  if (typeof window === "undefined" || !userId) return;
  try {
    const key = CATEGORIES_PREFIX + userId;
    localStorage.setItem(key, JSON.stringify(categories));
  } catch (error) {
    console.error("Error saving categories to LocalStorage:", error);
  }
}

export function exportBackupData(userId: string): string {
  const categories = getStoredCategories(userId);
  const expenses = getStoredExpenses(userId);
  const data = {
    version: 1,
    exportedAt: new Date().toISOString(),
    userId,
    categories,
    expenses,
  };
  return JSON.stringify(data, null, 2);
}

export function importBackupData(jsonString: string, userId: string): { success: boolean; message: string } {
  try {
    const data = JSON.parse(jsonString);
    if (!data.expenses || !Array.isArray(data.expenses) || !data.categories || !Array.isArray(data.categories)) {
      return { success: false, message: "Invalid backup format. Required fields 'expenses' or 'categories' missing." };
    }
    saveStoredExpenses(data.expenses, userId);
    saveStoredCategories(data.categories, userId);
    return { success: true, message: `Successfully imported ${data.expenses.length} expenses and ${data.categories.length} categories!` };
  } catch (error) {
    return { success: false, message: "Failed to parse JSON file." };
  }
}

export function resetToSeedData(userId: string): { expenses: Expense[]; categories: Category[] } {
  if (typeof window !== "undefined" && userId) {
    const expKey = EXPENSES_PREFIX + userId;
    const catKey = CATEGORIES_PREFIX + userId;
    localStorage.setItem(expKey, JSON.stringify([]));
    localStorage.setItem(catKey, JSON.stringify(DEFAULT_CATEGORIES));
  }
  return { expenses: [], categories: DEFAULT_CATEGORIES };
}

// ─── CSV Helpers ────────────────────────────────────────────────────────────

export const CSV_TEMPLATE_HEADER = "date,description,amount,category";
export const CSV_TEMPLATE_EXAMPLE = [
  "2026-08-01,Grocery run,54.99,Food",
  "2026-08-02,Monthly gym membership,35.00,Health",
  "2026-08-03,Uber to school,12.50,Transport",
].join("\n");

export function exportExpensesCSV(userId: string): string {
  const expenses = getStoredExpenses(userId);
  const categories = getStoredCategories(userId);
  const catMap = new Map(categories.map((c) => [c.id, c.name]));

  const rows = expenses.map((exp) => {
    const catName = catMap.get(exp.categoryId) ?? exp.categoryId;
    const desc = (exp.description ?? "").replace(/,/g, ";"); // escape commas
    return `${exp.date},${desc},${exp.amount.toFixed(2)},${catName}`;
  });

  return [CSV_TEMPLATE_HEADER, ...rows].join("\n");
}

export function importExpensesCSV(
  csvString: string,
  userId: string
): { success: boolean; message: string; imported: number; skipped: number } {
  try {
    const categories = getStoredCategories(userId);
    const catLookup = new Map(categories.map((c) => [c.name.toLowerCase().trim(), c.id]));

    const lines = csvString
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);

    if (lines.length < 2) {
      return { success: false, message: "CSV file is empty or has no data rows.", imported: 0, skipped: 0 };
    }

    // Accept files with or without a header row
    const firstLine = lines[0].toLowerCase();
    const hasHeader =
      firstLine.startsWith("date") ||
      firstLine.startsWith("\"date\"");
    const dataLines = hasHeader ? lines.slice(1) : lines;

    const newExpenses: Expense[] = [];
    let skipped = 0;

    for (const line of dataLines) {
      // Handle quoted fields
      const cols = line.split(",").map((c) => c.trim().replace(/^"|"$/g, ""));
      if (cols.length < 3) { skipped++; continue; }

      const [rawDate, rawDesc, rawAmount, rawCat = ""] = cols;

      // Validate date (YYYY-MM-DD)
      const dateMatch = rawDate.match(/^(\d{4})-(\d{2})-(\d{2})$/);
      if (!dateMatch) { skipped++; continue; }

      // Validate amount
      const amount = parseFloat(rawAmount.replace(/[$£€,]/g, ""));
      if (isNaN(amount) || amount <= 0) { skipped++; continue; }

      // Resolve category (fallback to first category if unmatched)
      const categoryId =
        catLookup.get(rawCat.toLowerCase().trim()) ?? categories[0]?.id ?? "cat-other";

      const expense: Expense = {
        id: `csv-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        date: rawDate,
        description: rawDesc || undefined,
        amount,
        categoryId,
        createdAt: new Date().toISOString(),
      };

      newExpenses.push(expense);
    }

    if (newExpenses.length === 0) {
      return {
        success: false,
        message: `No valid rows found. ${skipped} row(s) skipped due to formatting issues.`,
        imported: 0,
        skipped,
      };
    }

    // Append to existing expenses (merge, not replace)
    const existing = getStoredExpenses(userId);
    saveStoredExpenses([...existing, ...newExpenses], userId);

    return {
      success: true,
      message: `Successfully imported ${newExpenses.length} transaction${newExpenses.length !== 1 ? "s" : ""}${skipped > 0 ? ` (${skipped} row${skipped !== 1 ? "s" : ""} skipped)` : ""}.`,
      imported: newExpenses.length,
      skipped,
    };
  } catch (err) {
    return { success: false, message: "Failed to parse CSV file.", imported: 0, skipped: 0 };
  }
}

