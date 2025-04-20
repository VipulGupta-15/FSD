"use client"

import type React from "react"
import { createContext, useState, useContext, useEffect, type ReactNode } from "react"
import { login as apiLogin, register as apiRegister, checkAuth } from "../services/api"
import { toast } from "sonner"

interface AuthContextType {
  isAuthenticated: boolean
  userRole: string | null
  userName: string | null
  login: (email: string, password: string, role: "teacher" | "student") => Promise<void>
  register: (name: string, email: string, password: string, role: "teacher" | "student") => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [userName, setUserName] = useState<string | null>(null)

  useEffect(() => {
    // Check if user is already authenticated
    const token = localStorage.getItem("token")
    const role = localStorage.getItem("userRole")
    const name = localStorage.getItem("userName")

    if (token) {
      console.log("Found token in localStorage, checking validity...")

      // Verify token validity with the server
      const verifyToken = async () => {
        try {
          const authData = await checkAuth()
          if (authData.authenticated) {
            console.log("Token is valid, user authenticated")
            setIsAuthenticated(true)
            setUserRole(authData.user.role)
            setUserName(authData.user.name)

            // Update localStorage with fresh data
            localStorage.setItem("userRole", authData.user.role)
            localStorage.setItem("userName", authData.user.name)
          } else {
            console.log("Token is invalid, clearing auth state")
            handleLogout()
          }
        } catch (error) {
          console.error("Error verifying token:", error)
          // If there's an error checking the token, we'll just use the stored values
          // but we won't clear the auth state, as it might be a temporary server issue
          setIsAuthenticated(true)
          setUserRole(role)
          setUserName(name)
        }
      }

      verifyToken()
    } else {
      console.log("No token found in localStorage")
      setIsAuthenticated(false)
      setUserRole(null)
      setUserName(null)
    }
  }, [])

  const loginUser = async (email: string, password: string, role: "teacher" | "student") => {
    try {
      console.log("Attempting login with credentials:", { email, role })
      const response = await apiLogin({ email, password, role })
      console.log("Login successful, response:", response)

      localStorage.setItem("token", response.token)
      localStorage.setItem("userRole", response.user.role)
      localStorage.setItem("userName", response.user.name)
      localStorage.setItem("userId", response.user.id)
      localStorage.setItem("userEmail", response.user.email)

      setIsAuthenticated(true)
      setUserRole(response.user.role)
      setUserName(response.user.name)

      toast.success("Logged in successfully!")
    } catch (error) {
      console.error("Login failed:", error)
      toast.error("Login failed. Please check your credentials and ensure the API server is running.")
      throw error
    }
  }

  const registerUser = async (name: string, email: string, password: string, role: "teacher" | "student") => {
    try {
      console.log("Attempting registration with data:", { name, email, role })
      const response = await apiRegister({ name, email, password, role })
      console.log("Registration successful, response:", response)

      localStorage.setItem("token", response.token)
      localStorage.setItem("userRole", response.user.role)
      localStorage.setItem("userName", response.user.name)
      localStorage.setItem("userId", response.user.id)
      localStorage.setItem("userEmail", response.user.email)

      setIsAuthenticated(true)
      setUserRole(response.user.role)
      setUserName(name)

      toast.success("Registered successfully!")
    } catch (error) {
      console.error("Registration failed:", error)
      toast.error("Registration failed. Please try again and ensure the API server is running.")
      throw error
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("userRole")
    localStorage.removeItem("userName")
    localStorage.removeItem("userId")
    localStorage.removeItem("userEmail")
    setIsAuthenticated(false)
    setUserRole(null)
    setUserName(null)
    toast.success("Logged out successfully!")
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        userRole,
        userName,
        login: loginUser,
        register: registerUser,
        logout: handleLogout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
