"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Expense,
  Category,
  ExpenseFilter,
  SummaryMetrics,
} from "@/types/expense";
import {
  dbGetCategories,
  dbSeedDefaultCategories,
  dbAddCategory,
  dbUpdateCategory,
  dbDeleteCategory,
  dbGetExpenses,
  dbAddExpense,
  dbUpdateExpense,
  dbDeleteExpense,
  dbResetUserData,
  dbBulkAddExpenses,
  dbRestoreBackup,
} from "@/lib/db";
import { isDateInWeek, isDateInMonth } from "@/lib/utils";

export function useExpenseTracker(userId: string = "") {
  const [isLoaded, setIsLoaded] = useState(false);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [filter, setFilter] = useState<ExpenseFilter>({
    searchQuery: "",
    categoryId: "all",
    startDate: "",
    endDate: "",
    sortBy: "date-desc",
  });

  // ─── Reset immediately when userId changes ───────────────────────────────
  // This ensures the loading spinner always shows while data is fetching,
  // preventing stale categories/expenses from a previous session being visible.
  useEffect(() => {
    setIsLoaded(false);
    setExpenses([]);
    setCategories([]);
  }, [userId]);

  // ─── Load from Supabase on mount / userId change ─────────────────────────
  const loadData = useCallback(async () => {
    if (!userId) return;

    // Abort flag: if userId changes again before this call finishes,
    // the stale result is discarded and does not overwrite fresh data.
    let cancelled = false;

    setIsLoaded(false);

    const [cats, exps] = await Promise.all([
      dbGetCategories(userId),
      dbGetExpenses(userId),
    ]);

    if (cancelled) return;

    // Only seed defaults for genuinely new users (no categories in DB).
    // dbSeedDefaultCategories has its own idempotency guard inside the DB.
    if (cats.length === 0) {
      const seeded = await dbSeedDefaultCategories(userId);
      if (cancelled) return;
      setCategories(seeded.length > 0 ? seeded : []);
    } else {
      setCategories(cats);
    }

    setExpenses(exps);
    setIsLoaded(true);

    return () => { cancelled = true; };
  }, [userId]);

  useEffect(() => {
    loadData();
  }, [loadData]);


  // ─── Expense CRUD ─────────────────────────────────────────────────────────
  const addExpense = useCallback(async (data: Omit<Expense, "id" | "createdAt">) => {
    const newExp = await dbAddExpense(userId, data);
    if (newExp) setExpenses((prev) => [newExp, ...prev]);
  }, [userId]);

  const updateExpense = useCallback(async (id: string, data: Partial<Omit<Expense, "id">>) => {
    const updated = await dbUpdateExpense(id, data);
    if (updated) {
      setExpenses((prev) => prev.map((e) => (e.id === id ? updated : e)));
    }
  }, []);

  const deleteExpense = useCallback(async (id: string) => {
    const ok = await dbDeleteExpense(id);
    if (ok) setExpenses((prev) => prev.filter((e) => e.id !== id));
  }, []);

  // ─── Category CRUD ────────────────────────────────────────────────────────
  const addCategory = useCallback(async (data: Omit<Category, "id">) => {
    const newCat = await dbAddCategory(userId, data);
    if (newCat) setCategories((prev) => [...prev, newCat]);
  }, [userId]);

  const updateCategory = useCallback(async (id: string, data: Partial<Omit<Category, "id">>) => {
    const updated = await dbUpdateCategory(id, data);
    if (updated) {
      setCategories((prev) => prev.map((c) => (c.id === id ? updated : c)));
    }
  }, []);

  const deleteCategory = useCallback(async (id: string, reassignCategoryId?: string) => {
    const ok = await dbDeleteCategory(id);
    if (!ok) return;

    setCategories((prev) => prev.filter((c) => c.id !== id));

    // Reassign affected expenses in local state (DB handles via ON DELETE SET NULL)
    const fallbackId = reassignCategoryId ?? categories[0]?.id ?? "";
    setExpenses((prev) =>
      prev.map((e) => (e.categoryId === id ? { ...e, categoryId: fallbackId } : e))
    );
  }, [categories]);

  // ─── Bulk / Reset ─────────────────────────────────────────────────────────
  const bulkAddExpenses = useCallback(async (
    expensesToAdd: Omit<Expense, "id" | "createdAt">[]
  ): Promise<{ inserted: number; error?: string }> => {
    const result = await dbBulkAddExpenses(userId, expensesToAdd);
    if (result.inserted > 0) {
      // Reload to get all new rows with real UUIDs
      const fresh = await dbGetExpenses(userId);
      setExpenses(fresh);
    }
    return result;
  }, [userId]);

  const resetAllData = useCallback(async () => {
    const seeded = await dbResetUserData(userId);
    setCategories(seeded);
    setExpenses([]);
  }, [userId]);

  const refreshFromStorage = useCallback(async () => {
    await loadData();
  }, [loadData]);

  const restoreBackup = useCallback(async (
    backupCategories: Omit<Category, "id">[],
    backupExpenses: Omit<Expense, "id" | "createdAt">[]
  ) => {
    const result = await dbRestoreBackup(userId, backupCategories, backupExpenses);
    setCategories(result.categories);
    setExpenses(result.expenses);
  }, [userId]);

  // ─── Filtered Expenses ────────────────────────────────────────────────────
  const filteredExpenses = useMemo(() => {
    return expenses
      .filter((exp) => {
        if (filter.searchQuery.trim()) {
          const query = filter.searchQuery.toLowerCase();
          const cat = categories.find((c) => c.id === exp.categoryId);
          const catName = cat ? cat.name.toLowerCase() : "";
          const desc = (exp.description || "").toLowerCase();
          if (!catName.includes(query) && !desc.includes(query) && !exp.amount.toString().includes(query)) {
            return false;
          }
        }
        if (filter.categoryId !== "all" && exp.categoryId !== filter.categoryId) return false;
        if (filter.startDate && exp.date < filter.startDate) return false;
        if (filter.endDate && exp.date > filter.endDate) return false;
        return true;
      })
      .sort((a, b) => {
        if (filter.sortBy === "date-desc") return b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt);
        if (filter.sortBy === "date-asc") return a.date.localeCompare(b.date) || a.createdAt.localeCompare(b.createdAt);
        if (filter.sortBy === "amount-desc") return b.amount - a.amount;
        if (filter.sortBy === "amount-asc") return a.amount - b.amount;
        return 0;
      });
  }, [expenses, categories, filter]);

  // ─── Summary Metrics ──────────────────────────────────────────────────────
  const today = new Date();

  const metrics: SummaryMetrics = useMemo(() => {
    let weekTotal = 0;
    let monthTotal = 0;
    const categoryTotalsMonth: Record<string, number> = {};

    expenses.forEach((exp) => {
      if (isDateInWeek(exp.date, today)) weekTotal += exp.amount;
      if (isDateInMonth(exp.date, today)) {
        monthTotal += exp.amount;
        categoryTotalsMonth[exp.categoryId] = (categoryTotalsMonth[exp.categoryId] || 0) + exp.amount;
      }
    });

    let highestCatObj: SummaryMetrics["highestCategory"] = null;
    let maxAmount = 0;
    Object.entries(categoryTotalsMonth).forEach(([catId, amount]) => {
      if (amount > maxAmount) {
        maxAmount = amount;
        const cat = categories.find((c) => c.id === catId);
        if (cat) {
          highestCatObj = { id: cat.id, name: cat.name, amount, color: cat.color, icon: cat.icon };
        }
      }
    });

    return {
      totalThisWeek: weekTotal,
      totalThisMonth: monthTotal,
      dailyAverageThisWeek: weekTotal > 0 ? weekTotal / 7 : 0,
      highestCategory: highestCatObj,
      totalExpensesCount: expenses.length,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expenses, categories]);

  return {
    isLoaded,
    expenses,
    categories,
    filter,
    setFilter,
    filteredExpenses,
    metrics,
    addExpense,
    updateExpense,
    deleteExpense,
    addCategory,
    updateCategory,
    deleteCategory,
    bulkAddExpenses,
    resetAllData,
    refreshFromStorage,
    restoreBackup,
  };
}
