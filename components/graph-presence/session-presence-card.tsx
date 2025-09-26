import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import { userPresenceOptions } from "@/lib/presence"

interface SessionPresenceCardProps {
  loading: boolean
  isAuthenticated: boolean
  userObjectId: string
  userPresenceSelection: number
  expirationDuration: string
  onSelectPresence: (value: number) => void
  onExpirationChange: (value: string) => void
  onSetPresence: () => void | Promise<unknown>
  onClearPresence: () => void | Promise<unknown>
}

export const SessionPresenceCard = ({
  loading,
  isAuthenticated,
  userObjectId,
  userPresenceSelection,
  expirationDuration,
  onSelectPresence,
  onExpirationChange,
  onSetPresence,
  onClearPresence,
}: SessionPresenceCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Application Session Presence</CardTitle>
        <CardDescription>Set or clear presence as an application session (uses setPresence API)</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="userPresence">Availability / Activity Combination</Label>
          <Select value={userPresenceSelection.toString()} onValueChange={(value) => onSelectPresence(Number.parseInt(value))}>
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
            onChange={(event) => onExpirationChange(event.target.value)}
          />
        </div>

        <div className="flex gap-2">
          <Button onClick={onSetPresence} disabled={loading || !isAuthenticated || !userObjectId}>
            Set Presence
          </Button>
          <Button variant="outline" onClick={onClearPresence} disabled={loading || !isAuthenticated || !userObjectId}>
            Clear Presence
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
