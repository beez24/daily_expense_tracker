"use client";

import React, { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useExpenseTracker } from "@/hooks/useExpenseTracker";
import { Header } from "@/components/Header";
import { MetricCards } from "@/components/MetricCards";
import { Visualizations } from "@/components/Visualizations";
import { ExpenseList } from "@/components/ExpenseList";
import { ExpenseForm } from "@/components/ExpenseForm";
import { CategoryManager } from "@/components/CategoryManager";
import { ExportImportModal } from "@/components/ExportImportModal";
import { AuthView } from "@/components/AuthView";
import { Expense } from "@/types/expense";
import { Sparkles } from "lucide-react";

export default function TrackerPage() {
  const { user, isAuthenticated, isLoading: authLoading, login, signup, logout } = useAuth();
  const userId = user?.id ?? "";

  const {
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
    restoreBackup,
  } = useExpenseTracker(userId);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [isCategoryManagerOpen, setIsCategoryManagerOpen] = useState(false);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);

  // ─── Loading ──────────────────────────────────────────────────────────────
  if (authLoading || (isAuthenticated && !isLoaded)) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="h-10 w-10 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin mb-4" />
        <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 animate-pulse">
          Loading your expense workspace…
        </p>
      </div>
    );
  }

  // ─── Unauthenticated ──────────────────────────────────────────────────────
  if (!isAuthenticated || !user) {
    return <AuthView onLogin={login} onSignup={signup} />;
  }

  // ─── Handlers ─────────────────────────────────────────────────────────────
  const handleOpenAddForm = () => { setEditingExpense(null); setIsFormOpen(true); };
  const handleOpenEditForm = (expense: Expense) => { setEditingExpense(expense); setIsFormOpen(true); };

  const handleFormSubmit = (data: Omit<Expense, "id" | "createdAt">) => {
    if (editingExpense) {
      updateExpense(editingExpense.id, data);
    } else {
      addExpense(data);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <Header
        user={user}
        onOpenExpenseForm={handleOpenAddForm}
        onOpenCategoryManager={() => setIsCategoryManagerOpen(true)}
        onOpenBackupModal={() => setIsBackupModalOpen(true)}
        onOpenAuthModal={() => {}}
        onLogout={logout}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Welcome Banner */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 border border-indigo-100 dark:border-indigo-900/40">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center flex-shrink-0">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Welcome back, {user.name}!</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                <span className="font-semibold text-slate-700 dark:text-slate-300">{user.email}</span> • Your data syncs across all devices.
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

        <MetricCards metrics={metrics} />
        <Visualizations expenses={expenses} categories={categories} />
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

      <footer className="w-full border-t border-slate-200 dark:border-slate-800 py-6 mt-12 bg-white/50 dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
          <span>Built with Next.js, Tailwind CSS, Recharts & Supabase.</span>
          <div className="flex items-center gap-3">
            <span>Ready for Vercel Deployment</span>
            <span>•</span>
            <button onClick={() => setIsBackupModalOpen(true)} className="hover:underline text-indigo-600 dark:text-indigo-400 font-semibold">
              Export / Import Data
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <ExpenseForm
        isOpen={isFormOpen}
        onClose={() => { setIsFormOpen(false); setEditingExpense(null); }}
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
        userId={userId}
        isOpen={isBackupModalOpen}
        expenses={expenses}
        categories={categories}
        onClose={() => setIsBackupModalOpen(false)}
        onBulkAddExpenses={bulkAddExpenses}
        onRestoreBackup={restoreBackup}
        onDataReset={resetAllData}
      />
    </div>
  );
}
