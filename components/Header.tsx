"use client";

import React, { useState, useEffect } from "react";
import { Plus, SlidersHorizontal, Database, Sun, Moon, Wallet } from "lucide-react";
import { useTheme } from "next-themes";

interface HeaderProps {
  onOpenExpenseForm: () => void;
  onOpenCategoryManager: () => void;
  onOpenBackupModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenExpenseForm,
  onOpenCategoryManager,
  onOpenBackupModal,
}) => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="sticky top-0 z-30 w-full backdrop-blur-md bg-white/80 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white">
            <Wallet className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                Daily Tracker
              </h1>
              <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/50">
                SPA
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Smart Expense & Category Manager
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center flex-wrap gap-2 w-full sm:w-auto justify-end">
          <button
            onClick={onOpenCategoryManager}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-medium rounded-lg text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors"
            title="Manage Categories"
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span className="hidden sm:inline">Categories</span>
          </button>

          <button
            onClick={onOpenBackupModal}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-medium rounded-lg text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors"
            title="Import/Export JSON Backup"
          >
            <Database className="h-4 w-4" />
            <span className="hidden sm:inline">Backup</span>
          </button>

          {/* Theme Toggle */}
          {mounted && (
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 rounded-lg text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors"
              aria-label="Toggle Theme"
            >
              {theme === "dark" ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-slate-600" />}
            </button>
          )}

          {/* Primary CTA */}
          <button
            onClick={onOpenExpenseForm}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 shadow-sm shadow-indigo-500/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="h-4 w-4 stroke-[2.5]" />
            <span>Log Expense</span>
          </button>
        </div>
      </div>
    </header>
  );
};
