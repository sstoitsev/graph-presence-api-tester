import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

import type { PresenceData } from "@/lib/presence"
import { getPresenceColor, getPresenceIcon } from "@/lib/presence"

interface PresenceCardProps {
  presenceData: PresenceData | null
  loading: boolean
  isAuthenticated: boolean
  userObjectId: string
  onGetPresence: () => void | Promise<unknown>
}

export const PresenceCard = ({ presenceData, loading, isAuthenticated, userObjectId, onGetPresence }: PresenceCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Get Presence</CardTitle>
        <CardDescription>Retrieve current presence information using bulk endpoint</CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={onGetPresence} disabled={loading || !isAuthenticated || !userObjectId}>
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
          </div>
        )}
      </CardContent>
    </Card>
  )
}
