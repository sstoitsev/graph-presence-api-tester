import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { tenantId, appId, appSecret } = await request.json()

    if (!tenantId || !appId || !appSecret) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
    }

    const response = await fetch(`https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: appId,
        scope: "https://graph.microsoft.com/.default",
        client_secret: appSecret,
        grant_type: "client_credentials",
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("OAuth error:", errorText)
      return NextResponse.json({ error: `OAuth error: ${response.status} ${errorText}` }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json({ access_token: data.access_token })
  } catch (error) {
    console.error("Token acquisition error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
