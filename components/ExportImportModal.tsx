"use client";

import React, { useState, useRef } from "react";
import {
  exportBackupData,
  importBackupData,
  exportExpensesCSV,
  importExpensesCSV,
  CSV_TEMPLATE_HEADER,
  CSV_TEMPLATE_EXAMPLE,
} from "@/lib/storage";
import {
  X,
  Download,
  Upload,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Database,
  FileSpreadsheet,
  FileDown,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface ExportImportModalProps {
  userId?: string;
  isOpen: boolean;
  onClose: () => void;
  onDataImported: () => void;
  onDataReset: () => void;
}

export const ExportImportModal: React.FC<ExportImportModalProps> = ({
  userId = "",
  isOpen,
  onClose,
  onDataImported,
  onDataReset,
}) => {
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [showCsvHelp, setShowCsvHelp] = useState(false);

  const jsonFileInputRef = useRef<HTMLInputElement | null>(null);
  const csvFileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  // ─── JSON Export ─────────────────────────────────────────────────────────
  const handleExportJSON = () => {
    try {
      const jsonStr = exportBackupData(userId);
      triggerDownload(jsonStr, `expense_backup_${today()}.json`, "application/json");
      setFeedback({ type: "success", message: "JSON backup downloaded with your latest categories and expenses." });
    } catch {
      setFeedback({ type: "error", message: "Failed to export JSON." });
    }
  };

  // ─── JSON Import ─────────────────────────────────────────────────────────
  const handleJSONFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    readFile(file, (content) => {
      const res = importBackupData(content, userId);
      setFeedback({ type: res.success ? "success" : "error", message: res.message });
      if (res.success) onDataImported();
    });
    e.target.value = "";
  };

  // ─── CSV Export ───────────────────────────────────────────────────────────
  const handleExportCSV = () => {
    try {
      const csv = exportExpensesCSV(userId);
      triggerDownload(csv, `expenses_${today()}.csv`, "text/csv");
      setFeedback({ type: "success", message: "CSV file downloaded. Open in Excel or Google Sheets." });
    } catch {
      setFeedback({ type: "error", message: "Failed to export CSV." });
    }
  };

  // ─── CSV Import ───────────────────────────────────────────────────────────
  const handleCSVFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    readFile(file, (content) => {
      const res = importExpensesCSV(content, userId);
      setFeedback({ type: res.success ? "success" : "error", message: res.message });
      if (res.success) onDataImported();
    });
    e.target.value = "";
  };

  // ─── CSV Template Download ────────────────────────────────────────────────
  const handleDownloadTemplate = () => {
    const template = [CSV_TEMPLATE_HEADER, CSV_TEMPLATE_EXAMPLE].join("\n");
    triggerDownload(template, "expenses_template.csv", "text/csv");
  };

  // ─── Reset ────────────────────────────────────────────────────────────────
  const handleResetData = () => {
    if (window.confirm("Reset all expenses and categories to default? This cannot be undone.")) {
      onDataReset();
      setFeedback({ type: "success", message: "Reset to default categories completed." });
    }
  };

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
    reader.onload = (ev) => {
      const content = ev.target?.result as string;
      if (content) cb(content);
    };
    reader.readAsText(file);
  };

  const today = () => new Date().toISOString().slice(0, 10);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden transition-all max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Database className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Data Backup & Import
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body (scrollable) */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1">

          {/* Feedback Banner */}
          {feedback && (
            <div
              className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                feedback.type === "success"
                  ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                  : "bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800"
              }`}
            >
              {feedback.type === "success" ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
              )}
              <span>{feedback.message}</span>
            </div>
          )}

          {/* ── Section 1: CSV Import ─────────────────────────────────────── */}
          <div className="p-4 bg-emerald-50/60 dark:bg-emerald-950/20 rounded-2xl border border-emerald-200/70 dark:border-emerald-900/40 space-y-3">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <FileSpreadsheet className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Import Transactions from CSV
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Bulk-add a month (or more) of transactions. Rows are <strong>appended</strong> to your existing data.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <input
                type="file"
                accept=".csv,text/csv"
                ref={csvFileInputRef}
                onChange={handleCSVFileChange}
                className="hidden"
              />
              <button
                onClick={() => csvFileInputRef.current?.click()}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm transition-all"
              >
                <Upload className="h-4 w-4" />
                Import CSV File
              </button>
              <button
                onClick={handleDownloadTemplate}
                className="inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-xl text-emerald-700 dark:text-emerald-300 bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-all"
              >
                <FileDown className="h-4 w-4" />
                Download Template
              </button>
            </div>

            {/* CSV Format Help Toggle */}
            <button
              onClick={() => setShowCsvHelp((v) => !v)}
              className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
            >
              {showCsvHelp ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
              {showCsvHelp ? "Hide" : "Show"} expected CSV format
            </button>

            {showCsvHelp && (
              <div className="rounded-xl bg-slate-900 dark:bg-slate-950 p-3 space-y-1.5">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Required columns</p>
                <pre className="text-xs text-emerald-400 font-mono leading-relaxed whitespace-pre-wrap">
{`date,description,amount,category
2026-08-01,Grocery run,54.99,Food
2026-08-02,Monthly gym membership,35.00,Health
2026-08-03,Uber to school,12.50,Transport`}
                </pre>
                <ul className="text-xs text-slate-400 space-y-1 pt-1">
                  <li>• <strong className="text-slate-300">date</strong> — YYYY-MM-DD format</li>
                  <li>• <strong className="text-slate-300">description</strong> — optional label</li>
                  <li>• <strong className="text-slate-300">amount</strong> — positive number (no currency symbol needed)</li>
                  <li>• <strong className="text-slate-300">category</strong> — must match one of your category names (case-insensitive); unmatched rows use your first category</li>
                </ul>
              </div>
            )}
          </div>

          {/* ── Section 2: CSV Export ─────────────────────────────────────── */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-2">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Export Transactions as CSV
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Download all your transactions as a spreadsheet-ready CSV file.
            </p>
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
            >
              <Download className="h-4 w-4" />
              Export as CSV
            </button>
          </div>

          {/* ── Section 3: JSON Backup / Restore ──────────────────────────── */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Full JSON Backup & Restore
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Export or restore a full backup including custom categories and all transactions.
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleExportJSON}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-all"
              >
                <Download className="h-4 w-4" />
                Export Full Backup (.json)
              </button>

              <input
                type="file"
                accept=".json"
                ref={jsonFileInputRef}
                onChange={handleJSONFileChange}
                className="hidden"
              />
              <button
                onClick={() => jsonFileInputRef.current?.click()}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
              >
                <Upload className="h-4 w-4" />
                Restore from Backup
              </button>
            </div>
          </div>

          {/* ── Section 4: Reset ──────────────────────────────────────────── */}
          <div className="p-4 bg-red-50/40 dark:bg-red-950/20 rounded-2xl border border-red-200/50 dark:border-red-900/40 space-y-2">
            <h4 className="text-xs font-bold text-red-700 dark:text-red-400 uppercase tracking-wider">
              Reset Account Data
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Clear all transactions and restore default categories. This cannot be undone.
            </p>
            <button
              onClick={handleResetData}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-900/40 hover:bg-red-200 dark:hover:bg-red-900/60 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              Reset All Data
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-end flex-shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
