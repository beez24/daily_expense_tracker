"use client";

import React, { useState, useRef } from "react";
import {
  exportExpensesCSV,
  buildBackupJSON,
  parseCSV,
  parseBackupJSON,
  CSV_TEMPLATE_HEADER,
  CSV_TEMPLATE_EXAMPLE,
} from "@/lib/storage";
import { Category, Expense } from "@/types/expense";
import {
  X, Download, Upload, RefreshCw, CheckCircle2, AlertCircle,
  Database, FileSpreadsheet, FileDown, ChevronDown, ChevronUp,
} from "lucide-react";

interface ExportImportModalProps {
  userId?: string;
  isOpen: boolean;
  expenses: Expense[];
  categories: Category[];
  onClose: () => void;
  onBulkAddExpenses: (expenses: Omit<Expense, "id" | "createdAt">[]) => Promise<{ inserted: number; error?: string }>;
  onRestoreBackup: (categories: Omit<Category, "id">[], expenses: Omit<Expense, "id" | "createdAt">[]) => Promise<void>;
  onDataReset: () => Promise<void>;
}

export const ExportImportModal: React.FC<ExportImportModalProps> = ({
  userId = "",
  isOpen,
  expenses,
  categories,
  onClose,
  onBulkAddExpenses,
  onRestoreBackup,
  onDataReset,
}) => {
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [showCsvHelp, setShowCsvHelp] = useState(false);
  const [isBusy, setIsBusy] = useState(false);

  const jsonFileInputRef = useRef<HTMLInputElement | null>(null);
  const csvFileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  // ─── Helpers ──────────────────────────────────────────────────────────────
  const triggerDownload = (content: string, filename: string, mime: string) => {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const readFile = (file: File, cb: (content: string) => void) => {
    const reader = new FileReader();
    reader.onload = (ev) => { if (ev.target?.result) cb(ev.target.result as string); };
    reader.readAsText(file);
  };

  const today = () => new Date().toISOString().slice(0, 10);

  // ─── CSV Export ───────────────────────────────────────────────────────────
  const handleExportCSV = () => {
    try {
      const csv = exportExpensesCSV(expenses, categories);
      triggerDownload(csv, `expenses_${today()}.csv`, "text/csv");
      setFeedback({ type: "success", message: "CSV downloaded. Open in Excel or Google Sheets." });
    } catch {
      setFeedback({ type: "error", message: "Failed to export CSV." });
    }
  };

  // ─── CSV Import ───────────────────────────────────────────────────────────
  const handleCSVFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";

    readFile(file, async (content) => {
      setIsBusy(true);
      const { rows, skipped } = parseCSV(content, categories);

      if (rows.length === 0) {
        setFeedback({ type: "error", message: `No valid rows found. ${skipped} row(s) skipped due to formatting issues.` });
        setIsBusy(false);
        return;
      }

      const result = await onBulkAddExpenses(rows);
      const skipNote = skipped > 0 ? ` (${skipped} row${skipped !== 1 ? "s" : ""} skipped)` : "";

      if (result.error) {
        setFeedback({ type: "error", message: `Import failed: ${result.error}` });
      } else {
        setFeedback({ type: "success", message: `Imported ${result.inserted} transaction${result.inserted !== 1 ? "s" : ""}${skipNote}.` });
      }
      setIsBusy(false);
    });
  };

  // ─── CSV Template ─────────────────────────────────────────────────────────
  const handleDownloadTemplate = () => {
    triggerDownload([CSV_TEMPLATE_HEADER, CSV_TEMPLATE_EXAMPLE].join("\n"), "expenses_template.csv", "text/csv");
  };

  // ─── JSON Export ──────────────────────────────────────────────────────────
  const handleExportJSON = () => {
    try {
      const json = buildBackupJSON(expenses, categories, userId);
      triggerDownload(json, `expense_backup_${today()}.json`, "application/json");
      setFeedback({ type: "success", message: "Full JSON backup downloaded." });
    } catch {
      setFeedback({ type: "error", message: "Failed to export JSON." });
    }
  };

  // ─── JSON Import ──────────────────────────────────────────────────────────
  const handleJSONFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";

    readFile(file, async (content) => {
      setIsBusy(true);
      const parsed = parseBackupJSON(content);

      if (!parsed.success || !parsed.categories || !parsed.expenses) {
        setFeedback({ type: "error", message: parsed.message });
        setIsBusy(false);
        return;
      }

      await onRestoreBackup(parsed.categories, parsed.expenses);
      setFeedback({ type: "success", message: `Restored ${parsed.expenses.length} expenses and ${parsed.categories.length} categories.` });
      setIsBusy(false);
    });
  };

  // ─── Reset ────────────────────────────────────────────────────────────────
  const handleResetData = async () => {
    if (!window.confirm("Reset all expenses and categories to defaults? This cannot be undone.")) return;
    setIsBusy(true);
    await onDataReset();
    setFeedback({ type: "success", message: "Reset complete. Default categories restored." });
    setIsBusy(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden transition-all max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Database className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Data Backup & Import</h3>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1">

          {/* Feedback */}
          {feedback && (
            <div className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
              feedback.type === "success"
                ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                : "bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800"
            }`}>
              {feedback.type === "success"
                ? <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                : <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />}
              <span>{feedback.message}</span>
            </div>
          )}

          {isBusy && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
              <span className="h-4 w-4 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin flex-shrink-0" />
              <span>Saving to cloud database...</span>
            </div>
          )}

          {/* CSV Import */}
          <div className="p-4 bg-emerald-50/60 dark:bg-emerald-950/20 rounded-2xl border border-emerald-200/70 dark:border-emerald-900/40 space-y-3">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <FileSpreadsheet className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Import Transactions from CSV</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">Rows are <strong>appended</strong> to your existing data.</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <input type="file" accept=".csv,text/csv" ref={csvFileInputRef} onChange={handleCSVFileChange} className="hidden" />
              <button onClick={() => csvFileInputRef.current?.click()} disabled={isBusy}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 shadow-sm transition-all">
                <Upload className="h-4 w-4" /> Import CSV File
              </button>
              <button onClick={handleDownloadTemplate}
                className="inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-xl text-emerald-700 dark:text-emerald-300 bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-50 transition-all">
                <FileDown className="h-4 w-4" /> Download Template
              </button>
            </div>
            <button onClick={() => setShowCsvHelp((v) => !v)}
              className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors">
              {showCsvHelp ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
              {showCsvHelp ? "Hide" : "Show"} expected CSV format
            </button>
            {showCsvHelp && (
              <div className="rounded-xl bg-slate-900 dark:bg-slate-950 p-3 space-y-1.5">
                <pre className="text-xs text-emerald-400 font-mono leading-relaxed whitespace-pre-wrap">{`date,description,amount,category\n2026-08-01,Grocery run,54.99,Food\n2026-08-02,Gym membership,35.00,Health`}</pre>
                <ul className="text-xs text-slate-400 space-y-1 pt-1">
                  <li>• <strong className="text-slate-300">date</strong> — YYYY-MM-DD</li>
                  <li>• <strong className="text-slate-300">amount</strong> — positive number ($ £ € stripped automatically)</li>
                  <li>• <strong className="text-slate-300">category</strong> — must match one of your category names (case-insensitive)</li>
                </ul>
              </div>
            )}
          </div>

          {/* CSV Export */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-2">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Export as CSV</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">Download all transactions as a spreadsheet-ready CSV file.</p>
            <button onClick={handleExportCSV}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
              <Download className="h-4 w-4" /> Export as CSV
            </button>
          </div>

          {/* JSON Backup */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Full JSON Backup & Restore</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">Export or restore a full backup including custom categories.</p>
            <div className="flex flex-wrap gap-2">
              <button onClick={handleExportJSON}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-all">
                <Download className="h-4 w-4" /> Export Full Backup (.json)
              </button>
              <input type="file" accept=".json" ref={jsonFileInputRef} onChange={handleJSONFileChange} className="hidden" />
              <button onClick={() => jsonFileInputRef.current?.click()} disabled={isBusy}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 transition-all">
                <Upload className="h-4 w-4" /> Restore from Backup
              </button>
            </div>
          </div>

          {/* Reset */}
          <div className="p-4 bg-red-50/40 dark:bg-red-950/20 rounded-2xl border border-red-200/50 dark:border-red-900/40 space-y-2">
            <h4 className="text-xs font-bold text-red-700 dark:text-red-400 uppercase tracking-wider">Reset Account Data</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">Clear all transactions and restore default categories. Cannot be undone.</p>
            <button onClick={handleResetData} disabled={isBusy}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-900/40 hover:bg-red-200 dark:hover:bg-red-900/60 disabled:opacity-50 transition-colors">
              <RefreshCw className="h-4 w-4" /> Reset All Data
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-end flex-shrink-0">
          <button onClick={onClose} className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
