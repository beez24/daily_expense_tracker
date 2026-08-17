import { User, LoginCredentials, SignupCredentials } from "@/types/auth";
import { generateId } from "./utils";

const USERS_KEY = "daily_expense_tracker_users_v1";
const SESSION_KEY = "daily_expense_tracker_active_session_v1";

interface StoredUserAccount extends User {
  passwordHash: string;
}

export function getStoredUsers(): StoredUserAccount[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(USERS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (error) {
    return [];
  }
}

export function saveStoredUsers(users: StoredUserAccount[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  } catch (error) {
    console.error("Error saving user accounts:", error);
  }
}

export function getActiveSession(): User | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (error) {
    return null;
  }
}

export function setActiveSession(user: User | null): void {
  if (typeof window === "undefined") return;
  try {
    if (user) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(SESSION_KEY);
    }
  } catch (error) {
    console.error("Error saving active session:", error);
  }
}

export function registerUser(credentials: SignupCredentials): { success: boolean; user?: User; message: string } {
  const { name, email, password } = credentials;
  const normalizedEmail = email.trim().toLowerCase();

  if (!name.trim()) return { success: false, message: "Full Name is required." };
  if (!normalizedEmail || !normalizedEmail.includes("@")) return { success: false, message: "Valid email address is required." };
  if (!password || password.length < 6) return { success: false, message: "Password must be at least 6 characters." };

  const users = getStoredUsers();
  const existing = users.find((u) => u.email.toLowerCase() === normalizedEmail);

  if (existing) {
    return { success: false, message: "An account with this email address already exists. Please sign in." };
  }

  const newUser: StoredUserAccount = {
    id: "user-" + generateId(),
    name: name.trim(),
    email: normalizedEmail,
    passwordHash: password,
    createdAt: new Date().toISOString(),
  };

  const updatedUsers = [...users, newUser];
  saveStoredUsers(updatedUsers);

  const publicUser: User = {
    id: newUser.id,
    name: newUser.name,
    email: newUser.email,
    createdAt: newUser.createdAt,
  };

  setActiveSession(publicUser);
  return { success: true, user: publicUser, message: "Account created successfully!" };
}

export function authenticateUser(credentials: LoginCredentials): { success: boolean; user?: User; message: string } {
  const { email, password } = credentials;
  const normalizedEmail = email.trim().toLowerCase();

  const users = getStoredUsers();
  const account = users.find((u) => u.email.toLowerCase() === normalizedEmail);

  if (!account) {
    return { success: false, message: "No account found with this email address. Please create an account." };
  }

  if (account.passwordHash !== password) {
    return { success: false, message: "Incorrect password. Please try again." };
  }

  const publicUser: User = {
    id: account.id,
    name: account.name,
    email: account.email,
    createdAt: account.createdAt,
  };

  setActiveSession(publicUser);
  return { success: true, user: publicUser, message: "Signed in successfully!" };
}
