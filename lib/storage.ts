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
