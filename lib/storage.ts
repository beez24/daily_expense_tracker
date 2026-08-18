/**
 * lib/storage.ts
 * CSV import/export helpers only.
 * All database persistence is now handled by lib/db.ts via Supabase.
 */

import { Category, Expense } from "@/types/expense";

export const CSV_TEMPLATE_HEADER = "date,description,amount,category";
export const CSV_TEMPLATE_EXAMPLE = [
  "2026-08-01,Grocery run,54.99,Food",
  "2026-08-02,Monthly gym membership,35.00,Health",
  "2026-08-03,Uber to school,12.50,Transport",
].join("\n");

/** Build a CSV string from in-memory expense + category arrays. */
export function exportExpensesCSV(expenses: Expense[], categories: Category[]): string {
  const catMap = new Map(categories.map((c) => [c.id, c.name]));
  const rows = expenses.map((exp) => {
    const catName = catMap.get(exp.categoryId) ?? exp.categoryId;
    const desc = (exp.description ?? "").replace(/,/g, ";");
    return `${exp.date},${desc},${exp.amount.toFixed(2)},${catName}`;
  });
  return [CSV_TEMPLATE_HEADER, ...rows].join("\n");
}

/** Build a full JSON backup string from in-memory data. */
export function buildBackupJSON(
  expenses: Expense[],
  categories: Category[],
  userId: string
): string {
  return JSON.stringify(
    { version: 2, exportedAt: new Date().toISOString(), userId, categories, expenses },
    null,
    2
  );
}

/** Parse CSV text and return expense-like objects ready for bulk DB insert.
 *  Category matching is by name (case-insensitive) against the provided categories list.
 *  Returns parsed rows and a count of skipped rows.
 */
export function parseCSV(
  csvString: string,
  categories: Category[]
): { rows: Omit<Expense, "id" | "createdAt">[]; skipped: number } {
  const catLookup = new Map(categories.map((c) => [c.name.toLowerCase().trim(), c.id]));
  const lines = csvString.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

  if (lines.length < 2) return { rows: [], skipped: 0 };

  const firstLine = lines[0].toLowerCase();
  const hasHeader = firstLine.startsWith("date") || firstLine.startsWith('"date"');
  const dataLines = hasHeader ? lines.slice(1) : lines;

  const rows: Omit<Expense, "id" | "createdAt">[] = [];
  let skipped = 0;

  for (const line of dataLines) {
    const cols = line.split(",").map((c) => c.trim().replace(/^"|"$/g, ""));
    if (cols.length < 3) { skipped++; continue; }

    const [rawDate, rawDesc, rawAmount, rawCat = ""] = cols;

    if (!/^\d{4}-\d{2}-\d{2}$/.test(rawDate)) { skipped++; continue; }

    const amount = parseFloat(rawAmount.replace(/[$£€,]/g, ""));
    if (isNaN(amount) || amount <= 0) { skipped++; continue; }

    const categoryId = catLookup.get(rawCat.toLowerCase().trim()) ?? categories[0]?.id ?? "";

    rows.push({ date: rawDate, description: rawDesc || undefined, amount, categoryId });
  }

  return { rows, skipped };
}

/** Parse a JSON backup file. Returns categories and expenses or an error. */
export function parseBackupJSON(jsonString: string): {
  success: boolean;
  message: string;
  categories?: Omit<Category, "id">[];
  expenses?: Omit<Expense, "id" | "createdAt">[];
} {
  try {
    const data = JSON.parse(jsonString);
    if (!Array.isArray(data.expenses) || !Array.isArray(data.categories)) {
      return { success: false, message: "Invalid backup format — 'expenses' or 'categories' arrays missing." };
    }
    return {
      success: true,
      message: `Parsed ${data.expenses.length} expenses and ${data.categories.length} categories.`,
      categories: data.categories,
      expenses: data.expenses,
    };
  } catch {
    return { success: false, message: "Failed to parse JSON file." };
  }
}
