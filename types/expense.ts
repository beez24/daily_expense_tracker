export interface Category {
  id: string;
  name: string;
  color: string; // Hex color string, e.g., "#10B981"
  icon: string;  // Lucide icon name, e.g., "Utensils"
  isDefault?: boolean;
}

export interface Expense {
  id: string;
  amount: number;
  date: string; // YYYY-MM-DD
  categoryId: string;
  description?: string;
  createdAt: string; // ISO string
}

export interface ExpenseFilter {
  searchQuery: string;
  categoryId: string; // 'all' or specific category ID
  startDate: string;  // YYYY-MM-DD or ''
  endDate: string;    // YYYY-MM-DD or ''
  sortBy: 'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc';
}

export interface SummaryMetrics {
  totalThisWeek: number;
  totalThisMonth: number;
  dailyAverageThisWeek: number;
  highestCategory: {
    id: string;
    name: string;
    amount: number;
    color: string;
    icon: string;
  } | null;
  totalExpensesCount: number;
}

export interface DaySpending {
  day: string;       // e.g. "Mon", "Tue"
  dateStr: string;   // e.g. "2026-08-10"
  fullDateLabel: string; // e.g. "Aug 10"
  amount: number;
  isToday: boolean;
}

export interface CategorySpending {
  categoryId: string;
  name: string;
  amount: number;
  color: string;
  icon: string;
  percentage: number;
  count: number;
}
