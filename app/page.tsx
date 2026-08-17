"use client";

import React, { useState } from "react";
import { useExpenseTracker } from "@/hooks/useExpenseTracker";
import { Header } from "@/components/Header";
import { MetricCards } from "@/components/MetricCards";
import { Visualizations } from "@/components/Visualizations";
import { ExpenseList } from "@/components/ExpenseList";
import { ExpenseForm } from "@/components/ExpenseForm";
import { CategoryManager } from "@/components/CategoryManager";
import { ExportImportModal } from "@/components/ExportImportModal";
import { Expense } from "@/types/expense";
import { Heart, ShieldCheck, Sparkles } from "lucide-react";

export default function TrackerPage() {
  const {
    isLoaded,
    categories,
    filter,
    setFilter,
    filteredExpenses,
    metrics,
    weeklyChartData,
    monthlyCategoryChartData,
    addExpense,
    updateExpense,
    deleteExpense,
    addCategory,
    updateCategory,
    deleteCategory,
    resetAllData,
    refreshFromStorage,
  } = useExpenseTracker();

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [isCategoryManagerOpen, setIsCategoryManagerOpen] = useState(false);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);

  // Form Handlers
  const handleOpenAddForm = () => {
    setEditingExpense(null);
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (expense: Expense) => {
    setEditingExpense(expense);
    setIsFormOpen(true);
  };

  const handleFormSubmit = (data: Omit<Expense, "id" | "createdAt">) => {
    if (editingExpense) {
      updateExpense(editingExpense.id, data);
    } else {
      addExpense(data);
    }
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="h-10 w-10 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin mb-4" />
        <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 animate-pulse">
          Loading your daily expense workspace...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {/* Header Navbar */}
      <Header
        onOpenExpenseForm={handleOpenAddForm}
        onOpenCategoryManager={() => setIsCategoryManagerOpen(true)}
        onOpenBackupModal={() => setIsBackupModalOpen(true)}
      />

      {/* Main Content Dashboard */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Top Banner / Welcome Prompt */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 border border-indigo-100 dark:border-indigo-900/40">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Daily Financial Overview
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Track everyday purchases, stay on budget, and analyze categorical habits.
              </p>
            </div>
          </div>
          <button
            onClick={handleOpenAddForm}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-50 dark:hover:bg-slate-800 transition-colors"
          >
            + Quick Add Transaction
          </button>
        </div>

        {/* 1. Summary Metrics Cards */}
        <MetricCards metrics={metrics} />

        {/* 2. Visualizations Section (Weekly Bar Chart & Monthly Donut Chart) */}
        <Visualizations
          weeklyData={weeklyChartData}
          monthlyData={monthlyCategoryChartData}
        />

        {/* 3. Transaction Expense List */}
        <ExpenseList
          expenses={filteredExpenses}
          categories={categories}
          filter={filter}
          setFilter={setFilter}
          onEditExpense={handleOpenEditForm}
          onDeleteExpense={deleteExpense}
          onOpenAddExpense={handleOpenAddForm}
        />
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-200 dark:border-slate-800 py-6 mt-12 bg-white/50 dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1">
            <span>Built with Next.js, Tailwind CSS & Recharts.</span>
            <span title="Vercel Ready & LocalStorage Persisted">
              <ShieldCheck className="h-4 w-4 text-emerald-500 inline ml-1" />
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span>Ready for Vercel Deployment</span>
            <span>•</span>
            <button
              onClick={() => setIsBackupModalOpen(true)}
              className="hover:underline text-indigo-600 dark:text-indigo-400 font-semibold"
            >
              Export JSON Backup
            </button>
          </div>
        </div>
      </footer>

      {/* Modals & Dialogs */}
      <ExpenseForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingExpense(null);
        }}
        onSubmit={handleFormSubmit}
        categories={categories}
        editingExpense={editingExpense}
      />

      <CategoryManager
        isOpen={isCategoryManagerOpen}
        onClose={() => setIsCategoryManagerOpen(false)}
        categories={categories}
        onAddCategory={addCategory}
        onUpdateCategory={updateCategory}
        onDeleteCategory={deleteCategory}
      />

      <ExportImportModal
        isOpen={isBackupModalOpen}
        onClose={() => setIsBackupModalOpen(false)}
        onDataImported={refreshFromStorage}
        onDataReset={resetAllData}
      />
    </div>
  );
}
