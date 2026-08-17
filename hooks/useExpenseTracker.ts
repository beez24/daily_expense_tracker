"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Expense, Category, ExpenseFilter, SummaryMetrics, DaySpending, CategorySpending } from "@/types/expense";
import { getStoredExpenses, saveStoredExpenses, getStoredCategories, saveStoredCategories, resetToSeedData } from "@/lib/storage";
import { isDateInWeek, isDateInMonth, generateId } from "@/lib/utils";
import { startOfWeek, addDays, format, parseISO, isSameDay } from "date-fns";

export function useExpenseTracker(userId: string = "user-demo-101") {
  const [isLoaded, setIsLoaded] = useState(false);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [referenceDate, setReferenceDate] = useState<Date>(new Date("2026-08-15"));

  const [filter, setFilter] = useState<ExpenseFilter>({
    searchQuery: "",
    categoryId: "all",
    startDate: "",
    endDate: "",
    sortBy: "date-desc",
  });

  // Re-hydrate from LocalStorage when userId changes
  useEffect(() => {
    setIsLoaded(false);
    const storedExp = getStoredExpenses(userId);
    const storedCat = getStoredCategories(userId);
    setExpenses(storedExp);
    setCategories(storedCat);
    setIsLoaded(true);
  }, [userId]);

  // Save expenses on update
  const addExpense = useCallback((data: Omit<Expense, "id" | "createdAt">) => {
    const newExpense: Expense = {
      ...data,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    setExpenses((prev) => {
      const updated = [newExpense, ...prev];
      saveStoredExpenses(updated, userId);
      return updated;
    });
  }, [userId]);

  const updateExpense = useCallback((id: string, data: Partial<Omit<Expense, "id">>) => {
    setExpenses((prev) => {
      const updated = prev.map((item) => (item.id === id ? { ...item, ...data } : item));
      saveStoredExpenses(updated, userId);
      return updated;
    });
  }, [userId]);

  const deleteExpense = useCallback((id: string) => {
    setExpenses((prev) => {
      const updated = prev.filter((item) => item.id !== id);
      saveStoredExpenses(updated, userId);
      return updated;
    });
  }, [userId]);

  // Category management
  const addCategory = useCallback((data: Omit<Category, "id">) => {
    const newCategory: Category = {
      ...data,
      id: "cat-" + Math.random().toString(36).substring(2, 9),
    };
    setCategories((prev) => {
      const updated = [...prev, newCategory];
      saveStoredCategories(updated, userId);
      return updated;
    });
  }, [userId]);

  const updateCategory = useCallback((id: string, data: Partial<Omit<Category, "id">>) => {
    setCategories((prev) => {
      const updated = prev.map((cat) => (cat.id === id ? { ...cat, ...data } : cat));
      saveStoredCategories(updated, userId);
      return updated;
    });
  }, [userId]);

  const deleteCategory = useCallback((id: string, reassignCategoryId?: string) => {
    const targetReassign = reassignCategoryId || "cat-other";
    setCategories((prev) => {
      const updatedCat = prev.filter((cat) => cat.id !== id);
      saveStoredCategories(updatedCat, userId);
      return updatedCat;
    });
    // Reassign affected expenses
    setExpenses((prev) => {
      const updatedExp = prev.map((exp) => (exp.categoryId === id ? { ...exp, categoryId: targetReassign } : exp));
      saveStoredExpenses(updatedExp, userId);
      return updatedExp;
    });
  }, [userId]);

  const resetAllData = useCallback(() => {
    const seed = resetToSeedData(userId);
    setExpenses(seed.expenses);
    setCategories(seed.categories);
  }, [userId]);

  const refreshFromStorage = useCallback(() => {
    setExpenses(getStoredExpenses(userId));
    setCategories(getStoredCategories(userId));
  }, [userId]);

  // Filtered expenses list
  const filteredExpenses = useMemo(() => {
    return expenses
      .filter((exp) => {
        // Search query filter (matches category name or description)
        if (filter.searchQuery.trim()) {
          const query = filter.searchQuery.toLowerCase();
          const categoryObj = categories.find((c) => c.id === exp.categoryId);
          const categoryName = categoryObj ? categoryObj.name.toLowerCase() : "";
          const desc = (exp.description || "").toLowerCase();
          const amountStr = exp.amount.toString();
          const matches = categoryName.includes(query) || desc.includes(query) || amountStr.includes(query);
          if (!matches) return false;
        }

        // Category filter
        if (filter.categoryId !== "all" && exp.categoryId !== filter.categoryId) {
          return false;
        }

        // Date Range filters
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

  // Derived Metrics
  const metrics: SummaryMetrics = useMemo(() => {
    let weekTotal = 0;
    let monthTotal = 0;
    const categoryTotalsMonth: Record<string, number> = {};

    expenses.forEach((exp) => {
      if (isDateInWeek(exp.date, referenceDate)) {
        weekTotal += exp.amount;
      }
      if (isDateInMonth(exp.date, referenceDate)) {
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
          highestCatObj = {
            id: cat.id,
            name: cat.name,
            amount: amount,
            color: cat.color,
            icon: cat.icon,
          };
        }
      }
    });

    const dailyAverageThisWeek = weekTotal > 0 ? weekTotal / 7 : 0;

    return {
      totalThisWeek: weekTotal,
      totalThisMonth: monthTotal,
      dailyAverageThisWeek,
      highestCategory: highestCatObj,
      totalExpensesCount: expenses.length,
    };
  }, [expenses, categories, referenceDate]);

  return {
    isLoaded,
    expenses,
    categories,
    filter,
    setFilter,
    filteredExpenses,
    metrics,
    referenceDate,
    setReferenceDate,
    addExpense,
    updateExpense,
    deleteExpense,
    addCategory,
    updateCategory,
    deleteCategory,
    resetAllData,
    refreshFromStorage,
  };
}
