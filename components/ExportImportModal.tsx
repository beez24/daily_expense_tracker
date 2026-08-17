"use client";

import React, { useState, useRef } from "react";
import { exportBackupData, importBackupData } from "@/lib/storage";
import { X, Download, Upload, RefreshCw, CheckCircle2, AlertCircle, Database, FileSpreadsheet } from "lucide-react";

interface ExportImportModalProps {
  userId?: string;
  isOpen: boolean;
  onClose: () => void;
  onDataImported: () => void;
  onDataReset: () => void;
}

export const ExportImportModal: React.FC<ExportImportModalProps> = ({
  userId = "user-demo-101",
  isOpen,
  onClose,
  onDataImported,
  onDataReset,
}) => {
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const handleExportJSON = () => {
    try {
      const jsonStr = exportBackupData(userId);
      const blob = new Blob([jsonStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `expense_tracker_backup_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setFeedback({ type: "success", message: "JSON backup downloaded successfully with your latest categories and expenses!" });
    } catch (err) {
      setFeedback({ type: "error", message: "Failed to export data." });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const res = importBackupData(content, userId);
        if (res.success) {
          setFeedback({ type: "success", message: res.message });
          onDataImported();
        } else {
          setFeedback({ type: "error", message: res.message });
        }
      }
    };
    reader.readAsText(file);
  };

  const handleResetData = () => {
    if (window.confirm("Are you sure you want to reset to demo seed data? This will overwrite existing local changes.")) {
      onDataReset();
      setFeedback({ type: "success", message: "Reset to default demo data completed." });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transition-all">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Database className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Data Backup & Restore
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
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

          {/* Action 1: Export */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-2">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Export Backup JSON
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Download your active user's expenses and custom categories as a JSON backup file.
            </p>
            <button
              onClick={handleExportJSON}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-all"
            >
              <Download className="h-4 w-4" />
              Export Active Data (.json)
            </button>
          </div>

          {/* Action 2: Import */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-2">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Restore from Backup
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Upload a previously exported JSON backup file into your account.
            </p>
            <input
              type="file"
              accept=".json"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
            >
              <Upload className="h-4 w-4" />
              Import Data File
            </button>
          </div>

          {/* Action 3: Reset Demo Data */}
          <div className="p-4 bg-amber-50/50 dark:bg-amber-950/20 rounded-2xl border border-amber-200/60 dark:border-amber-900/40 space-y-2">
            <h4 className="text-xs font-bold text-amber-800 dark:text-amber-400 uppercase tracking-wider">
              Reset Demo Data
            </h4>
            <p className="text-xs text-amber-700 dark:text-amber-500">
              Restore initial seed transactions & default categories.
            </p>
            <button
              onClick={handleResetData}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/50 hover:bg-amber-200 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              Reset to Demo Seed
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-end">
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
