import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

type User = { id: string; name: string; email: string };
type Account = User & { password: string };

type AuthResult = { success: boolean; message: string };

type AuthCtx = {
  user: User | null;
  login: (email: string, password: string) => AuthResult;
  register: (name: string, email: string, password: string) => AuthResult;
  logout: () => void;
};

const AUTH_KEY = "namnguyen_auth_user_v1";
const ACCOUNTS_KEY = "namnguyen_auth_accounts_v1";
const AuthContext = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const savedAccounts = localStorage.getItem(ACCOUNTS_KEY);
      if (savedAccounts) setAccounts(JSON.parse(savedAccounts));
    } catch {
      // ignore
    }

    try {
      const savedUser = localStorage.getItem(AUTH_KEY);
      if (savedUser) setUser(JSON.parse(savedUser));
    } catch {
      // ignore
    }

    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
    } catch {
      // ignore
    }
  }, [accounts, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      if (user) {
        localStorage.setItem(AUTH_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(AUTH_KEY);
      }
    } catch {
      // ignore
    }
  }, [user, hydrated]);

  const login = (email: string, password: string): AuthResult => {
      const ADMIN_EMAIL = "admin@namnguyen.local";
      if (email.toLowerCase() === ADMIN_EMAIL) {
        return { success: false, message: "Tài khoản admin không thể đăng nhập tại đây. Vui lòng dùng trang quản trị (/admin/login)." };
      }
    const account = accounts.find((item) => item.email.toLowerCase() === email.toLowerCase());
    if (!account) {
      return { success: false, message: "Email chưa được đăng ký" };
    }
    if (account.password !== password) {
      return { success: false, message: "Mật khẩu không đúng" };
    }
    setUser({ id: account.id, name: account.name, email: account.email });
    return { success: true, message: "" };
  };

  const register = (name: string, email: string, password: string): AuthResult => {
    const ADMIN_EMAIL = "admin@namnguyen.local";
    if (email.toLowerCase() === ADMIN_EMAIL) {
      return { success: false, message: "Không thể đăng ký tài khoản admin." };
    }
    const exists = accounts.some((item) => item.email.toLowerCase() === email.toLowerCase());
    if (exists) {
      return { success: false, message: "Email đã được đăng ký" };
    }

    const id = typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `${Date.now()}`;

    const newAccount: Account = { id, name, email, password };
    setAccounts((prev) => [...prev, newAccount]);
    setUser({ id: newAccount.id, name: newAccount.name, email: newAccount.email });
    return { success: true, message: "" };
  };

  const logout = () => {
    setUser(null);
  };

  const value = useMemo<AuthCtx>(() => ({ user, login, register, logout }), [user, accounts]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
