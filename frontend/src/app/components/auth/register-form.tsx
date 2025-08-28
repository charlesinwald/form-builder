"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Alert, AlertDescription } from "../ui/alert"
import { useAuth } from "../../../contexts/auth-context"
import { useToast } from "../../../hooks/use-toast"
import { User, Mail, Lock, ArrowRight, CheckCircle } from "lucide-react"

interface RegisterFormProps {
  onToggleForm?: () => void
}

export default function RegisterForm({ onToggleForm }: RegisterFormProps) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { register, isLoading } = useAuth()
  const { toast } = useToast()
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Prevent multiple submissions
    if (isSubmitting || isLoading) return
    
    setError("")
    setIsSubmitting(true)

    // Validation checks
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
      const errorMessage = "Please fill in all fields"
      setError(errorMessage)
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: errorMessage,
      })
      setIsSubmitting(false)
      return
    }

    if (formData.password !== formData.confirmPassword) {
      const errorMessage = "Passwords do not match"
      setError(errorMessage)
      toast({
        variant: "destructive",
        title: "Password Mismatch",
        description: errorMessage,
      })
      setIsSubmitting(false)
      return
    }

    if (formData.password.length < 8) {
      const errorMessage = "Password must be at least 8 characters long"
      setError(errorMessage)
      toast({
        variant: "destructive",
        title: "Password Too Short",
        description: errorMessage,
      })
      setIsSubmitting(false)
      return
    }

    // Check for password strength
    const hasUpperCase = /[A-Z]/.test(formData.password)
    const hasLowerCase = /[a-z]/.test(formData.password)
    const hasNumbers = /\d/.test(formData.password)
    
    if (!hasUpperCase || !hasLowerCase || !hasNumbers) {
      const errorMessage = "Password must contain at least one uppercase letter, one lowercase letter, and one number"
      setError(errorMessage)
      toast({
        variant: "destructive",
        title: "Weak Password",
        description: errorMessage,
      })
      setIsSubmitting(false)
      return
    }

    try {
      await register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
      })
      toast({
        variant: "success",
        title: "Account Created Successfully!",
        description: "Welcome to FormCraft! You can now start creating amazing forms.",
      })
      // Only clear form on successful registration
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
      })
      router.push("/")
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Registration failed"
      setError(errorMessage)
      toast({
        variant: "destructive",
        title: "Registration Failed",
        description: errorMessage,
      })
      // Form data should remain intact for user convenience
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}>
      <Card className="w-full max-w-md backdrop-blur-sm bg-white/80 dark:bg-slate-900/80 border-white/20 shadow-2xl">
        <CardHeader className="text-center pb-8">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Create Account
            </CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400 mt-2">
              Join us today and get started
            </CardDescription>
          </motion.div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
              >
                <Alert variant="destructive" className="border-red-200 bg-red-50 dark:bg-red-950/50">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-2 gap-4"
            >
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-slate-700 dark:text-slate-300 font-medium">
                  First Name
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <Input
                    id="firstName"
                    name="firstName"
                    type="text"
                    placeholder="First name"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    disabled={isLoading || isSubmitting}
                    autoComplete="given-name"
                    className="pl-10 h-12 border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-slate-700 dark:text-slate-300 font-medium">
                  Last Name
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <Input
                    id="lastName"
                    name="lastName"
                    type="text"
                    placeholder="Last name"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                    disabled={isLoading || isSubmitting}
                    autoComplete="family-name"
                    className="pl-10 h-12 border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200"
                  />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-2"
            >
              <Label htmlFor="email" className="text-slate-700 dark:text-slate-300 font-medium">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled={isLoading || isSubmitting}
                  autoComplete="email"
                  className="pl-10 h-12 border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200"
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="space-y-2"
            >
              <Label htmlFor="password" className="text-slate-700 dark:text-slate-300 font-medium">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Create a strong password (min. 8 characters, include A-Z, a-z, 0-9)"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  disabled={isLoading || isSubmitting}
                  autoComplete="new-password"
                  className="pl-10 h-12 border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200"
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="space-y-2"
            >
              <Label htmlFor="confirmPassword" className="text-slate-700 dark:text-slate-300 font-medium">
                Confirm Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  disabled={isLoading || isSubmitting}
                  autoComplete="new-password"
                  className="pl-10 h-12 border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200"
                />
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200 group"
                disabled={isLoading || isSubmitting}
              >
                {isLoading || isSubmitting ? (
                  <motion.div className="flex items-center gap-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <motion.div
                      className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                    />
                    Creating Account...
                  </motion.div>
                ) : (
                  <span className="flex items-center gap-2">
                    Create Account
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
                  </span>
                )}
              </Button>
            </motion.div>

            {onToggleForm && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="text-center pt-4"
              >
                <span className="text-slate-600 dark:text-slate-400">Already have an account? </span>
                <Button
                  type="button"
                  variant="link"
                  className="p-0 h-auto font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                  onClick={onToggleForm}
                >
                  Sign in instead
                </Button>
              </motion.div>
            )}
          </form>
        </CardContent>
      </Card>
    </motion.div>
  )
}
