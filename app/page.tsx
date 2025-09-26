"use client"

import { useCallback, useEffect, useState } from "react"

import { ApiLogsCard } from "@/components/graph-presence/api-logs-card"
import { AuthenticationCard } from "@/components/graph-presence/authentication-card"
import { PreferredPresenceCard } from "@/components/graph-presence/preferred-presence-card"
import { PresenceCard } from "@/components/graph-presence/presence-card"
import { SessionPresenceCard } from "@/components/graph-presence/session-presence-card"
import { UserInfoCard } from "@/components/graph-presence/user-info-card"
import { Card, CardContent } from "@/components/ui/card"
import { useApiLogs } from "@/hooks/use-api-logs"
import { useToast } from "@/hooks/use-toast"
import {
  appPresenceOptions,
  type PresenceData,
  type UserData,
  userPresenceOptions,
  type ApiLogStatus,
} from "@/lib/presence"

export default function GraphPresenceTester() {
  const [tenantId, setTenantId] = useState("")
  const [appId, setAppId] = useState("")
  const [appSecret, setAppSecret] = useState("")
  const [userObjectId, setUserObjectId] = useState("")
  const [appToken, setAppToken] = useState("")
  const [showSecret, setShowSecret] = useState(false)

  const [presenceData, setPresenceData] = useState<PresenceData | null>(null)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(false)

  const [userPresenceSelection, setUserPresenceSelection] = useState(0)
  const [expirationDuration, setExpirationDuration] = useState("PT5M")

  const [appPresenceSelection, setAppPresenceSelection] = useState(0)

  const { toast } = useToast()
  const { apiLogs, addLog, clearLogs } = useApiLogs()
  const [isLogsOpen, setIsLogsOpen] = useState(false)

  const addApiLog = useCallback(
    (method: string, endpoint: string, request: unknown, response: unknown, status: ApiLogStatus, duration: number) => {
      addLog({ method, endpoint, request, response, status, duration })
    },
    [addLog],
  )

  const handleClearLogs = useCallback(() => {
    clearLogs()
    toast({
      title: "Success",
      description: "API logs cleared",
    })
  }, [clearLogs, toast])

  useEffect(() => {
    const storedTenantId = localStorage.getItem("graph-tester-tenantId")
    const storedAppId = localStorage.getItem("graph-tester-appId")
    const storedUserObjectId = localStorage.getItem("graph-tester-userObjectId")
    const storedAppSecret = sessionStorage.getItem("graph-tester-appSecret")

    if (storedTenantId) setTenantId(storedTenantId)
    if (storedAppId) setAppId(storedAppId)
    if (storedUserObjectId) setUserObjectId(storedUserObjectId)
    if (storedAppSecret) setAppSecret(storedAppSecret)
  }, [])

  useEffect(() => {
    if (tenantId) {
      localStorage.setItem("graph-tester-tenantId", tenantId)
    } else {
      localStorage.removeItem("graph-tester-tenantId")
    }
  }, [tenantId])

  useEffect(() => {
    if (appId) {
      localStorage.setItem("graph-tester-appId", appId)
    } else {
      localStorage.removeItem("graph-tester-appId")
    }
  }, [appId])

  useEffect(() => {
    if (userObjectId) {
      localStorage.setItem("graph-tester-userObjectId", userObjectId)
    } else {
      localStorage.removeItem("graph-tester-userObjectId")
    }
  }, [userObjectId])

  useEffect(() => {
    if (appSecret) {
      sessionStorage.setItem("graph-tester-appSecret", appSecret)
    } else {
      sessionStorage.removeItem("graph-tester-appSecret")
    }
  }, [appSecret])

  const clearStoredData = useCallback(() => {
    localStorage.removeItem("graph-tester-tenantId")
    localStorage.removeItem("graph-tester-appId")
    localStorage.removeItem("graph-tester-userObjectId")
    sessionStorage.removeItem("graph-tester-appSecret")

    setTenantId("")
    setAppId("")
    setAppSecret("")
    setUserObjectId("")
    setAppToken("")

    toast({
      title: "Success",
      description: "All stored authentication data has been cleared",
    })
  }, [toast])

  const makeGraphRequest = useCallback(
    async (action: string, body?: unknown, token?: string) => {
      const accessToken = token || appToken
      const startTime = Date.now()

      if (!accessToken) {
        toast({
          title: "Error",
          description: "Please acquire an app token first",
          variant: "destructive",
        })
        return null
      }

      if (!userObjectId) {
        toast({
          title: "Error",
          description: "Please provide a user object ID",
          variant: "destructive",
        })
        return null
      }

      try {
        const requestPayload = {
          token: accessToken,
          userObjectId,
          action,
          body,
        }

        const response = await fetch("/api/presence", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestPayload),
        })

        const duration = Date.now() - startTime
        const responseData = await response.json()

        if (!response.ok) {
          addApiLog("POST", `/api/presence (${action})`, requestPayload, responseData, "error", duration)
          throw new Error(responseData.error || `HTTP ${response.status}`)
        }

        addApiLog("POST", `/api/presence (${action})`, requestPayload, responseData, "success", duration)
        return responseData
      } catch (error) {
        const duration = Date.now() - startTime
        const errorResponse = { error: error instanceof Error ? error.message : "Unknown error occurred" }

        addApiLog("POST", `/api/presence (${action})`, { action, body }, errorResponse, "error", duration)

        console.error("Graph API Error:", error)
        toast({
          title: "API Error",
          description: error instanceof Error ? error.message : "Unknown error occurred",
          variant: "destructive",
        })
        return null
      }
    },
    [addApiLog, appToken, toast, userObjectId],
  )

  const getAppToken = useCallback(async () => {
    if (!tenantId || !appId || !appSecret) {
      toast({
        title: "Error",
        description: "Please provide tenant ID, app ID, and app secret",
        variant: "destructive",
      })
      return false
    }

    setLoading(true)
    const startTime = Date.now()

    try {
      const requestPayload = {
        tenantId,
        appId,
        appSecret,
      }

      const response = await fetch("/api/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestPayload),
      })

      const duration = Date.now() - startTime
      const responseData = await response.json()

      if (!response.ok) {
        addApiLog("POST", "/api/token", requestPayload, responseData, "error", duration)
        throw new Error(responseData.error || `HTTP ${response.status}`)
      }

      addApiLog("POST", "/api/token", requestPayload, responseData, "success", duration)

      setAppToken(responseData.access_token)

      toast({
        title: "Success",
        description: "App token acquired successfully",
      })

      if (userObjectId) {
        const userData = await makeGraphRequest("getUser", undefined, responseData.access_token)
        if (userData) {
          setUserData(userData)
        }

        const body = {
          ids: [userObjectId],
        }
        const presenceData = await makeGraphRequest("getPresence", body, responseData.access_token)

        if (presenceData && presenceData.value && presenceData.value.length > 0) {
          setPresenceData(presenceData.value[0])
        }

        toast({
          title: "Complete",
          description: "Token acquired and user data retrieved",
        })
      }

      setLoading(false)
      return true
    } catch (error) {
      const duration = Date.now() - startTime
      const errorResponse = { error: error instanceof Error ? error.message : "Failed to acquire token" }

      addApiLog("POST", "/api/token", { tenantId, appId }, errorResponse, "error", duration)

      console.error("Token acquisition error:", error)
      toast({
        title: "Authentication Error",
        description: error instanceof Error ? error.message : "Failed to acquire token",
        variant: "destructive",
      })
      setLoading(false)
      return false
    }
  }, [addApiLog, appId, appSecret, makeGraphRequest, tenantId, toast, userObjectId])

  const whoAmI = useCallback(async () => {
    if (!userObjectId) {
      toast({
        title: "Error",
        description: "Please provide a user object ID",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    const data = await makeGraphRequest("getUser")
    if (data) {
      setUserData(data)
      toast({
        title: "Success",
        description: "User information retrieved successfully",
      })
    }
    setLoading(false)
  }, [makeGraphRequest, toast, userObjectId])

  const getPresence = useCallback(async () => {
    if (!userObjectId) {
      toast({
        title: "Error",
        description: "Please provide a user object ID",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    const body = {
      ids: [userObjectId],
    }

    const data = await makeGraphRequest("getPresence", body)

    if (data && data.value && data.value.length > 0) {
      setPresenceData(data.value[0])
      toast({
        title: "Success",
        description: "Presence data retrieved successfully",
      })
    } else {
      toast({
        title: "Warning",
        description: "No presence data found for the specified user",
        variant: "destructive",
      })
    }
    setLoading(false)
  }, [makeGraphRequest, toast, userObjectId])

  const setUserPresence = useCallback(async () => {
    if (!userObjectId) {
      toast({
        title: "Error",
        description: "Please provide a user object ID",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    const selectedOption = userPresenceOptions[userPresenceSelection]
    const body = {
      sessionId: appId,
      availability: selectedOption.availability,
      activity: selectedOption.activity,
      expirationDuration,
    }

    const result = await makeGraphRequest("setPresence", body)
    if (result) {
      toast({
        title: "Success",
        description: "User presence set successfully",
      })
      await getPresence()
    }
    setLoading(false)
  }, [appId, expirationDuration, getPresence, makeGraphRequest, toast, userObjectId, userPresenceSelection])

  const clearUserPresence = useCallback(async () => {
    if (!userObjectId) {
      toast({
        title: "Error",
        description: "Please provide a user object ID",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    const body = {
      sessionId: appId,
    }

    const result = await makeGraphRequest("clearPresence", body)
    if (result) {
      toast({
        title: "Success",
        description: "User presence cleared successfully",
      })
      await getPresence()
    }
    setLoading(false)
  }, [appId, getPresence, makeGraphRequest, toast, userObjectId])

  const setAppPresence = useCallback(async () => {
    if (!userObjectId) {
      toast({
        title: "Error",
        description: "Please provide a user object ID",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    const selectedOption = appPresenceOptions[appPresenceSelection]
    const body = {
      availability: selectedOption.availability,
      activity: selectedOption.activity,
    }

    const result = await makeGraphRequest("setUserPreferredPresence", body)
    if (result) {
      toast({
        title: "Success",
        description: "User preferred presence set successfully",
      })
      await getPresence()
    }
    setLoading(false)
  }, [appPresenceSelection, getPresence, makeGraphRequest, toast, userObjectId])

  const clearAppPresence = useCallback(async () => {
    if (!userObjectId) {
      toast({
        title: "Error",
        description: "Please provide a user object ID",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    const result = await makeGraphRequest("clearUserPreferredPresence")
    if (result) {
      toast({
        title: "Success",
        description: "User preferred presence cleared successfully",
      })
      await getPresence()
    }
    setLoading(false)
  }, [getPresence, makeGraphRequest, toast, userObjectId])

  const isAuthenticated = !!appToken
  const canAuthenticate = tenantId && appId && appSecret

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-balance">Microsoft Graph Presence API Tester</h1>
        <p className="text-muted-foreground mt-2">Test Microsoft Graph Presence APIs using client credentials authentication</p>
      </div>

      <AuthenticationCard
        tenantId={tenantId}
        appId={appId}
        appSecret={appSecret}
        userObjectId={userObjectId}
        showSecret={showSecret}
        loading={loading}
        isAuthenticated={isAuthenticated}
        canAuthenticate={!!canAuthenticate}
        onTenantIdChange={setTenantId}
        onAppIdChange={setAppId}
        onAppSecretChange={setAppSecret}
        onUserObjectIdChange={setUserObjectId}
        onToggleSecret={() => setShowSecret((previous) => !previous)}
        onGetAppToken={getAppToken}
        onClearStoredData={clearStoredData}
      />

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <UserInfoCard
          userData={userData}
          loading={loading}
          isAuthenticated={isAuthenticated}
          userObjectId={userObjectId}
          onWhoAmI={whoAmI}
        />

        <PresenceCard
          presenceData={presenceData}
          loading={loading}
          isAuthenticated={isAuthenticated}
          userObjectId={userObjectId}
          onGetPresence={getPresence}
        />
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <SessionPresenceCard
          loading={loading}
          isAuthenticated={isAuthenticated}
          userObjectId={userObjectId}
          userPresenceSelection={userPresenceSelection}
          expirationDuration={expirationDuration}
          onSelectPresence={setUserPresenceSelection}
          onExpirationChange={setExpirationDuration}
          onSetPresence={setUserPresence}
          onClearPresence={clearUserPresence}
        />

        <PreferredPresenceCard
          loading={loading}
          isAuthenticated={isAuthenticated}
          userObjectId={userObjectId}
          appPresenceSelection={appPresenceSelection}
          onSelectPresence={setAppPresenceSelection}
          onSetPreferredPresence={setAppPresence}
          onClearPreferredPresence={clearAppPresence}
        />
      </div>

      <ApiLogsCard apiLogs={apiLogs} isOpen={isLogsOpen} onToggle={setIsLogsOpen} onClearLogs={handleClearLogs} />

      <Card className="mt-6">
        <CardContent className="pt-6">
          <div className="text-center text-sm text-muted-foreground space-y-3">
            <p>
              <strong>Built with v0 AI</strong> - This entire project was generated using v0.
            </p>
            <p>
              <strong>Open Source</strong> - Fork and modify this tool on GitHub: <br />
              <a
                href="https://github.com/sstoitsev/graph-presence-api-tester"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline font-mono text-xs"
              >
                https://github.com/sstoitsev/graph-presence-api-tester
              </a>
            </p>
            <p>
              Special thanks to <strong>Tom van Leijsen</strong> at <strong>AnywhereNow</strong> for sharing the original
              script and clarifying the logic on how Microsoft Graph Presence APIs work, which helped create this
              interactive testing tool.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
