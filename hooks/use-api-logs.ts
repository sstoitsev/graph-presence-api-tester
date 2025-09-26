import { useCallback, useState } from "react"

import type { ApiLog, ApiLogInput } from "@/lib/presence"

const SENSITIVE_KEYS = ["token", "access_token", "authorization", "bearer", "secret", "password"]

const shouldRedactString = (value: string) => {
  if (value.length <= 50) {
    return false
  }

  return value.includes(".") || /^[A-Za-z0-9_-]+$/.test(value)
}

const stripTokens = (input: unknown): unknown => {
  if (input === null || input === undefined) {
    return input
  }

  if (typeof input === "string") {
    return shouldRedactString(input) ? "[TOKEN_REDACTED]" : input
  }

  if (Array.isArray(input)) {
    return input.map((item) => stripTokens(item))
  }

  if (typeof input === "object") {
    return Object.entries(input as Record<string, unknown>).reduce<Record<string, unknown>>((acc, [key, value]) => {
      if (SENSITIVE_KEYS.some((field) => key.toLowerCase().includes(field))) {
        acc[key] = "[TOKEN_REDACTED]"
      } else {
        acc[key] = stripTokens(value)
      }
      return acc
    }, {})
  }

  return input
}

export const useApiLogs = () => {
  const [apiLogs, setApiLogs] = useState<ApiLog[]>([])

  const addLog = useCallback((log: ApiLogInput) => {
    const entry: ApiLog = {
      ...log,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      request: stripTokens(log.request),
      response: stripTokens(log.response),
    }

    setApiLogs((previous) => [entry, ...previous].slice(0, 50))
  }, [])

  const clearLogs = useCallback(() => {
    setApiLogs([])
  }, [])

  return { apiLogs, addLog, clearLogs }
}
