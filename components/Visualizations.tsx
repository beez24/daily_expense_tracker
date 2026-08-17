"use client";

import React, { useState, useMemo } from "react";
import { Expense, Category, CategorySpending } from "@/types/expense";
import { formatCurrency } from "@/lib/utils";
import { CategoryIcon } from "./CategoryIcon";
import { BarChart as BarChartIcon, PieChart as PieChartIcon, Calendar, Info, Filter } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  Sector,
} from "recharts";
import {
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  subWeeks,
  subMonths,
  subDays,
  format,
  parseISO,
  isWithinInterval,
  eachDayOfInterval,
  isSameDay,
} from "date-fns";

export type TimePeriodOption =
  | "this-week"
  | "last-week"
  | "this-month"
  | "last-month"
  | "last-30-days"
  | "last-90-days"
  | "all-time"
  | "custom";

interface VisualizationsProps {
  expenses: Expense[];
  categories: Category[];
}

export const Visualizations: React.FC<VisualizationsProps> = ({
  expenses,
  categories,
}) => {
  const [activeTab, setActiveTab] = useState<"bar" | "donut">("bar");
  const [timePeriod, setTimePeriod] = useState<TimePeriodOption>("this-week");
  const [customStartDate, setCustomStartDate] = useState<string>("");
  const [customEndDate, setCustomEndDate] = useState<string>("");
  const [activeIndex, setActiveIndex] = useState<number>(0);

  // Reference date (defaults to Aug 15, 2026 or today)
  const refDate = useMemo(() => new Date("2026-08-15"), []);

  // Compute active date interval based on timePeriod
  const { start, end, label } = useMemo(() => {
    let s: Date;
    let e: Date;
    let l: string;

    switch (timePeriod) {
      case "this-week":
        s = startOfWeek(refDate, { weekStartsOn: 1 });
        e = endOfWeek(refDate, { weekStartsOn: 1 });
        l = `This Week (${format(s, "MMM d")} – ${format(e, "MMM d, yyyy")})`;
        break;

      case "last-week": {
        const prevWeekRef = subWeeks(refDate, 1);
        s = startOfWeek(prevWeekRef, { weekStartsOn: 1 });
        e = endOfWeek(prevWeekRef, { weekStartsOn: 1 });
        l = `Last Week (${format(s, "MMM d")} – ${format(e, "MMM d, yyyy")})`;
        break;
      }

      case "this-month":
        s = startOfMonth(refDate);
        e = endOfMonth(refDate);
        l = `This Month (${format(s, "MMMM yyyy")})`;
        break;

      case "last-month": {
        const prevMonthRef = subMonths(refDate, 1);
        s = startOfMonth(prevMonthRef);
        e = endOfMonth(prevMonthRef);
        l = `Last Month (${format(s, "MMMM yyyy")})`;
        break;
      }

      case "last-30-days":
        s = subDays(refDate, 29);
        e = refDate;
        l = `Last 30 Days (${format(s, "MMM d")} – ${format(e, "MMM d, yyyy")})`;
        break;

      case "last-90-days":
        s = subDays(refDate, 89);
        e = refDate;
        l = `Last 90 Days (${format(s, "MMM d")} – ${format(e, "MMM d, yyyy")})`;
        break;

      case "all-time":
        if (expenses.length > 0) {
          const dates = expenses.map((x) => parseISO(x.date)).sort((a, b) => a.getTime() - b.getTime());
          s = dates[0];
          e = dates[dates.length - 1];
        } else {
          s = startOfMonth(refDate);
          e = endOfMonth(refDate);
        }
        l = `All Time (${format(s, "MMM d, yyyy")} – ${format(e, "MMM d, yyyy")})`;
        break;

      case "custom":
        if (customStartDate && customEndDate) {
          s = parseISO(customStartDate);
          e = parseISO(customEndDate);
          l = `Custom (${format(s, "MMM d, yyyy")} – ${format(e, "MMM d, yyyy")})`;
        } else if (customStartDate) {
          s = parseISO(customStartDate);
          e = refDate;
          l = `From ${format(s, "MMM d, yyyy")}`;
        } else {
          s = startOfWeek(refDate, { weekStartsOn: 1 });
          e = endOfWeek(refDate, { weekStartsOn: 1 });
          l = "Custom Range";
        }
        break;

      default:
        s = startOfWeek(refDate, { weekStartsOn: 1 });
        e = endOfWeek(refDate, { weekStartsOn: 1 });
        l = "This Week";
    }

    return { start: s, end: e, label: l };
  }, [timePeriod, customStartDate, customEndDate, refDate, expenses]);

  // Filter expenses strictly within selected date range
  const filteredExpenses = useMemo(() => {
    return expenses.filter((exp) => {
      try {
        const expDate = parseISO(exp.date);
        return isWithinInterval(expDate, { start, end });
      } catch (err) {
        return false;
      }
    });
  }, [expenses, start, end]);

  const totalPeriodSpending = useMemo(() => {
    return filteredExpenses.reduce((sum, item) => sum + item.amount, 0);
  }, [filteredExpenses]);

  // Bar Chart Data (daily points across selected interval)
  const barChartData = useMemo(() => {
    try {
      const days = eachDayOfInterval({ start, end });
      const today = new Date();

      // If period is <= 31 days, show daily bars
      if (days.length <= 31) {
        return days.map((dayDate) => {
          const dateStr = format(dayDate, "yyyy-MM-dd");
          const dayName = format(dayDate, "EEE");
          const fullDateLabel = format(dayDate, "MMM d, yyyy");

          const amount = filteredExpenses
            .filter((exp) => exp.date === dateStr)
            .reduce((sum, item) => sum + item.amount, 0);

          return {
            day: days.length <= 7 ? dayName : format(dayDate, "d MMM"),
            dateStr,
            fullDateLabel,
            amount,
            isToday: isSameDay(dayDate, today),
          };
        });
      }

      // If period is > 31 days, aggregate by date
      const dateMap: Record<string, { fullDateLabel: string; amount: number }> = {};
      filteredExpenses.forEach((exp) => {
        if (!dateMap[exp.date]) {
          dateMap[exp.date] = {
            fullDateLabel: format(parseISO(exp.date), "MMM d, yyyy"),
            amount: 0,
          };
        }
        dateMap[exp.date].amount += exp.amount;
      });

      return Object.entries(dateMap)
        .map(([dateStr, val]) => ({
          day: format(parseISO(dateStr), "MMM d"),
          dateStr,
          fullDateLabel: val.fullDateLabel,
          amount: val.amount,
          isToday: isSameDay(parseISO(dateStr), today),
        }))
        .sort((a, b) => a.dateStr.localeCompare(b.dateStr));
    } catch (err) {
      return [];
    }
  }, [start, end, filteredExpenses]);

  // Category Spending Breakdown (Donut Chart) for selected time period
  const categoryChartData: CategorySpending[] = useMemo(() => {
    const categoryTotals: Record<string, { amount: number; count: number }> = {};

    filteredExpenses.forEach((exp) => {
      if (!categoryTotals[exp.categoryId]) {
        categoryTotals[exp.categoryId] = { amount: 0, count: 0 };
      }
      categoryTotals[exp.categoryId].amount += exp.amount;
      categoryTotals[exp.categoryId].count += 1;
    });

    return Object.entries(categoryTotals)
      .map(([catId, { amount, count }]) => {
        const cat = categories.find((c) => c.id === catId) || {
          id: catId,
          name: "Uncategorized",
          color: "#6B7280",
          icon: "MoreHorizontal",
        };
        const percentage = totalPeriodSpending > 0 ? (amount / totalPeriodSpending) * 100 : 0;
        return {
          categoryId: catId,
          name: cat.name,
          amount,
          color: cat.color,
          icon: cat.icon,
          percentage,
          count,
        };
      })
      .sort((a, b) => b.amount - a.amount);
  }, [filteredExpenses, categories, totalPeriodSpending]);

  // Active shape for Donut Chart hover
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renderActiveShape = (props: any) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
    return (
      <g>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius - 4}
          outerRadius={outerRadius + 8}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
      </g>
    );
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-5">
      {/* Visual Insights Top Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Visual Insights
            </h2>
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/50">
              {formatCurrency(totalPeriodSpending)} Total
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {label} ({filteredExpenses.length} transaction{filteredExpenses.length !== 1 ? "s" : ""})
          </p>
        </div>

        {/* Filters & View Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Time Period Dropdown */}
          <div className="relative inline-flex items-center">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
            <select
              value={timePeriod}
              onChange={(e) => setTimePeriod(e.target.value as TimePeriodOption)}
              className="pl-8 pr-8 py-1.5 text-xs font-semibold bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="this-week">This Week</option>
              <option value="last-week">Last Week</option>
              <option value="this-month">This Month</option>
              <option value="last-month">Last Month</option>
              <option value="last-30-days">Last 30 Days</option>
              <option value="last-90-days">Last 90 Days</option>
              <option value="all-time">All Time</option>
              <option value="custom">Custom Date Range...</option>
            </select>
          </div>

          {/* Chart View Switcher */}
          <div className="inline-flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
            <button
              onClick={() => setActiveTab("bar")}
              className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                activeTab === "bar"
                  ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <BarChartIcon className="h-3.5 w-3.5" />
              <span>Trend Bar</span>
            </button>
            <button
              onClick={() => setActiveTab("donut")}
              className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                activeTab === "donut"
                  ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <PieChartIcon className="h-3.5 w-3.5" />
              <span>Category Donut</span>
            </button>
          </div>
        </div>
      </div>

      {/* Custom Date Range Picker inputs when custom is selected */}
      {timePeriod === "custom" && (
        <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-wrap items-center gap-3 animate-fade-in text-xs">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-slate-400" />
            <span className="font-semibold text-slate-700 dark:text-slate-300">From:</span>
            <input
              type="date"
              value={customStartDate}
              onChange={(e) => setCustomStartDate(e.target.value)}
              className="px-2.5 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
            />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-slate-700 dark:text-slate-300">To:</span>
            <input
              type="date"
              value={customEndDate}
              onChange={(e) => setCustomEndDate(e.target.value)}
              className="px-2.5 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
            />
          </div>
        </div>
      )}

      {/* Tab 1: Bar Chart */}
      {activeTab === "bar" && (
        <div>
          {barChartData.length > 0 ? (
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barChartData} margin={{ top: 15, right: 10, left: -20, bottom: 5 }}>
                  <XAxis
                    dataKey="day"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#94a3b8", fontSize: 11 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#94a3b8", fontSize: 11 }}
                    tickFormatter={(val) => `$${val}`}
                  />
                  <Tooltip
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    content={({ active, payload }: any) => {
                      if (active && payload && payload.length) {
                        const item = payload[0].payload;
                        return (
                          <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl text-xs border border-slate-700">
                            <p className="font-semibold text-slate-300">{item.fullDateLabel}</p>
                            <p className="text-lg font-bold text-indigo-400 mt-0.5">
                              {formatCurrency(item.amount)}
                            </p>
                            {item.isToday && (
                              <span className="mt-1 inline-block text-[10px] px-1.5 py-0.5 bg-indigo-500/20 text-indigo-300 rounded font-semibold">
                                Today
                              </span>
                            )}
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="amount" radius={[8, 8, 0, 0]}>
                    {barChartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.isToday ? "#6366f1" : "#818cf8"}
                        className="hover:opacity-80 transition-opacity"
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="py-16 text-center text-slate-400 text-xs">
              No transactions recorded during this time period.
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Category Donut Chart */}
      {activeTab === "donut" && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Donut Chart Container */}
          <div className="md:col-span-6 h-72 flex items-center justify-center relative">
            {categoryChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    activeIndex={activeIndex as any}
                    activeShape={renderActiveShape}
                    data={categoryChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={95}
                    paddingAngle={3}
                    dataKey="amount"
                    onMouseEnter={(_, index) => setActiveIndex(index)}
                  >
                    {categoryChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    content={({ active, payload }: any) => {
                      if (active && payload && payload.length) {
                        const item: CategorySpending = payload[0].payload;
                        return (
                          <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl text-xs border border-slate-700">
                            <div className="flex items-center gap-2">
                              <div
                                className="h-2.5 w-2.5 rounded-full"
                                style={{ backgroundColor: item.color }}
                              />
                              <p className="font-semibold text-slate-200">{item.name}</p>
                            </div>
                            <p className="text-base font-bold text-white mt-1">
                              {formatCurrency(item.amount)} ({item.percentage.toFixed(1)}%)
                            </p>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                              {item.count} transaction{item.count !== 1 ? "s" : ""}
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center text-slate-400 text-sm">
                No category spending recorded for this time period.
              </div>
            )}

            {/* Center Total overlay */}
            {categoryChartData.length > 0 && (
              <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Total
                </span>
                <span className="text-lg font-bold text-slate-900 dark:text-white">
                  {formatCurrency(totalPeriodSpending)}
                </span>
              </div>
            )}
          </div>

          {/* Category Breakdown Legend */}
          <div className="md:col-span-6 space-y-2 max-h-72 overflow-y-auto pr-1">
            {categoryChartData.length > 0 ? (
              categoryChartData.map((item, index) => (
                <div
                  key={item.categoryId}
                  onMouseEnter={() => setActiveIndex(index)}
                  className={`flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer ${
                    activeIndex === index
                      ? "bg-slate-50 dark:bg-slate-800/80 border-slate-300 dark:border-slate-700 shadow-sm"
                      : "border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/40"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="h-8 w-8 rounded-lg flex items-center justify-center text-white shadow-sm"
                      style={{ backgroundColor: item.color }}
                    >
                      <CategoryIcon name={item.icon} className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {item.name}
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        {item.count} entry{item.count !== 1 ? "ies" : ""}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-slate-900 dark:text-white">
                      {formatCurrency(item.amount)}
                    </p>
                    <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                      {item.percentage.toFixed(1)}%
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex items-center gap-2 p-4 text-xs text-slate-500 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                <Info className="h-4 w-4 text-slate-400" />
                <span>Log expenses to view category breakdowns.</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
