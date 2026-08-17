import { Category, Expense } from "@/types/expense";

export const DEFAULT_CATEGORIES: Category[] = [
  { id: "cat-food", name: "Food & Dining", color: "#F59E0B", icon: "Utensils", isDefault: true },
  { id: "cat-shopping", name: "Shopping", color: "#EC4899", icon: "ShoppingBag", isDefault: true },
  { id: "cat-housing", name: "Housing & Rent", color: "#3B82F6", icon: "Home", isDefault: true },
  { id: "cat-transport", name: "Transportation", color: "#8B5CF6", icon: "Car", isDefault: true },
  { id: "cat-kids", name: "Kids & Childcare", color: "#F43F5E", icon: "Baby", isDefault: true },
  { id: "cat-school", name: "School & Education", color: "#0284C7", icon: "School", isDefault: true },
  { id: "cat-entertainment", name: "Entertainment", color: "#10B981", icon: "Film", isDefault: true },
  { id: "cat-utilities", name: "Bills & Utilities", color: "#06B6D4", icon: "Zap", isDefault: true },
  { id: "cat-health", name: "Health & Fitness", color: "#EF4444", icon: "HeartPulse", isDefault: true },
  { id: "cat-other", name: "Miscellaneous", color: "#6B7280", icon: "MoreHorizontal", isDefault: true },
];

export const ICON_GROUPS = [
  {
    name: "Kids & Family",
    icons: [
      "Baby",
      "ToyBrick",
      "Gamepad2",
      "School",
      "GraduationCap",
      "BookOpen",
      "Palette",
      "Trophy",
      "PartyPopper",
      "Cake",
      "Apple",
      "Footprints",
      "Stethoscope",
      "Smile",
    ],
  },
  {
    name: "Daily Life & Household",
    icons: [
      "Utensils",
      "Coffee",
      "ShoppingBag",
      "ShoppingCart",
      "Home",
      "Car",
      "Fuel",
      "Zap",
      "Wifi",
      "Smartphone",
      "Tv",
      "Shirt",
      "Scissors",
      "Wrench",
      "Briefcase",
      "CreditCard",
      "PiggyBank",
      "Gift",
      "Dog",
      "Cat",
      "HeartPulse",
      "Pill",
      "Sparkles",
      "Clock",
      "Bus",
      "Plane",
      "Bike",
      "Key",
      "Camera",
      "Music",
      "Globe",
      "Flame",
      "Film",
      "MoreHorizontal",
    ],
  },
];

export const AVAILABLE_ICONS = Array.from(
  new Set(ICON_GROUPS.flatMap((group) => group.icons))
);

export const AVAILABLE_COLORS = [
  "#F59E0B", // Amber
  "#EC4899", // Pink
  "#3B82F6", // Blue
  "#8B5CF6", // Purple
  "#10B981", // Emerald
  "#06B6D4", // Cyan
  "#EF4444", // Red
  "#6B7280", // Gray
  "#F97316", // Orange
  "#84CC16", // Lime
  "#14B8A6", // Teal
  "#6366F1", // Indigo
  "#D946EF", // Fuchsia
  "#0284C7", // Sky
  "#F43F5E", // Rose
  "#EAB308", // Yellow
];

// Helper to construct sample dates relative to current date (2026-08-15 is Saturday)
export const SEED_EXPENSES: Expense[] = [
  {
    id: "exp-101",
    amount: 14.50,
    date: "2026-08-15",
    categoryId: "cat-food",
    description: "Morning Specialty Coffee & Bagel",
    createdAt: new Date("2026-08-15T08:30:00").toISOString(),
  },
  {
    id: "exp-102",
    amount: 45.00,
    date: "2026-08-15",
    categoryId: "cat-transport",
    description: "Gas Station Refill",
    createdAt: new Date("2026-08-15T11:15:00").toISOString(),
  },
  {
    id: "exp-103",
    amount: 82.30,
    date: "2026-08-14",
    categoryId: "cat-food",
    description: "Weekly Organic Grocery Shopping",
    createdAt: new Date("2026-08-14T17:45:00").toISOString(),
  },
  {
    id: "exp-104",
    amount: 65.00,
    date: "2026-08-14",
    categoryId: "cat-kids",
    description: "Kids Swim Class & Playdate",
    createdAt: new Date("2026-08-14T15:00:00").toISOString(),
  },
  {
    id: "exp-105",
    amount: 120.00,
    date: "2026-08-13",
    categoryId: "cat-shopping",
    description: "New Running Shoes",
    createdAt: new Date("2026-08-13T14:20:00").toISOString(),
  },
  {
    id: "exp-106",
    amount: 18.50,
    date: "2026-08-12",
    categoryId: "cat-food",
    description: "Lunch Bento Box with Team",
    createdAt: new Date("2026-08-12T12:30:00").toISOString(),
  },
  {
    id: "exp-107",
    amount: 145.00,
    date: "2026-08-11",
    categoryId: "cat-school",
    description: "School Textbooks & Art Supplies",
    createdAt: new Date("2026-08-11T09:00:00").toISOString(),
  },
  {
    id: "exp-108",
    amount: 14.99,
    date: "2026-08-10",
    categoryId: "cat-entertainment",
    description: "Music & Movie Streaming Service",
    createdAt: new Date("2026-08-10T10:00:00").toISOString(),
  },
  {
    id: "exp-109",
    amount: 1250.00,
    date: "2026-08-01",
    categoryId: "cat-housing",
    description: "Monthly Apartment Lease",
    createdAt: new Date("2026-08-01T08:00:00").toISOString(),
  },
  {
    id: "exp-110",
    amount: 55.00,
    date: "2026-08-05",
    categoryId: "cat-health",
    description: "Monthly Gym & Spa Membership",
    createdAt: new Date("2026-08-05T07:30:00").toISOString(),
  },
];
