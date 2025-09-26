# Graph Presence API Tester

A web-based tool for testing Microsoft Graph Presence APIs using client credentials authentication. 
[Test it live!](https://v0-graph-presence-api-tester.vercel.app/)

> **Built entirely with v0 AI** - This project was generated and developed using [v0.app](https://v0.app).

## Overview

The Graph Presence API Tester simplifies testing and understanding Microsoft Graph Presence APIs. Whether you're building presence-aware applications, debugging API integrations, or learning how Microsoft Graph presence works, this tool provides a straightforward interface to experiment with all major presence operations.

## Features

- **Get Presence** — Retrieve current presence for multiple users at once
- **Set Application Session Presence** — Create temporary presence states with automatic expiration
- **Set User Preferred Presence** — Override presence with user-defined states  
- **Clear Presence** — Remove application sessions or user preferences
- **Who Am I** — Verify authentication and permissions
- **Real-time Testing** — Make actual API calls with formatted responses and error handling
- **Visual Feedback** — Teams-style color coding for presence states
- **Secure Authentication** — OAuth 2.0 client credentials flow handled server-side

## Getting Started

### Prerequisites

1. **Azure App Registration** with the following:
   - Application (client) ID
   - Client secret
   - `Presence.ReadWrite.All` application permission granted and admin consented

### Usage

1. Enter your Azure AD credentials:
   - Tenant ID
   - Application ID  
   - Client Secret

2. Click "Get App Token" to authenticate

3. Test any of the available presence operations:
   - Use "Who Am I" to verify your setup
   - Use "Get Presence" to retrieve current user presence
   - Use "Set Presence" operations to modify presence states
   - Use "Clear Presence" to remove custom presence settings

## API Information

### Endpoints Used
- `/communications/getPresencesByUserId` – Retrieves presence for specified users
- `/users/<user-id>/presence/setPresence` – Creates or updates application-session presence
- `/users/<user-id>/presence/setUserPreferredPresence` – Sets user-preferred presence
- `/users/<user-id>/presence/clearPresence` – Clears application-session presence
- `/users/<user-id>/presence/clearUserPreferredPresence` – Clears user-preferred presence

### Authentication
- Uses OAuth 2.0 **client credentials (application) authentication**
- Obtains tenant-scoped app-only access token
- Requires `Presence.ReadWrite.All` application permission

### Presence Precedence (highest to lowest)
1. User-preferred presence (if set and at least one session exists)
2. Application-session presence: DoNotDisturb → Busy → Available → Away  
3. Automatic presence determined by Teams/Outlook activity

### Session Behavior
- Application sessions degrade from Available → AvailableInactive → Away based on user activity
- `expirationDuration` defines session validity (5 minutes to 4 hours)
- Expired sessions are automatically removed

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## Acknowledgments

Special thanks to **Tom van Leijsen** for sharing his original PowerShell script and clarifying the Microsoft Graph Presence API logic. His work provided the foundation and insights that made this web-based tool possible.

## License

MIT License - feel free to use this tool and contribute improvements.

---

*Automatically synced with [v0.app](https://v0.app) deployments*
