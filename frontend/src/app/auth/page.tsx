"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import LoginForm from "../components/auth/login-form"
import RegisterForm from "../components/auth/register-form"
import { useAuth } from "../../contexts/auth-context"

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const [hasInitialized, setHasInitialized] = useState(false)

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push("/")
    }
  }, [isAuthenticated, isLoading, router])

  // Track initial load to prevent flash during subsequent loading states
  useEffect(() => {
    if (!isLoading) {
      setHasInitialized(true)
    }
  }, [isLoading])

  // Only show loading spinner during initial page load
  if (isLoading && !hasInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <motion.div
            className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
          />
          <p className="text-slate-600 dark:text-slate-400">Loading...</p>
        </motion.div>
      </div>
    )
  }

  if (isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700 px-4">
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
        className="w-full max-w-md relative z-10"
      >
        <AnimatePresence mode="wait">
          {isLogin ? (
            <motion.div
              key={`login-${hasInitialized}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
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
            >
              <RegisterForm onToggleForm={() => setIsLogin(true)} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
