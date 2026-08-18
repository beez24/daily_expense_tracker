/**
 * lib/db.ts
 * All async Supabase database operations for expenses and categories.
 * Row Level Security on the DB enforces that users only access their own data.
 */

import { supabase } from "./supabase";
import { Category, Expense } from "@/types/expense";
import { DEFAULT_CATEGORIES } from "./constants";

// ─── DB Row Types (snake_case from Postgres) ─────────────────────────────────

interface DbCategory {
  id: string;
  user_id: string;
  name: string;
  color: string;
  icon: string;
  is_default: boolean;
  created_at: string;
}

interface DbExpense {
  id: string;
  user_id: string;
  amount: number;
  date: string;
  description: string | null;
  category_id: string | null;
  created_at: string;
}

// ─── Mappers ─────────────────────────────────────────────────────────────────

function mapCategory(row: DbCategory): Category {
  return {
    id: row.id,
    name: row.name,
    color: row.color,
    icon: row.icon,
    isDefault: row.is_default,
  };
}

function mapExpense(row: DbExpense): Expense {
  return {
    id: row.id,
    amount: Number(row.amount),
    date: row.date,
    description: row.description ?? undefined,
    categoryId: row.category_id ?? "",
    createdAt: row.created_at,
  };
}

// ─── Categories ───────────────────────────────────────────────────────────────

export async function dbGetCategories(userId: string): Promise<Category[]> {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("dbGetCategories error:", error.message);
    return [];
  }
  return (data as DbCategory[]).map(mapCategory);
}

export async function dbSeedDefaultCategories(userId: string): Promise<Category[]> {
  const rows = DEFAULT_CATEGORIES.map((cat) => ({
    user_id: userId,
    name: cat.name,
    color: cat.color,
    icon: cat.icon,
    is_default: true,
  }));

  const { data, error } = await supabase
    .from("categories")
    .insert(rows)
    .select();

  if (error) {
    console.error("dbSeedDefaultCategories error:", error.message);
    return [];
  }
  return (data as DbCategory[]).map(mapCategory);
}

export async function dbAddCategory(
  userId: string,
  category: Omit<Category, "id">
): Promise<Category | null> {
  const { data, error } = await supabase
    .from("categories")
    .insert({
      user_id: userId,
      name: category.name,
      color: category.color,
      icon: category.icon,
      is_default: category.isDefault ?? false,
    })
    .select()
    .single();

  if (error) {
    console.error("dbAddCategory error:", error.message);
    return null;
  }
  return mapCategory(data as DbCategory);
}

export async function dbUpdateCategory(
  id: string,
  updates: Partial<Omit<Category, "id">>
): Promise<Category | null> {
  const dbUpdates: Record<string, unknown> = {};
  if (updates.name !== undefined) dbUpdates.name = updates.name;
  if (updates.color !== undefined) dbUpdates.color = updates.color;
  if (updates.icon !== undefined) dbUpdates.icon = updates.icon;
  if (updates.isDefault !== undefined) dbUpdates.is_default = updates.isDefault;

  const { data, error } = await supabase
    .from("categories")
    .update(dbUpdates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("dbUpdateCategory error:", error.message);
    return null;
  }
  return mapCategory(data as DbCategory);
}

export async function dbDeleteCategory(id: string): Promise<boolean> {
  const { error } = await supabase
    .from("categories")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("dbDeleteCategory error:", error.message);
    return false;
  }
  return true;
}

// ─── Expenses ─────────────────────────────────────────────────────────────────

export async function dbGetExpenses(userId: string): Promise<Expense[]> {
  const { data, error } = await supabase
    .from("expenses")
    .select("*")
    .eq("user_id", userId)
    .order("date", { ascending: false });

  if (error) {
    console.error("dbGetExpenses error:", error.message);
    return [];
  }
  return (data as DbExpense[]).map(mapExpense);
}

export async function dbAddExpense(
  userId: string,
  expense: Omit<Expense, "id" | "createdAt">
): Promise<Expense | null> {
  const { data, error } = await supabase
    .from("expenses")
    .insert({
      user_id: userId,
      amount: expense.amount,
      date: expense.date,
      description: expense.description ?? null,
      category_id: expense.categoryId || null,
    })
    .select()
    .single();

  if (error) {
    console.error("dbAddExpense error:", error.message);
    return null;
  }
  return mapExpense(data as DbExpense);
}

export async function dbUpdateExpense(
  id: string,
  updates: Partial<Omit<Expense, "id" | "createdAt">>
): Promise<Expense | null> {
  const dbUpdates: Record<string, unknown> = {};
  if (updates.amount !== undefined) dbUpdates.amount = updates.amount;
  if (updates.date !== undefined) dbUpdates.date = updates.date;
  if (updates.description !== undefined) dbUpdates.description = updates.description ?? null;
  if (updates.categoryId !== undefined) dbUpdates.category_id = updates.categoryId || null;

  const { data, error } = await supabase
    .from("expenses")
    .update(dbUpdates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("dbUpdateExpense error:", error.message);
    return null;
  }
  return mapExpense(data as DbExpense);
}

export async function dbDeleteExpense(id: string): Promise<boolean> {
  const { error } = await supabase
    .from("expenses")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("dbDeleteExpense error:", error.message);
    return false;
  }
  return true;
}

// ─── Bulk Operations ──────────────────────────────────────────────────────────

/** Bulk-insert expenses (e.g. from CSV import). Appends to existing data. */
export async function dbBulkAddExpenses(
  userId: string,
  expenses: Omit<Expense, "id" | "createdAt">[]
): Promise<{ inserted: number; error?: string }> {
  if (expenses.length === 0) return { inserted: 0 };

  const rows = expenses.map((e) => ({
    user_id: userId,
    amount: e.amount,
    date: e.date,
    description: e.description ?? null,
    category_id: e.categoryId || null,
  }));

  const { data, error } = await supabase
    .from("expenses")
    .insert(rows)
    .select();

  if (error) {
    console.error("dbBulkAddExpenses error:", error.message);
    return { inserted: 0, error: error.message };
  }
  return { inserted: data?.length ?? 0 };
}

/** Reset: delete all user data and re-seed default categories. */
export async function dbResetUserData(userId: string): Promise<Category[]> {
  await supabase.from("expenses").delete().eq("user_id", userId);
  await supabase.from("categories").delete().eq("user_id", userId);
  return dbSeedDefaultCategories(userId);
}

/** Bulk-insert categories from a JSON restore (clears existing first). */
export async function dbRestoreBackup(
  userId: string,
  categories: Omit<Category, "id">[],
  expenses: Omit<Expense, "id" | "createdAt">[]
): Promise<{ categories: Category[]; expenses: Expense[] }> {
  // Delete existing
  await supabase.from("expenses").delete().eq("user_id", userId);
  await supabase.from("categories").delete().eq("user_id", userId);

  // Re-insert categories
  const catRows = categories.map((c) => ({
    user_id: userId,
    name: c.name,
    color: c.color,
    icon: c.icon,
    is_default: c.isDefault ?? false,
  }));

  const { data: catData, error: catErr } = await supabase
    .from("categories")
    .insert(catRows)
    .select();

  if (catErr) {
    console.error("dbRestoreBackup categories error:", catErr.message);
    return { categories: [], expenses: [] };
  }

  const newCategories = (catData as DbCategory[]).map(mapCategory);

  // Build a name→new id map for expense category_id remapping
  const nameToId = new Map(newCategories.map((c) => [c.name.toLowerCase(), c.id]));

  const expRows = expenses.map((e) => ({
    user_id: userId,
    amount: e.amount,
    date: e.date,
    description: e.description ?? null,
    category_id: nameToId.get(e.categoryId?.toLowerCase()) ?? null,
  }));

  const { data: expData, error: expErr } = await supabase
    .from("expenses")
    .insert(expRows)
    .select();

  if (expErr) {
    console.error("dbRestoreBackup expenses error:", expErr.message);
    return { categories: newCategories, expenses: [] };
  }

  return {
    categories: newCategories,
    expenses: (expData as DbExpense[]).map(mapExpense),
  };
}
