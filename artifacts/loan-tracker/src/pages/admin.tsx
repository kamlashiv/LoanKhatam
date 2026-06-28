import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Shield, Mail, Phone, Calendar, LogOut, Loader2, ArrowLeft, Percent } from "lucide-react";
import { Link } from "wouter";

interface ClerkUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  createdAt: string;
}

export function AdminPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return sessionStorage.getItem("superadmin_logged_in") === "true";
  });
  const [users, setUsers] = useState<ClerkUser[]>([]);
  const [discountEnabled, setDiscountEnabled] = useState(true);
  const [configSaving, setConfigSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) return;
    setError("");
    fetchUsers(username, password);
  };

  const fetchUsers = async (u: string, p: string) => {
    setLoading(true);
    try {
      const credentials = btoa(`${u}:${p}`);
      const res = await fetch("/api/admin/users", {
        headers: {
          Authorization: `Basic ${credentials}`,
        },
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Invalid username or password");
      }

      const data = await res.json();
      setUsers(data.users || []);
      setIsLoggedIn(true);
      sessionStorage.setItem("superadmin_logged_in", "true");
      sessionStorage.setItem("superadmin_u", u);
      sessionStorage.setItem("superadmin_p", p);
    } catch (err: any) {
      setError(err.message || "Failed to authenticate");
    } finally {
      setLoading(false);
    }
  };

  const fetchConfig = async () => {
    try {
      const res = await fetch("/api/admin/config");
      if (res.ok) {
        const data = await res.json();
        setDiscountEnabled(data.discountEnabled !== false);
      }
    } catch (e) {
      console.error("Failed to fetch admin config:", e);
    }
  };

  useEffect(() => {
    fetchConfig();
    if (isLoggedIn) {
      const u = sessionStorage.getItem("superadmin_u") || "";
      const p = sessionStorage.getItem("superadmin_p") || "";
      fetchUsers(u, p);
    }
  }, [isLoggedIn]);

  const handleToggleDiscount = async (checked: boolean) => {
    const u = sessionStorage.getItem("superadmin_u") || "";
    const p = sessionStorage.getItem("superadmin_p") || "";
    const credentials = btoa(`${u}:${p}`);
    setConfigSaving(true);
    try {
      const res = await fetch("/api/admin/config", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${credentials}`,
        },
        body: JSON.stringify({ discountEnabled: checked }),
      });
      if (res.ok) {
        setDiscountEnabled(checked);
      } else {
        alert("Failed to update config");
      }
    } catch (err) {
      console.error(err);
      alert("Error saving config");
    } finally {
      setConfigSaving(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.clear();
    setIsLoggedIn(false);
    setUsers([]);
    setUsername("");
    setPassword("");
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
        <Card className="w-full max-w-md p-6 rounded-[2rem] border border-border shadow-2xl bg-white dark:bg-slate-900 space-y-6">
          <div className="text-center space-y-2">
            <div className="mx-auto h-12 w-12 rounded-2xl bg-indigo-100 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-md">
              <Shield className="h-6 w-6" />
            </div>
            <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100">Superadmin Login</h1>
            <p className="text-xs text-muted-foreground">Access Loan Khatam registered user database</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="e.g. admin@example.com"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="rounded-xl"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="rounded-xl"
              />
            </div>

            {error && (
              <p className="text-xs font-bold text-rose-500 bg-rose-50 dark:bg-rose-950/20 p-3 rounded-xl border border-rose-100 dark:border-rose-950/30 text-center">
                {error}
              </p>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl font-bold bg-indigo-600 hover:bg-indigo-700 text-white h-11"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Logging in...
                </>
              ) : (
                "Log In"
              )}
            </Button>
          </form>

          <div className="text-center">
            <Button asChild variant="link" size="sm" className="text-xs">
              <Link href="/" className="inline-flex items-center gap-1">
                <ArrowLeft className="h-3 w-3" /> Back to Home
              </Link>
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 sm:p-6 lg:p-8">
      <div className="max-w-[1280px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-border shadow-sm">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping" />
              <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">Superadmin Dashboard</h1>
            </div>
            <p className="text-xs text-muted-foreground">Authorized access only — displaying all registered users from Clerk</p>
          </div>
          <div className="flex gap-3">
            <Button asChild variant="outline" size="sm" className="rounded-xl font-bold">
              <Link href="/">Home</Link>
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleLogout}
              className="rounded-xl font-bold gap-1.5"
            >
              <LogOut className="h-4 w-4" /> Logout
            </Button>
          </div>
        </div>

        {/* Stats and Authority Panel */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* User Stats Card */}
          <Card className="p-6 rounded-[2rem] border border-border shadow-sm bg-white dark:bg-slate-900">
            <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Total Users</span>
            <span className="text-3xl font-black text-slate-800 dark:text-slate-100 mt-2 block">{users.length}</span>
          </Card>

          {/* Discount Offer Authority Toggle */}
          <Card className="p-6 rounded-[2rem] border border-border shadow-sm bg-white dark:bg-slate-900 md:col-span-2 space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-1.5">
                <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                  <Percent className="h-4.5 w-4.5 text-indigo-600" /> Discount offer Active? (डिस्काउंट पैनल चालू रखें?)
                </h2>
                <p className="text-xs text-muted-foreground">
                  Toggle whether the premium upgrade features show the special ₹99 promo discount or regular pricing (₹1,000).
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                {configSaving && <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />}
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={discountEnabled}
                    onChange={(e) => handleToggleDiscount(e.target.checked)}
                    disabled={configSaving}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-indigo-600"></div>
                </label>
              </div>
            </div>
            <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400 dark:text-slate-500">Current Settings:</span>
              {discountEnabled ? (
                <span className="text-xs font-bold text-emerald-600 bg-emerald-100 dark:bg-emerald-950/40 px-2 py-0.5 rounded-lg border border-emerald-200/40 dark:border-emerald-800/30">
                  ₹99 Offer Enabled
                </span>
              ) : (
                <span className="text-xs font-bold text-slate-600 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-lg border border-slate-200/40 dark:border-slate-700/30">
                  ₹1,000 Full Price Active
                </span>
              )}
            </div>
          </Card>
        </div>

        {/* Users Table Card */}
        <Card className="rounded-[2rem] border border-border shadow-sm bg-white dark:bg-slate-900 overflow-hidden">
          <div className="p-6 border-b border-border">
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Registered Users List</h2>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-12 flex flex-col items-center justify-center text-muted-foreground gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                <span className="text-sm font-semibold">Loading users...</span>
              </div>
            ) : users.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground">
                <p className="font-semibold">No users found</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 text-xs font-bold uppercase border-b border-border">
                    <th className="px-6 py-4">Name</th>
                    <th className="px-6 py-4">Email</th>
                    <th className="px-6 py-4">Phone Number</th>
                    <th className="px-6 py-4">Signed Up</th>
                    <th className="px-6 py-4">User ID</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-sm">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/20 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-800 dark:text-slate-100">
                        {user.firstName || user.lastName ? `${user.firstName} ${user.lastName}`.trim() : "—"}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        <span className="inline-flex items-center gap-1.5">
                          <Mail className="h-3.5 w-3.5 text-slate-400" /> {user.email}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        <span className="inline-flex items-center gap-1.5">
                          <Phone className="h-3.5 w-3.5 text-slate-400" /> {user.phone}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        <span className="inline-flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-slate-400" /> {new Date(user.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-slate-400">
                        {user.id}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
