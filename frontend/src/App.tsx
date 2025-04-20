"use client"

import { Toaster } from "sonner"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"

import { AuthProvider, useAuth } from "./contexts/AuthContext"

// Landing & Auth Pages
import Landing from "./pages/Landing"
import Login from "./pages/Auth/Login"
import Register from "./pages/Auth/Register"

// Student Pages
import StudentDashboard from "./pages/Student/Dashboard"
import GenerateMCQs from "./pages/Student/GenerateMCQs"
import StudentTests from "./pages/Student/Tests"
import StudentResults from "./pages/Student/Results"
import TakeTest from "./pages/Student/TakeTest"
import StudentProfile from "./pages/Student/Profile"
import StudentSettings from "./pages/Student/Settings"

// Teacher Pages
import TeacherDashboard from "./pages/Teacher/Dashboard"
import TeacherMCQGenerator from "./pages/Teacher/MCQGenerator"
import ManageTests from "./pages/Teacher/ManageTests"
import TestDetail from "./pages/Teacher/TestDetail"
import TeacherResults from "./pages/Teacher/Results"
import TeacherStudents from "./pages/Teacher/Students"
import TeacherProfile from "./pages/Teacher/Profile"
import TeacherSettings from "./pages/Teacher/Settings"

// Other
import NotFound from "./pages/NotFound"

const queryClient = new QueryClient()

// Protected route component
const ProtectedRoute = ({ children, requiredRole }: { children: JSX.Element; requiredRole?: string }) => {
  const { isAuthenticated, userRole } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (requiredRole && userRole !== requiredRole) {
    return userRole === "teacher" ? (
      <Navigate to="/teacher-dashboard" replace />
    ) : (
      <Navigate to="/student-dashboard" replace />
    )
  }

  return children
}

const AppRoutes = () => {
  const { isAuthenticated, userRole } = useAuth()

  return (
    <Routes>
      {/* Public routes */}
      <Route
        path="/"
        element={
          isAuthenticated ? (
            userRole === "teacher" ? (
              <Navigate to="/teacher-dashboard" replace />
            ) : (
              <Navigate to="/student-dashboard" replace />
            )
          ) : (
            <Landing />
          )
        }
      />
      <Route
        path="/login"
        element={
          isAuthenticated ? (
            userRole === "teacher" ? (
              <Navigate to="/teacher-dashboard" replace />
            ) : (
              <Navigate to="/student-dashboard" replace />
            )
          ) : (
            <Login />
          )
        }
      />
      <Route
        path="/register"
        element={
          isAuthenticated ? (
            userRole === "teacher" ? (
              <Navigate to="/teacher-dashboard" replace />
            ) : (
              <Navigate to="/student-dashboard" replace />
            )
          ) : (
            <Register />
          )
        }
      />

      {/* Student routes */}
      <Route
        path="/student-dashboard"
        element={
          <ProtectedRoute requiredRole="student">
            <StudentDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/generate-mcqs"
        element={
          <ProtectedRoute requiredRole="student">
            <GenerateMCQs />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/tests"
        element={
          <ProtectedRoute requiredRole="student">
            <StudentTests />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/take-test/:testName"
        element={
          <ProtectedRoute requiredRole="student">
            <TakeTest />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/results"
        element={
          <ProtectedRoute requiredRole="student">
            <StudentResults />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/results/:testName"
        element={
          <ProtectedRoute requiredRole="student">
            <StudentResults />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/profile"
        element={
          <ProtectedRoute requiredRole="student">
            <StudentProfile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/settings"
        element={
          <ProtectedRoute requiredRole="student">
            <StudentSettings />
          </ProtectedRoute>
        }
      />

      {/* Teacher routes */}
      <Route
        path="/teacher-dashboard"
        element={
          <ProtectedRoute requiredRole="teacher">
            <TeacherDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher/mcq-generator"
        element={
          <ProtectedRoute requiredRole="teacher">
            <TeacherMCQGenerator />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher/manage-tests"
        element={
          <ProtectedRoute requiredRole="teacher">
            <ManageTests />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher/tests/:testName"
        element={
          <ProtectedRoute requiredRole="teacher">
            <TestDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher/results"
        element={
          <ProtectedRoute requiredRole="teacher">
            <TeacherResults />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher/results/:testName"
        element={
          <ProtectedRoute requiredRole="teacher">
            <TeacherResults />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher/students"
        element={
          <ProtectedRoute requiredRole="teacher">
            <TeacherStudents />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher/profile"
        element={
          <ProtectedRoute requiredRole="teacher">
            <TeacherProfile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher/settings"
        element={
          <ProtectedRoute requiredRole="teacher">
            <TeacherSettings />
          </ProtectedRoute>
        }
      />

      {/* Catch-all route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <Toaster position="top-right" richColors />
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  </QueryClientProvider>
)

export default App
