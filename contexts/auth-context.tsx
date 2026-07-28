"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

interface User {
  id: string
  email: string
  name: string
  institution: string
  createdAt?: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  signup: (email: string, password: string, name: string, institution: string) => Promise<boolean>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for existing session via HTTP cookie on mount
    const checkSession = async () => {
      try {
        const response = await fetch("/api/auth/me")
        if (response.ok) {
          const data = await response.json()
          if (data.user) {
            setUser(data.user)
          } else {
            setUser(null)
          }
        }
      } catch (err) {
        console.error("Session verification failed:", err)
      } finally {
        setIsLoading(false)
      }
    }
    checkSession()
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      if (response.ok) {
        const data = await response.json()
        setUser(data)
        setIsLoading(false)
        return true
      }
    } catch (err) {
      console.error("Login request failed:", err)
    }

    setIsLoading(false)
    return false
  }

  const signup = async (
    email: string,
    password: string,
    name: string,
    institution: string
  ): Promise<boolean> => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name, institution }),
      })

      if (response.ok) {
        const data = await response.json()
        setUser(data)
        setIsLoading(false)
        return true
      }
    } catch (err) {
      console.error("Signup request failed:", err)
    }

    setIsLoading(false)
    return false
  }

  const logout = async () => {
    setIsLoading(true)
    try {
      await fetch("/api/auth/logout", { method: "POST" })
    } catch (err) {
      console.error("Logout request failed:", err)
    }
    setUser(null)
    setIsLoading(false)
  }

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}