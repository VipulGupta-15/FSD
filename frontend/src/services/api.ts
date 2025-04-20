import { toast } from "sonner"

// Set the API URL based on environment
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api" || "http://localhost:3000/api"

// Define interfaces for API responses
export interface User {
  _id: string
  name: string
  email: string
  role: "teacher" | "student"
}

export interface MCQ {
  question: string;
  options: string[];
  correct_answer: string;
  difficulty: string;
  type: string;
  relevance_score: number;
}

export interface TestResult {
  score: number
  totalQuestions: number
  answers: Record<number, string>
  timeSpent: number
}

export interface Test {
  user_id: string
  test_name: string
  pdf_name: string
  mcqs: MCQ[]
  created_at: string
  status: "generated" | "assigned" | "active" | "stopped"
  assigned_to: string[]
  start_time: string | null
  end_time: string | null
  duration?: number
  result: Record<string, TestResult>
}

// Helper function to handle API errors
const handleApiError = (error: unknown, customMessage: string) => {
  console.error(`${customMessage}:`, error)
  const errorMessage = error instanceof Error ? error.message : "Unknown error"
  toast.error(`${customMessage}: ${errorMessage}`)
  throw error
}

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem("token")
  console.log("JWT Token:", token ? "Present" : "Missing") // Debug log
  return {
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : "",
  }
}

// Auth functions
export const register = async (userData: {
  name: string
  email: string
  password: string
  role: "teacher" | "student"
}) => {
  try {
    const response = await fetch(`${API_URL}/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify(userData),
    })
    const data = await response.json() as { token: string; user: User; message: string }
    if (!response.ok) throw new Error(data.message || "Registration failed")
    if (data.token) localStorage.setItem("token", data.token)
    if (data.user) {
      localStorage.setItem("userId", data.user._id)
      localStorage.setItem("userEmail", data.user.email)
      localStorage.setItem("userRole", data.user.role)
    }
    return data
  } catch (error) {
    handleApiError(error, "Registration failed")
    throw error
  }
}

export const login = async (userData: { email: string; password: string }) => {
  try {
    const response = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify(userData),
    })
    const data = await response.json() as { token: string; user: User }
    if (!response.ok) {
      const errorMessage = (await response.json()).message || "Login failed"
      throw new Error(errorMessage)
    }
    if (data.token) localStorage.setItem("token", data.token)
    if (data.user) {
      localStorage.setItem("userId", data.user._id)
      localStorage.setItem("userEmail", data.user.email)
      localStorage.setItem("userRole", data.user.role)
    }
    return data
  } catch (error) {
    handleApiError(error, "Login failed")
    throw error
  }
}

export const checkAuth = async () => {
  try {
    const response = await fetch(`${API_URL}/check-auth`, {
      method: "GET",
      headers: getAuthHeaders(),
    })
    const data = await response.json() as { authenticated: boolean; user: User }
    if (!response.ok) throw new Error("Authentication check failed")
    return data
  } catch (error) {
    handleApiError(error, "Authentication check failed")
    throw error
  }
}

// Profile Management
export const updateProfile = async (updates: { name?: string; email?: string; password?: string }) => {
  try {
    const response = await fetch(`${API_URL}/update-profile`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(updates),
    })
    const data = await response.json() as { message: string }
    if (!response.ok) throw new Error(data.message || "Failed to update profile")
    if (updates.name) localStorage.setItem("userName", updates.name)
    if (updates.email) localStorage.setItem("userEmail", updates.email)
    return data
  } catch (error) {
    handleApiError(error, "Failed to update profile")
    throw error
  }
}

// PDF and MCQ generation
export const uploadPDF = async (pdfFile: File) => {
  try {
    const formData = new FormData()
    formData.append("pdf", pdfFile)
    
    // Add explicit content type header for PDF
    const headers = {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    }

    const response = await fetch(`${API_URL}/upload-pdf`, {
      method: "POST",
      headers,
      body: formData,
    })
    
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || "PDF upload failed")
    }
    
    const data = await response.json() as { success: boolean; pdf_path: string; pdf_name: string }
    if (!data.success || !data.pdf_path) {
      throw new Error("Invalid response from server")
    }
    return data
  } catch (error) {
    handleApiError(error, "PDF upload failed")
    throw error
  }
}

export const generateMCQs = async (
  pdfPath: string,
  pdfName: string,
  numQuestions: number,
  difficulty: { easy: number; medium: number; hard: number },
  testName: string,
  minRelevance: number = 0.5 // Add relevance threshold parameter
) => {
  try {
    const response = await fetch(`${API_URL}/generate-mcqs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({
        pdf_path: pdfPath,
        pdf_name: pdfName,
        test_name: testName,
        difficulty: JSON.stringify(difficulty),
        min_relevance: minRelevance
      }),
    })

    const data = await response.json()
    if (!response.ok) {
      throw new Error(data.error || data.message || "Failed to generate MCQs")
    }

    if (data.mcqs?.length === 0) {
      throw new Error("No MCQs could be generated. Try adjusting the difficulty distribution or lowering the relevance threshold.")
    }

    return data
  } catch (error) {
    handleApiError(error, "MCQ generation failed")
    throw error
  }
}

// Test Management
export const reviewMCQs = async (testName: string) => {
  try {
    const response = await fetch(`${API_URL}/review-mcqs?test_name=${encodeURIComponent(testName)}`, {
      method: "GET",
      headers: getAuthHeaders(),
    })
    const data = await response.json() as { test_name: string; pdf_name: string; mcqs: MCQ[] }
    if (!response.ok) throw new Error("Failed to review MCQs")
    return data
  } catch (error) {
    handleApiError(error, "Failed to review MCQs")
    throw error
  }
}

export const updateMCQs = async (testName: string, mcqs: MCQ[]) => {
  try {
    const response = await fetch(`${API_URL}/update-mcqs`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify({ test_name: testName, mcqs }),
    })
    const data = await response.json() as { message: string }
    if (!response.ok) throw new Error(data.message || "Failed to update MCQs")
    return data
  } catch (error) {
    handleApiError(error, "Failed to update MCQs")
    throw error
  }
}

export const assignTest = async (
  testName: string,
  studentIds: string[],
  startTime: string,
  endTime: string,
  duration: number
) => {
  try {
    const response = await fetch(`${API_URL}/assign-test`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        test_name: testName,
        student_ids: studentIds,
        start_time: startTime,
        end_time: endTime,
        duration,
      }),
    })
    const data = await response.json() as { success: boolean; message: string }
    if (!response.ok) throw new Error(data.message || "Failed to assign test")
    return data
  } catch (error) {
    handleApiError(error, "Failed to assign test")
    throw error
  }
}

export const manageTest = async (testName: string, action: "start" | "stop" | "reassign", extraParams?: any) => {
  try {
    const requestBody: any = {
      test_name: testName,
      action,
    }
    if (action === "reassign" && extraParams) {
      requestBody.student_ids = extraParams.studentIds
      requestBody.start_time = extraParams.startTime
      requestBody.end_time = extraParams.endTime
    }
    const response = await fetch(`${API_URL}/manage-test`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(requestBody),
    })
    const data = await response.json() as { message: string }
    if (!response.ok) throw new Error(data.message || `Failed to ${action} test`)
    return data
  } catch (error) {
    handleApiError(error, `Failed to ${action} test`)
    throw error
  }
}

// Test Submission and Results
export const saveTestResult = async (testName: string, result: TestResult) => {
  try {
    const payload = {
      test_name: testName,
      result: result,
    }
    console.log("Sending to /save-test-result:", JSON.stringify(payload, null, 2)) // Debug log

    const response = await fetch(`${API_URL}/save-test-result`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    })

    const text = await response.text() // Get raw response
    console.log("Raw response from /save-test-result:", text) // Debug log

    let data
    try {
      data = JSON.parse(text) // Parse JSON
    } catch (parseError) {
      throw new Error("Invalid JSON response from server")
    }

    if (!response.ok) {
      throw new Error(data.error || data.message || "Failed to save test result")
    }

    return data as { message: string }
  } catch (error) {
    console.error("Error in saveTestResult:", error) // Enhanced error logging
    handleApiError(error, "Failed to save test result")
    throw error
  }
}

export const getUserTests = async (filters?: { pdf_name?: string; test_name?: string; page?: number; per_page?: number }) => {
  try {
    let url = `${API_URL}/user-tests`
    if (filters) {
      const params = new URLSearchParams()
      if (filters.pdf_name) params.append("pdf_name", filters.pdf_name)
      if (filters.test_name) params.append("test_name", filters.test_name)
      if (filters.page) params.append("page", filters.page.toString())
      if (filters.per_page) params.append("per_page", filters.per_page.toString())
      if (params.toString()) url += `?${params.toString()}`
    }
    const response = await fetch(url, {
      method: "GET",
      headers: getAuthHeaders(),
    })
    const data = await response.json() as { tests: Test[]; total: number; page: number; per_page: number; total_pages: number }
    if (!response.ok) throw new Error("Failed to fetch tests")
    return data
  } catch (error) {
    handleApiError(error, "Failed to fetch tests")
    throw error
  }
}

export const getStudentResults = async (testName: string) => {
  try {
    const response = await fetch(`${API_URL}/student-results?test_name=${encodeURIComponent(testName)}`, {
      method: "GET",
      headers: getAuthHeaders(),
    })
    const data = await response.json() as { test_name: string; results: Record<string, TestResult> }
    if (!response.ok) throw new Error("Failed to fetch student results")
    return data
  } catch (error) {
    handleApiError(error, "Failed to fetch student results")
    throw error
  }
}

export const exportResults = async (testName: string) => {
  try {
    const response = await fetch(`${API_URL}/export-results?test_name=${encodeURIComponent(testName)}`, {
      method: "GET",
      headers: getAuthHeaders(),
    })
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || "Failed to export results")
    }
    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${testName}_results.csv`
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
    return { success: true }
  } catch (error) {
    handleApiError(error, "Failed to export results")
    throw error
  }
}

// Student Management
export const getStudents = async () => {
  try {
    const response = await fetch(`${API_URL}/students`, {
      method: "GET",
      headers: getAuthHeaders(),
    })
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || "Failed to fetch students")
    }
    const data = await response.json() as User[]
    return data
  } catch (error) {
    handleApiError(error, "Failed to fetch students")
    throw error
  }
}

export const updateStudent = async (
  studentId: string,
  updates: { name?: string; email?: string; password?: string }
) => {
  try {
    const response = await fetch(`${API_URL}/students/update`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        student_id: studentId, // Fixed typo: studentELA_id → student_id
        ...updates,
      }),
    })
    const data = await response.json() as { message: string }
    if (!response.ok) throw new Error(data.message || "Failed to update student")
    return data
  } catch (error) {
    handleApiError(error, "Failed to update student")
    throw error
  }
}

export const deleteStudent = async (studentId: string) => {
  try {
    const response = await fetch(`${API_URL}/students/delete?student_id=${encodeURIComponent(studentId)}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    })
    const data = await response.json() as { message: string }
    if (!response.ok) throw new Error(data.message || "Failed to delete student")
    return data
  } catch (error) {
    handleApiError(error, "Failed to delete student")
    throw error
  }
}