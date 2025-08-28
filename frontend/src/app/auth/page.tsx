"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import LoginForm from "../components/auth/login-form";
import RegisterForm from "../components/auth/register-form";
import { useAuth } from "../../contexts/auth-context";
import ShaderBackground from "../components/ui/shader-background";
import { GradualSpacing } from "../components/ui/gradual-spacing";
import { Loader as Loader } from "../components/ui/loader-9";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [hasInitialized, setHasInitialized] = useState(false);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, isLoading, router]);

  // Track initial load to prevent flash during subsequent loading states
  useEffect(() => {
    if (!isLoading) {
      setHasInitialized(true);
    }
  }, [isLoading]);

  // Only show loading spinner during initial page load
  if (isLoading && !hasInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center font-inter">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <Loader />
        </motion.div>
      </div>
    );
  }

  if (isAuthenticated) {
    return null;
  }

  return (
    <ShaderBackground>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700 px-4 font-inter">
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400/20 rounded-full blur-3xl"
            animate={{
              x: [0, 30, 0],
              y: [0, -30, 0],
            }}
            transition={{
              duration: 20,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-400/20 rounded-full blur-3xl"
            animate={{
              x: [0, -30, 0],
              y: [0, 30, 0],
            }}
            transition={{
              duration: 25,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
          />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md relative z-10 flex flex-col items-center"
        >
          {/* FormCraft Title */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-8"
          >
            <div style={{ fontFamily: "var(--font-inter)" }}>
              <GradualSpacing
                text="FormCraft"
                className="text-shadow-lg/70 text-shadow-blue-500 text-6xl font-black text-center bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent drop-shadow-lg"
              />
            </div>
          </motion.div>

          <AnimatePresence mode="wait">
            {isLogin ? (
              <motion.div
                key={`login-${hasInitialized}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="w-full"
              >
                <LoginForm onToggleForm={() => setIsLogin(false)} />
              </motion.div>
            ) : (
              <motion.div
                key={`register-${hasInitialized}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="w-full"
              >
                <RegisterForm onToggleForm={() => setIsLogin(true)} />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </ShaderBackground>
  );
}
