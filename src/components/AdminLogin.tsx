import React, { useState, FormEvent } from "react";
import { motion } from "motion/react";
import { Lock, AlertCircle, Loader2 } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import { ADMIN_PASSWORD } from "../config/security";

interface AdminLoginProps {
  onLoginSuccess?: () => void;
  setIsAdminLoggedIn?: (val: boolean) => void;
  showToast?: (msg: string, type?: "success" | "error") => void;
}

export default function AdminLogin({
  onLoginSuccess,
  setIsAdminLoggedIn,
  showToast,
}: AdminLoginProps) {
  const { t } = useLanguage();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    const p = password.trim();

    if (!p) {
      setError("Please enter a password.");
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      if (p === ADMIN_PASSWORD) {
        handleSuccess();
      } else {
        setError("Incorrect password.");
        if (showToast) {
          showToast("Incorrect password.", "error");
        }
      }
      setIsLoading(false);
    }, 400); // Small artificial delay for better UX
  };

  const handleSuccess = () => {
    // Session persistence
    try {
      sessionStorage.setItem("la_admin_session", "true");
    } catch (err) {
      console.error("Session storage unavailable", err);
    }

    if (setIsAdminLoggedIn) {
      setIsAdminLoggedIn(true);
    }
    if (onLoginSuccess) {
      onLoginSuccess();
    }
    if (showToast) {
      showToast("Access granted. Welcome to LA City Cars Dashboard.", "success");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="max-w-md w-full mx-auto my-12"
      id="admin-login-wrapper"
    >
      <div
        className="bg-white rounded-3xl border border-stone-200/80 shadow-2xl overflow-hidden p-8 sm:p-10"
        id="admin-login-gate"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.3 }}
            className="w-14 h-14 rounded-2xl bg-stone-950 text-white flex items-center justify-center mx-auto mb-5 shadow-lg border border-stone-800"
            id="admin-login-icon"
          >
            <Lock className="w-6 h-6" />
          </motion.div>
          <h3 className="text-2xl font-black text-stone-950 uppercase tracking-tight font-sans">
            {t("admin.login.title") || "Admin Access"}
          </h3>
          <p className="text-stone-500 text-xs mt-2 max-w-xs mx-auto leading-relaxed">
            {t("admin.login.desc") || "Please authenticate with your LA dashboard credentials to manage the showroom fleet."}
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-50 border border-red-200/60 rounded-2xl flex items-start gap-3 text-red-700 text-xs"
            id="admin-login-error"
          >
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="font-semibold">{error}</div>
          </motion.div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5" id="admin-login-form">
          <div>
            <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-stone-400 mb-2">
              {t("admin.login.pass") || "Password"}
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 bg-stone-50 border border-stone-200 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-stone-950/10 focus:border-stone-950 transition-all text-stone-900 placeholder-stone-400 font-sans"
                id="admin-password-input"
                autoComplete="current-password"
                disabled={isLoading}
              />
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 bg-stone-950 hover:bg-stone-900 text-white text-xs font-bold uppercase tracking-widest rounded-2xl transition-all shadow-md mt-4 cursor-pointer flex items-center justify-center gap-2"
            id="admin-login-submit"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              t("admin.login.btn") || "Sign In"
            )}
          </motion.button>
        </form>
      </div>
    </motion.div>
  );
}
