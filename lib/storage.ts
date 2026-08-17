import { Category, Expense } from "@/types/expense";
import { DEFAULT_CATEGORIES, SEED_EXPENSES } from "./constants";

const EXPENSES_STORAGE_KEY = "daily_expense_tracker_items_v1";
const CATEGORIES_STORAGE_KEY = "daily_expense_tracker_categories_v1";

export function getStoredExpenses(): Expense[] {
  if (typeof window === "undefined") return SEED_EXPENSES;
  try {
    const raw = localStorage.getItem(EXPENSES_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(EXPENSES_STORAGE_KEY, JSON.stringify(SEED_EXPENSES));
      return SEED_EXPENSES;
    }
    return JSON.parse(raw);
  } catch (error) {
    console.error("Error reading expenses from LocalStorage:", error);
    return SEED_EXPENSES;
  }
}

export function saveStoredExpenses(expenses: Expense[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(EXPENSES_STORAGE_KEY, JSON.stringify(expenses));
  } catch (error) {
    console.error("Error saving expenses to LocalStorage:", error);
  }
}

export function getStoredCategories(): Category[] {
  if (typeof window === "undefined") return DEFAULT_CATEGORIES;
  try {
    const raw = localStorage.getItem(CATEGORIES_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(DEFAULT_CATEGORIES));
      return DEFAULT_CATEGORIES;
    }
    return JSON.parse(raw);
  } catch (error) {
    console.error("Error reading categories from LocalStorage:", error);
    return DEFAULT_CATEGORIES;
  }
}

export function saveStoredCategories(categories: Category[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(categories));
  } catch (error) {
    console.error("Error saving categories to LocalStorage:", error);
  }
}

export function exportBackupData(): string {
  const data = {
    version: 1,
    exportedAt: new Date().toISOString(),
    categories: getStoredCategories(),
    expenses: getStoredExpenses(),
  };
  return JSON.stringify(data, null, 2);
}

export function importBackupData(jsonString: string): { success: boolean; message: string } {
  try {
    const data = JSON.parse(jsonString);
    if (!data.expenses || !Array.isArray(data.expenses) || !data.categories || !Array.isArray(data.categories)) {
      return { success: false, message: "Invalid backup format. Required fields 'expenses' or 'categories' missing." };
    }
    saveStoredExpenses(data.expenses);
    saveStoredCategories(data.categories);
    return { success: true, message: `Successfully imported ${data.expenses.length} expenses and ${data.categories.length} categories!` };
  } catch (error) {
    return { success: false, message: "Failed to parse JSON file." };
  }
}

export function resetToSeedData(): { expenses: Expense[]; categories: Category[] } {
  if (typeof window !== "undefined") {
    localStorage.setItem(EXPENSES_STORAGE_KEY, JSON.stringify(SEED_EXPENSES));
    localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(DEFAULT_CATEGORIES));
  }
  return { expenses: SEED_EXPENSES, categories: DEFAULT_CATEGORIES };
}
