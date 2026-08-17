"use client";

import React, { useState, useEffect } from "react";
import { Category, Expense } from "@/types/expense";
import { CategoryIcon } from "./CategoryIcon";
import { X, Calendar as CalendarIcon, DollarSign, Tag, FileText, Check } from "lucide-react";
import { format } from "date-fns";

interface ExpenseFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Expense, "id" | "createdAt">) => void;
  categories: Category[];
  editingExpense?: Expense | null;
}

export const ExpenseForm: React.FC<ExpenseFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  categories,
  editingExpense,
}) => {
  const [amount, setAmount] = useState<string>("");
  const [date, setDate] = useState<string>(format(new Date(), "yyyy-MM-dd"));
  const [categoryId, setCategoryId] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [errors, setErrors] = useState<{ amount?: string; categoryId?: string }>({});

  useEffect(() => {
    if (editingExpense) {
      setAmount(editingExpense.amount.toString());
      setDate(editingExpense.date);
      setCategoryId(editingExpense.categoryId);
      setDescription(editingExpense.description || "");
    } else {
      setAmount("");
      setDate(format(new Date(), "yyyy-MM-dd"));
      setCategoryId(categories.length > 0 ? categories[0].id : "");
      setDescription("");
    }
    setErrors({});
  }, [editingExpense, isOpen, categories]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { amount?: string; categoryId?: string } = {};

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      newErrors.amount = "Please enter a valid amount greater than $0";
    }

    if (!categoryId) {
      newErrors.categoryId = "Please select a category";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit({
      amount: parsedAmount,
      date: date || format(new Date(), "yyyy-MM-dd"),
      categoryId,
      description: description.trim() || undefined,
    });

    onClose();
  };

  const handleQuickAddAmount = (addValue: number) => {
    const current = parseFloat(amount) || 0;
    setAmount((current + addValue).toFixed(2));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden transition-all">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <DollarSign className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {editingExpense ? "Edit Expense Entry" : "Log New Expense"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Amount Field */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              Amount ($)
            </label>
            <div className="relative rounded-xl shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 font-bold text-lg">
                $
              </div>
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  if (errors.amount) setErrors((prev) => ({ ...prev, amount: undefined }));
                }}
                className={`w-full pl-9 pr-4 py-3 text-2xl font-bold bg-slate-50 dark:bg-slate-800/80 border ${
                  errors.amount ? "border-red-500" : "border-slate-200 dark:border-slate-700"
                } rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all`}
                autoFocus
              />
            </div>
            {errors.amount && <p className="mt-1.5 text-xs text-red-500 font-medium">{errors.amount}</p>}

            {/* Quick Amount Pills */}
            <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] font-medium text-slate-400 mr-1">Quick Add:</span>
              {[5, 10, 20, 50, 100].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => handleQuickAddAmount(val)}
                  className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
                >
                  +${val}
                </button>
              ))}
            </div>
          </div>

          {/* Date & Category Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Date Picker */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <CalendarIcon className="h-3.5 w-3.5 text-slate-400" />
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              />
            </div>

            {/* Category Dropdown */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Tag className="h-3.5 w-3.5 text-slate-400" />
                Category
              </label>
              <select
                value={categoryId}
                onChange={(e) => {
                  setCategoryId(e.target.value);
                  if (errors.categoryId) setErrors((prev) => ({ ...prev, categoryId: undefined }));
                }}
                className={`w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/80 border ${
                  errors.categoryId ? "border-red-500" : "border-slate-200 dark:border-slate-700"
                } rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all`}
              >
                <option value="" disabled>Select category...</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              {errors.categoryId && (
                <p className="mt-1.5 text-xs text-red-500 font-medium">{errors.categoryId}</p>
              )}
            </div>
          </div>

          {/* Category Preview Tag */}
          {categoryId && (
            <div className="flex items-center gap-2 p-2.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
              {(() => {
                const selectedCat = categories.find((c) => c.id === categoryId);
                if (!selectedCat) return null;
                return (
                  <>
                    <div
                      className="h-6 w-6 rounded-lg flex items-center justify-center text-white text-xs"
                      style={{ backgroundColor: selectedCat.color }}
                    >
                      <CategoryIcon name={selectedCat.icon} className="h-3.5 w-3.5" />
                    </div>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Selected: {selectedCat.name}
                    </span>
                  </>
                );
              })()}
            </div>
          )}

          {/* Description Field */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5 text-slate-400" />
              Optional Description
            </label>
            <input
              type="text"
              placeholder="e.g. Starbucks Latte, Grocery haul, Rent..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 shadow-md shadow-indigo-500/20 transition-all"
            >
              <Check className="h-4 w-4 stroke-[2.5]" />
              <span>{editingExpense ? "Save Changes" : "Save Expense"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
