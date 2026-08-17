import { Category, Expense } from "@/types/expense";
import { DEFAULT_CATEGORIES, SEED_EXPENSES } from "./constants";

const EXPENSES_PREFIX = "daily_expense_tracker_expenses_";
const CATEGORIES_PREFIX = "daily_expense_tracker_categories_";

export function getStoredExpenses(userId: string = "user-demo-101"): Expense[] {
  if (typeof window === "undefined") return SEED_EXPENSES;
  try {
    const key = EXPENSES_PREFIX + userId;
    const raw = localStorage.getItem(key);
    if (!raw) {
      // Seed default expenses for new account
      localStorage.setItem(key, JSON.stringify(SEED_EXPENSES));
      return SEED_EXPENSES;
    }
    return JSON.parse(raw);
  } catch (error) {
    console.error("Error reading expenses from LocalStorage:", error);
    return SEED_EXPENSES;
  }
}

export function saveStoredExpenses(expenses: Expense[], userId: string = "user-demo-101"): void {
  if (typeof window === "undefined") return;
  try {
    const key = EXPENSES_PREFIX + userId;
    localStorage.setItem(key, JSON.stringify(expenses));
  } catch (error) {
    console.error("Error saving expenses to LocalStorage:", error);
  }
}

export function getStoredCategories(userId: string = "user-demo-101"): Category[] {
  if (typeof window === "undefined") return DEFAULT_CATEGORIES;
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

export function saveStoredCategories(categories: Category[], userId: string = "user-demo-101"): void {
  if (typeof window === "undefined") return;
  try {
    const key = CATEGORIES_PREFIX + userId;
    localStorage.setItem(key, JSON.stringify(categories));
  } catch (error) {
    console.error("Error saving categories to LocalStorage:", error);
  }
}

export function exportBackupData(userId: string = "user-demo-101"): string {
  const data = {
    version: 1,
    exportedAt: new Date().toISOString(),
    userId,
    categories: getStoredCategories(userId),
    expenses: getStoredExpenses(userId),
  };
  return JSON.stringify(data, null, 2);
}

export function importBackupData(jsonString: string, userId: string = "user-demo-101"): { success: boolean; message: string } {
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

export function resetToSeedData(userId: string = "user-demo-101"): { expenses: Expense[]; categories: Category[] } {
  if (typeof window !== "undefined") {
    const expKey = EXPENSES_PREFIX + userId;
    const catKey = CATEGORIES_PREFIX + userId;
    localStorage.setItem(expKey, JSON.stringify(SEED_EXPENSES));
    localStorage.setItem(catKey, JSON.stringify(DEFAULT_CATEGORIES));
  }
  return { expenses: SEED_EXPENSES, categories: DEFAULT_CATEGORIES };
}
