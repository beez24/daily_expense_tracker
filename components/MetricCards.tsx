"use client";

import React from "react";
import { SummaryMetrics } from "@/types/expense";
import { formatCurrency } from "@/lib/utils";
import { CategoryIcon } from "./CategoryIcon";
import { Calendar, CalendarRange, Crown, TrendingUp } from "lucide-react";

interface MetricCardsProps {
  metrics: SummaryMetrics;
}

export const MetricCards: React.FC<MetricCardsProps> = ({ metrics }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Card 1: Total Spent (This Week) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 tracking-wide uppercase">
            Spent (This Week)
          </span>
          <div className="h-9 w-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Calendar className="h-5 w-5" />
          </div>
        </div>
        <div className="mt-3">
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {formatCurrency(metrics.totalThisWeek)}
          </p>
          <div className="mt-2 flex items-center text-xs text-slate-500 dark:text-slate-400 gap-1.5">
            <TrendingUp className="h-3.5 w-3.5 text-indigo-500" />
            <span>Mon–Sun breakdown</span>
          </div>
        </div>
      </div>

      {/* Card 2: Total Spent (This Month) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 tracking-wide uppercase">
            Spent (This Month)
          </span>
          <div className="h-9 w-9 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <CalendarRange className="h-5 w-5" />
          </div>
        </div>
        <div className="mt-3">
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {formatCurrency(metrics.totalThisMonth)}
          </p>
          <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Current calendar month
          </div>
        </div>
      </div>

      {/* Card 3: Highest Spending Category */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 tracking-wide uppercase">
            Highest Category
          </span>
          <div className="h-9 w-9 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Crown className="h-5 w-5" />
          </div>
        </div>
        <div className="mt-3">
          {metrics.highestCategory ? (
            <div>
              <div className="flex items-center gap-2">
                <div
                  className="h-3 w-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: metrics.highestCategory.color }}
                />
                <p className="text-xl font-bold text-slate-900 dark:text-white truncate">
                  {metrics.highestCategory.name}
                </p>
              </div>
              <p className="mt-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
                {formatCurrency(metrics.highestCategory.amount)} spent
              </p>
            </div>
          ) : (
            <div>
              <p className="text-xl font-bold text-slate-400 dark:text-slate-500">None yet</p>
              <p className="mt-1 text-xs text-slate-400">Log expenses to calculate</p>
            </div>
          )}
        </div>
      </div>

      {/* Card 4: Daily Average (This Week) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 tracking-wide uppercase">
            Daily Average (Week)
          </span>
          <div className="h-9 w-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <TrendingUp className="h-5 w-5" />
          </div>
        </div>
        <div className="mt-3">
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {formatCurrency(metrics.dailyAverageThisWeek)}
          </p>
          <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Per day (7-day week)
          </div>
        </div>
      </div>
    </div>
  );
};
