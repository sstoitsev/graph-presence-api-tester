export interface PresenceData {
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

export interface UserData {
  displayName?: string
  userPrincipalName?: string
  id?: string
}

export type ApiLogStatus = "success" | "error"

export interface ApiLog {
  id: string
  timestamp: string
  method: string
  endpoint: string
  request: any
  response: any
  status: ApiLogStatus
  duration: number
}

export interface ApiLogInput {
  method: string
  endpoint: string
  request: any
  response: any
  status: ApiLogStatus
  duration: number
}

export const userPresenceOptions = [
  { availability: "Available", activity: "Available", label: "Available / Available" },
  { availability: "Busy", activity: "InACall", label: "Busy / In a Call" },
  { availability: "Busy", activity: "InAConferenceCall", label: "Busy / In a Conference Call" },
  { availability: "Away", activity: "Away", label: "Away / Away" },
  { availability: "DoNotDisturb", activity: "Presenting", label: "Do Not Disturb / Presenting" },
]

export const appPresenceOptions = [
  { availability: "Available", activity: "Available", label: "Available / Available" },
  { availability: "Busy", activity: "Busy", label: "Busy / Busy" },
  { availability: "DoNotDisturb", activity: "DoNotDisturb", label: "Do Not Disturb / Do Not Disturb" },
  { availability: "BeRightBack", activity: "BeRightBack", label: "Be Right Back / Be Right Back" },
  { availability: "Away", activity: "Away", label: "Away / Away" },
  { availability: "Offline", activity: "OffWork", label: "Offline / Off Work" },
]

export const getPresenceColor = (availability?: string) => {
  if (!availability) {
    return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
  }

  switch (availability.toLowerCase()) {
    case "available":
      return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 border-green-200 dark:border-green-800"
    case "busy":
      return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 border-red-200 dark:border-red-800"
    case "donotdisturb":
      return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 border-red-200 dark:border-red-800"
    case "away":
    case "berightback":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800"
    case "offline":
      return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-700"
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-700"
  }
}

export const getPresenceIcon = (availability?: string) => {
  if (!availability) {
    return "●"
  }

  switch (availability.toLowerCase()) {
    case "available":
      return "●"
    case "busy":
      return "●"
    case "donotdisturb":
      return "⊘"
    case "away":
    case "berightback":
      return "◐"
    case "offline":
      return "○"
    default:
      return "●"
  }
}
