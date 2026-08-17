"use client";

import React, { useState } from "react";
import { DaySpending, CategorySpending } from "@/types/expense";
import { formatCurrency } from "@/lib/utils";
import { CategoryIcon } from "./CategoryIcon";
import { BarChart as BarChartIcon, PieChart as PieChartIcon, Info } from "lucide-react";
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

interface VisualizationsProps {
  weeklyData: DaySpending[];
  monthlyData: CategorySpending[];
}

export const Visualizations: React.FC<VisualizationsProps> = ({
  weeklyData,
  monthlyData,
}) => {
  const [activeTab, setActiveTab] = useState<"weekly" | "monthly">("weekly");
  const [activeIndex, setActiveIndex] = useState<number>(0);

  const totalMonthlySpending = monthlyData.reduce((acc, curr) => acc + curr.amount, 0);

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
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800/80 pb-4 mb-6">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            Visual Insights
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Interactive breakdown of daily and categorical spending
          </p>
        </div>

        {/* View Switcher */}
        <div className="inline-flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
          <button
            onClick={() => setActiveTab("weekly")}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === "weekly"
                ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <BarChartIcon className="h-3.5 w-3.5" />
            <span>Weekly Overview</span>
          </button>
          <button
            onClick={() => setActiveTab("monthly")}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === "monthly"
                ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <PieChartIcon className="h-3.5 w-3.5" />
            <span>Monthly Category Breakdown</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Weekly Overview Bar Chart */}
      {activeTab === "weekly" && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Mon – Sun Daily Spending
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData} margin={{ top: 15, right: 10, left: -20, bottom: 5 }}>
                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#94a3b8", fontSize: 12 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#94a3b8", fontSize: 12 }}
                  tickFormatter={(val) => `$${val}`}
                />
                <Tooltip
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  content={({ active, payload }: any) => {
                    if (active && payload && payload.length) {
                      const item: DaySpending = payload[0].payload;
                      return (
                        <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl text-xs border border-slate-700">
                          <p className="font-semibold text-slate-300">{item.fullDateLabel} ({item.day})</p>
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
                  {weeklyData.map((entry, index) => (
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
        </div>
      )}

      {/* Tab 2: Monthly Category Donut Chart */}
      {activeTab === "monthly" && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Donut Chart Container */}
          <div className="md:col-span-6 h-72 flex items-center justify-center relative">
            {monthlyData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    activeIndex={activeIndex as any}
                    activeShape={renderActiveShape}
                    data={monthlyData}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={95}
                    paddingAngle={3}
                    dataKey="amount"
                    onMouseEnter={(_, index) => setActiveIndex(index)}
                  >
                    {monthlyData.map((entry, index) => (
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
                No spending recorded for this month yet.
              </div>
            )}

            {/* Center Total overlay */}
            {monthlyData.length > 0 && (
              <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Total
                </span>
                <span className="text-lg font-bold text-slate-900 dark:text-white">
                  {formatCurrency(totalMonthlySpending)}
                </span>
              </div>
            )}
          </div>

          {/* Category Breakdown Legend */}
          <div className="md:col-span-6 space-y-2 max-h-72 overflow-y-auto pr-1">
            {monthlyData.length > 0 ? (
              monthlyData.map((item, index) => (
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
