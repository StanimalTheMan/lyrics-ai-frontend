"use client"
import React, { createContext, useState, useEffect, useContext } from "react"
import { isTokenExpired } from "@/lib/utils"

type AuthContextType = {
  token: string | null
  login: (token: string) => void
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    const storedToken = localStorage.getItem("token")
    if (storedToken && !isTokenExpired(storedToken)) {
      setToken(storedToken)
    } else {
      localStorage.removeItem("token")
      setToken(null)
    }
  }, [])

  const login = (newToken: string) => {
    localStorage.setItem("token", newToken)
    setToken(newToken)
  }

  const logout = () => {
    localStorage.removeItem("token")
    setToken(null)
  }

  const isAuthenticated = token !== null && !isTokenExpired(token)

  return (
    <AuthContext.Provider value={{ token, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}
