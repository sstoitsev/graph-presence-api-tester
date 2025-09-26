"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"

interface PresenceData {
  id?: string
  availability?: string
  activity?: string
  statusMessage?: {
    message?: {
      content?: string
      contentType?: string
    }
    publishedDateTime?: string
  }
}

interface UserData {
  displayName?: string
  userPrincipalName?: string
  id?: string
}

const userPresenceOptions = [
  { availability: "Available", activity: "Available", label: "Available / Available" },
  { availability: "Busy", activity: "InACall", label: "Busy / In a Call" },
  { availability: "Busy", activity: "InAConferenceCall", label: "Busy / In a Conference Call" },
  { availability: "Away", activity: "Away", label: "Away / Away" },
  { availability: "DoNotDisturb", activity: "Presenting", label: "Do Not Disturb / Presenting" },
]

const appPresenceOptions = [
  { availability: "Available", activity: "Available", label: "Available / Available" },
  { availability: "Busy", activity: "Busy", label: "Busy / Busy" },
  { availability: "DoNotDisturb", activity: "DoNotDisturb", label: "Do Not Disturb / Do Not Disturb" },
  { availability: "BeRightBack", activity: "BeRightBack", label: "Be Right Back / Be Right Back" },
  { availability: "Away", activity: "Away", label: "Away / Away" },
  { availability: "Offline", activity: "OffWork", label: "Offline / Off Work" },
]

export default function GraphPresenceTester() {
  const [tenantId, setTenantId] = useState("")
  const [appId, setAppId] = useState("")
  const [appSecret, setAppSecret] = useState("")
  const [userObjectId, setUserObjectId] = useState("")
  const [appToken, setAppToken] = useState("")

  const [presenceData, setPresenceData] = useState<PresenceData | null>(null)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(false)

  const [userPresenceSelection, setUserPresenceSelection] = useState(0)
  const [expirationDuration, setExpirationDuration] = useState("PT5M")

  const [appPresenceSelection, setAppPresenceSelection] = useState(0)

  const { toast } = useToast()

  useEffect(() => {
    // Load non-sensitive data from localStorage (persists across browser sessions)
    const storedTenantId = localStorage.getItem("graph-tester-tenantId")
    const storedAppId = localStorage.getItem("graph-tester-appId")
    const storedUserObjectId = localStorage.getItem("graph-tester-userObjectId")

    // Load sensitive data from sessionStorage (cleared when tab closes)
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

  const clearStoredData = () => {
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
  }

  const makeGraphRequest = async (action: string, body?: any, token?: string) => {
    const accessToken = token || appToken

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
      const response = await fetch("/api/presence", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: accessToken, // Use the passed token or state token
          userObjectId,
          action,
          body,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error("Graph API Error:", error)
      toast({
        title: "API Error",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      })
      return null
    }
  }

  const getAppToken = async () => {
    if (!tenantId || !appId || !appSecret) {
      toast({
        title: "Error",
        description: "Please provide tenant ID, app ID, and app secret",
        variant: "destructive",
      })
      return false
    }

    setLoading(true)
    try {
      const response = await fetch("/api/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tenantId,
          appId,
          appSecret,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }

      const data = await response.json()
      setAppToken(data.access_token)

      toast({
        title: "Success",
        description: "App token acquired successfully",
      })

      if (userObjectId) {
        // Run Who Am I - pass the fresh token directly
        const userData = await makeGraphRequest("getUser", undefined, data.access_token)
        if (userData) {
          setUserData(userData)
        }

        // Run Get Presence - pass the fresh token directly
        console.log("[v0] Getting presence for user:", userObjectId)
        const body = {
          ids: [userObjectId],
        }
        const presenceData = await makeGraphRequest("getPresence", body, data.access_token)
        console.log("[v0] Presence API response:", presenceData)

        if (presenceData && presenceData.value && presenceData.value.length > 0) {
          console.log("[v0] Setting presence data:", presenceData.value[0])
          setPresenceData(presenceData.value[0])
        } else {
          console.log("[v0] No presence data found in response")
        }

        toast({
          title: "Complete",
          description: "Token acquired and user data retrieved",
        })
      }

      setLoading(false)
      return true
    } catch (error) {
      console.error("Token acquisition error:", error)
      toast({
        title: "Authentication Error",
        description: error instanceof Error ? error.message : "Failed to acquire token",
        variant: "destructive",
      })
      setLoading(false)
      return false
    }
  }

  const whoAmI = async () => {
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
  }

  const getPresence = async () => {
    if (!userObjectId) {
      toast({
        title: "Error",
        description: "Please provide a user object ID",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    console.log("[v0] Getting presence for user:", userObjectId)

    const body = {
      ids: [userObjectId],
    }

    const data = await makeGraphRequest("getPresence", body)
    console.log("[v0] Presence API response:", data)

    if (data && data.value && data.value.length > 0) {
      console.log("[v0] Setting presence data:", data.value[0])
      setPresenceData(data.value[0])
      toast({
        title: "Success",
        description: "Presence data retrieved successfully",
      })
    } else {
      console.log("[v0] No presence data found in response")
      toast({
        title: "Warning",
        description: "No presence data found for the specified user",
        variant: "destructive",
      })
    }
    setLoading(false)
  }

  const setUserPresence = async () => {
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
  }

  const clearUserPresence = async () => {
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
  }

  const setAppPresence = async () => {
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
  }

  const clearAppPresence = async () => {
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
  }

  const getPresenceColor = (availability?: string, activity?: string) => {
    if (!availability) return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"

    switch (availability.toLowerCase()) {
      case "available":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 border-green-200 dark:border-green-800"
      case "busy":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 border-red-200 dark:border-red-800"
      case "donotdisturb":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 border-red-200 dark:border-red-800"
      case "away":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800"
      case "berightback":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800"
      case "offline":
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-700"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-700"
    }
  }

  const getPresenceIcon = (availability?: string) => {
    if (!availability) return "●"

    switch (availability.toLowerCase()) {
      case "available":
        return "●"
      case "busy":
        return "●"
      case "donotdisturb":
        return "⊘"
      case "away":
        return "◐"
      case "berightback":
        return "◐"
      case "offline":
        return "○"
      default:
        return "●"
    }
  }

  const isAuthenticated = !!appToken
  const canAuthenticate = tenantId && appId && appSecret

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-balance">Microsoft Graph Presence API Tester</h1>
        <p className="text-muted-foreground mt-2">
          Test Microsoft Graph Presence APIs using client credentials authentication
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Client Credentials Authentication</CardTitle>
          <CardDescription>
            Configure your Azure AD app registration details for client credentials flow
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="tenantId">Tenant ID</Label>
              <Input
                id="tenantId"
                placeholder="Enter your Azure AD tenant ID"
                value={tenantId}
                onChange={(e) => setTenantId(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="appId">Application (Client) ID</Label>
              <Input
                id="appId"
                placeholder="Enter your app registration client ID"
                value={appId}
                onChange={(e) => setAppId(e.target.value)}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="appSecret">Client Secret</Label>
            <Input
              id="appSecret"
              type="password"
              placeholder="Enter your app registration client secret"
              value={appSecret}
              onChange={(e) => setAppSecret(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="userObjectId">User Object ID</Label>
            <Input
              id="userObjectId"
              placeholder="Enter the target user's object ID"
              value={userObjectId}
              onChange={(e) => setUserObjectId(e.target.value)}
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={getAppToken} disabled={loading || !canAuthenticate}>
              {loading ? "Acquiring Token..." : "Get App Token"}
            </Button>
            <Button variant="outline" onClick={clearStoredData}>
              Clear Stored Data
            </Button>
            {isAuthenticated && (
              <Badge variant="outline" className="text-green-600">
                ✓ Authenticated
              </Badge>
            )}
          </div>

          <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>Required Permissions:</strong> Your app registration needs Presence.ReadWrite.All application
              permission for client credentials authentication.
            </p>
          </div>

          <div className="p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800">
            <p className="text-sm text-amber-800 dark:text-amber-200">
              <strong>🔒 Security:</strong> Non-sensitive data (Tenant ID, App ID, User ID) is stored in your browser's
              localStorage. The client secret is stored in sessionStorage and will be cleared when you close this tab.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>User Information</CardTitle>
          <CardDescription>Get information about the target user (Who Am I)</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={whoAmI} disabled={loading || !isAuthenticated || !userObjectId}>
            {loading ? "Loading..." : "Who Am I"}
          </Button>

          {userData && (
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <h4 className="font-semibold mb-2">User Information:</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium">Display Name:</span>
                  <Badge variant="outline">{userData.displayName}</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">User Principal Name:</span>
                  <Badge variant="outline">{userData.userPrincipalName}</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">Object ID:</span>
                  <Badge variant="outline">{userData.id}</Badge>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Get Presence */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Get Presence</CardTitle>
          <CardDescription>Retrieve current presence information using bulk endpoint</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={getPresence} disabled={loading || !isAuthenticated || !userObjectId}>
            {loading ? "Loading..." : "Get Presence"}
          </Button>

          {presenceData && (
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <h4 className="font-semibold mb-2">Current Presence:</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium">Availability:</span>
                  <Badge className={`${getPresenceColor(presenceData.availability)} font-medium`}>
                    <span className="mr-1">{getPresenceIcon(presenceData.availability)}</span>
                    {presenceData.availability}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">Activity:</span>
                  <Badge className={`${getPresenceColor(presenceData.availability)} font-medium`}>
                    {presenceData.activity}
                  </Badge>
                </div>
                {presenceData.statusMessage?.message?.content && (
                  <div>
                    <span className="font-medium">Status Message:</span>
                    <p className="text-sm text-muted-foreground mt-1">{presenceData.statusMessage.message.content}</p>
                  </div>
                )}
              </div>
              <details className="mt-4">
                <summary className="cursor-pointer text-sm text-muted-foreground">View Raw JSON</summary>
                <pre className="mt-2 text-xs bg-background p-2 rounded border overflow-auto">
                  {JSON.stringify(presenceData, null, 2)}
                </pre>
              </details>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Application Session Presence</CardTitle>
            <CardDescription>Set or clear presence as an application session (uses setPresence API)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="userPresence">Availability / Activity Combination</Label>
              <Select
                value={userPresenceSelection.toString()}
                onValueChange={(value) => setUserPresenceSelection(Number.parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {userPresenceOptions.map((option, index) => (
                    <SelectItem key={index} value={index.toString()}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="expirationDuration">Expiration Duration (ISO 8601)</Label>
              <Input
                id="expirationDuration"
                placeholder="PT5M (5 minutes)"
                value={expirationDuration}
                onChange={(e) => setExpirationDuration(e.target.value)}
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={setUserPresence} disabled={loading || !isAuthenticated || !userObjectId}>
                Set Presence
              </Button>
              <Button
                variant="outline"
                onClick={clearUserPresence}
                disabled={loading || !isAuthenticated || !userObjectId}
              >
                Clear Presence
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>User Preferred Presence</CardTitle>
            <CardDescription>
              Set or clear user's preferred presence (uses setUserPreferredPresence API)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="appPresence">Availability / Activity Combination</Label>
              <Select
                value={appPresenceSelection.toString()}
                onValueChange={(value) => setAppPresenceSelection(Number.parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {appPresenceOptions.map((option, index) => (
                    <SelectItem key={index} value={index.toString()}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2 flex-wrap">
              <Button onClick={setAppPresence} disabled={loading || !isAuthenticated || !userObjectId}>
                Set User Preferred Presence
              </Button>
              <Button
                variant="outline"
                onClick={clearAppPresence}
                disabled={loading || !isAuthenticated || !userObjectId}
                className="whitespace-nowrap bg-transparent"
              >
                Clear Preferred
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>API and Implementation Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">API Endpoints Used:</h4>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
              <li>
                <code>/communications/getPresencesByUserId</code> – Retrieves presence for specified users
              </li>
              <li>
                <code>/users/&lt;user-id&gt;/presence/setPresence</code> – Creates or updates an application-session
                presence
              </li>
              <li>
                <code>/users/&lt;user-id&gt;/presence/setUserPreferredPresence</code> – Sets user-preferred presence
              </li>
              <li>
                <code>/users/&lt;user-id&gt;/presence/clearPresence</code> – Clears the application-session presence
              </li>
              <li>
                <code>/users/&lt;user-id&gt;/presence/clearUserPreferredPresence</code> – Clears the user-preferred
                presence
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Authentication:</h4>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
              <li>
                Uses OAuth 2.0 <strong>client-credentials (application) authentication</strong>
              </li>
              <li>Obtains a tenant-scoped app-only access token using client_id and client_secret</li>
              <li>Token carries the application permissions granted to the app in Entra ID</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Required Permissions:</h4>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
              <li>
                <strong>Presence.ReadWrite.All (application)</strong> – needed for reading and writing presence
              </li>
              <li>
                <em>Presence.Read.All may also be granted if read-only is required</em>
              </li>
            </ul>
          </div>

          <Separator />

          <div>
            <h4 className="font-semibold mb-2">Presence Precedence (Highest to Lowest):</h4>
            <ol className="list-decimal list-inside text-sm text-muted-foreground space-y-1">
              <li>
                <strong>User-preferred presence</strong> (if set and at least one session exists)
              </li>
              <li>
                <strong>Application-session presence:</strong> DoNotDisturb → Busy → Available → Away
              </li>
              <li>Automatic presence determined by Teams/Outlook activity</li>
            </ol>
          </div>

          <Separator />

          <div>
            <h4 className="font-semibold mb-2">Session Behavior:</h4>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
              <li>
                An "Available" application session degrades to AvailableInactive after about 5 minutes of user
                inactivity and then to Away after a further period
              </li>
              <li>
                <code>expirationDuration</code> defines how long the session is valid (minimum 5 minutes, maximum 4
                hours)
              </li>
              <li>
                After expiration, the application session is removed and no longer affects the user's visible presence
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardContent className="pt-6">
          <div className="text-center text-sm text-muted-foreground">
            <p>
              Special thanks to <strong>Tom van Leijsen</strong> at <strong>AnywhereNow</strong> for sharing the
              original script and clarifying the logic on how Microsoft Graph Presence APIs work, which helped create
              this interactive testing tool.
            </p>
          </div>
        </CardContent>
      </Card>

      <Toaster />
    </div>
  )
}
