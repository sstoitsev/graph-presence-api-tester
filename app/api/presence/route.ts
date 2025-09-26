import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { token, userObjectId, action, body } = await request.json()

    if (!token || !userObjectId || !action) {
      return NextResponse.json({ error: "Missing required parameters: token, userObjectId, action" }, { status: 400 })
    }

    let endpoint = ""
    let method = "POST"

    switch (action) {
      case "getPresence":
        endpoint = "/communications/getPresencesByUserId"
        method = "POST"
        break
      case "setPresence":
        endpoint = `/users/${userObjectId}/presence/setPresence`
        method = "POST"
        break
      case "clearPresence":
        endpoint = `/users/${userObjectId}/presence/clearPresence`
        method = "POST"
        break
      case "setUserPreferredPresence":
        endpoint = `/users/${userObjectId}/presence/setUserPreferredPresence`
        method = "POST"
        break
      case "clearUserPreferredPresence":
        endpoint = `/users/${userObjectId}/presence/clearUserPreferredPresence`
        method = "POST"
        break
      case "getUser":
        endpoint = `/users/${userObjectId}`
        method = "GET"
        break
      default:
        return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 })
    }

    const response = await fetch(`https://graph.microsoft.com/v1.0${endpoint}`, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: body ? JSON.stringify(body) : undefined,
    })

    if (!response.ok) {
      const errorText = await response.text()
      return NextResponse.json(
        { error: `Graph API Error: ${response.status} - ${errorText}` },
        { status: response.status },
      )
    }

    if (method === "GET" || action === "getPresence") {
      const data = await response.json()
      return NextResponse.json(data)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Presence API Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
