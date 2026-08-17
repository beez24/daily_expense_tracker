"use client";

import React, { useState } from "react";
import { Category } from "@/types/expense";
import { CategoryIcon } from "./CategoryIcon";
import { AVAILABLE_COLORS, AVAILABLE_ICONS, ICON_GROUPS } from "@/lib/constants";
import { X, Plus, Edit2, Trash2, Check, SlidersHorizontal, Tag } from "lucide-react";

interface CategoryManagerProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  onAddCategory: (data: Omit<Category, "id">) => void;
  onUpdateCategory: (id: string, data: Partial<Omit<Category, "id">>) => void;
  onDeleteCategory: (id: string, reassignCategoryId?: string) => void;
}

export const CategoryManager: React.FC<CategoryManagerProps> = ({
  isOpen,
  onClose,
  categories,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory,
}) => {
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [activeIconGroup, setActiveIconGroup] = useState<string>("Kids & Family");

  // Form states
  const [name, setName] = useState("");
  const [color, setColor] = useState(AVAILABLE_COLORS[0]);
  const [icon, setIcon] = useState(AVAILABLE_ICONS[0]);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [reassignId, setReassignId] = useState<string>("");

  if (!isOpen) return null;

  const startCreate = () => {
    setName("");
    setColor(AVAILABLE_COLORS[Math.floor(Math.random() * AVAILABLE_COLORS.length)]);
    setIcon(AVAILABLE_ICONS[Math.floor(Math.random() * AVAILABLE_ICONS.length)]);
    setEditingCatId(null);
    setIsCreating(true);
  };

  const startEdit = (cat: Category) => {
    setName(cat.name);
    setColor(cat.color);
    setIcon(cat.icon);
    setEditingCatId(cat.id);
    setIsCreating(false);
  };

  const cancelForm = () => {
    setIsCreating(false);
    setEditingCatId(null);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (isCreating) {
      onAddCategory({
        name: name.trim(),
        color,
        icon,
      });
    } else if (editingCatId) {
      onUpdateCategory(editingCatId, {
        name: name.trim(),
        color,
        icon,
      });
    }

    cancelForm();
  };

  const confirmDelete = (catId: string) => {
    const fallbackCat = categories.find((c) => c.id !== catId);
    setDeleteTargetId(catId);
    setReassignId(fallbackCat ? fallbackCat.id : "cat-other");
  };

  const executeDelete = () => {
    if (deleteTargetId) {
      onDeleteCategory(deleteTargetId, reassignId);
      setDeleteTargetId(null);
    }
  };

  const displayedIcons =
    activeIconGroup === "All"
      ? AVAILABLE_ICONS
      : ICON_GROUPS.find((g) => g.name === activeIconGroup)?.icons || AVAILABLE_ICONS;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden transition-all flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <SlidersHorizontal className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Category Manager
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Customize spending categories, colors & icons
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Add or Edit Form Drawer */}
          {(isCreating || editingCatId) && (
            <form
              onSubmit={handleSave}
              className="p-4 bg-slate-50 dark:bg-slate-800/60 border border-indigo-200 dark:border-indigo-800/60 rounded-2xl space-y-4"
            >
              <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                {isCreating ? "Create Custom Category" : "Edit Category"}
              </h4>

              {/* Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Category Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Kids Swim, Daycare, Coffee..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                  autoFocus
                />
              </div>

              {/* Color Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Color Badge
                </label>
                <div className="flex flex-wrap gap-2">
                  {AVAILABLE_COLORS.map((hex) => (
                    <button
                      key={hex}
                      type="button"
                      onClick={() => setColor(hex)}
                      className={`h-7 w-7 rounded-full flex items-center justify-center transition-transform ${
                        color === hex ? "scale-110 ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-slate-900" : ""
                      }`}
                      style={{ backgroundColor: hex }}
                    >
                      {color === hex && <Check className="h-3.5 w-3.5 text-white" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Categorized Icon Selector */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Icon Selection
                  </label>

                  {/* Icon Group Tabs */}
                  <div className="flex items-center gap-1 bg-white dark:bg-slate-900 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700">
                    {["Kids & Family", "Daily Life & Household", "All"].map((grpName) => (
                      <button
                        key={grpName}
                        type="button"
                        onClick={() => setActiveIconGroup(grpName)}
                        className={`px-2 py-0.5 text-[10px] font-semibold rounded-md transition-colors ${
                          activeIconGroup === grpName
                            ? "bg-indigo-600 text-white"
                            : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                        }`}
                      >
                        {grpName === "Daily Life & Household" ? "Daily Life" : grpName}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-6 sm:grid-cols-9 gap-1.5 max-h-40 overflow-y-auto p-1.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                  {displayedIcons.map((iconName) => (
                    <button
                      key={iconName}
                      type="button"
                      onClick={() => setIcon(iconName)}
                      className={`p-2 rounded-lg flex items-center justify-center transition-colors ${
                        icon === iconName
                          ? "bg-indigo-600 text-white shadow-sm"
                          : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                      }`}
                      title={iconName}
                    >
                      <CategoryIcon name={iconName} className="h-4 w-4" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={cancelForm}
                  className="px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors"
                >
                  {isCreating ? "Add Category" : "Save Changes"}
                </button>
              </div>
            </form>
          )}

          {/* Delete Confirmation Alert */}
          {deleteTargetId && (
            <div className="p-4 bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 rounded-2xl space-y-3">
              <h4 className="text-xs font-bold text-red-700 dark:text-red-300 uppercase tracking-wider">
                Delete Category & Reassign Expenses
              </h4>
              <p className="text-xs text-red-600 dark:text-red-400">
                Any existing expenses in this category will be reassigned to:
              </p>
              <select
                value={reassignId}
                onChange={(e) => setReassignId(e.target.value)}
                className="w-full px-3 py-2 text-xs font-semibold bg-white dark:bg-slate-900 border border-red-300 dark:border-red-800 rounded-xl text-slate-900 dark:text-white"
              >
                {categories
                  .filter((c) => c.id !== deleteTargetId)
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
              </select>
              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  onClick={() => setDeleteTargetId(null)}
                  className="px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-400"
                >
                  Cancel
                </button>
                <button
                  onClick={executeDelete}
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                >
                  Confirm Delete
                </button>
              </div>
            </div>
          )}

          {/* Categories List */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Active Categories ({categories.length})
              </span>
              {!isCreating && !editingCatId && (
                <button
                  onClick={startCreate}
                  className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-colors"
                >
                  <Plus className="h-3.5 w-3.5" />
                  New Category
                </button>
              )}
            </div>

            <div className="space-y-2">
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800/60 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="h-8 w-8 rounded-lg flex items-center justify-center text-white shadow-sm"
                      style={{ backgroundColor: cat.color }}
                    >
                      <CategoryIcon name={cat.icon} className="h-4 w-4" />
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-slate-900 dark:text-white">
                        {cat.name}
                      </h5>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {cat.color}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => startEdit(cat)}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                      title="Edit Category"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    {categories.length > 1 && (
                      <button
                        onClick={() => confirmDelete(cat.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                        title="Delete Category"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-end flex-shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
