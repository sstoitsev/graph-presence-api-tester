import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import { appPresenceOptions } from "@/lib/presence"

interface PreferredPresenceCardProps {
  loading: boolean
  isAuthenticated: boolean
  userObjectId: string
  appPresenceSelection: number
  onSelectPresence: (value: number) => void
  onSetPreferredPresence: () => void | Promise<unknown>
  onClearPreferredPresence: () => void | Promise<unknown>
}

export const PreferredPresenceCard = ({
  loading,
  isAuthenticated,
  userObjectId,
  appPresenceSelection,
  onSelectPresence,
  onSetPreferredPresence,
  onClearPreferredPresence,
}: PreferredPresenceCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>User Preferred Presence</CardTitle>
        <CardDescription>Set or clear user's preferred presence (uses setUserPreferredPresence API)</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="appPresence">Availability / Activity Combination</Label>
          <Select value={appPresenceSelection.toString()} onValueChange={(value) => onSelectPresence(Number.parseInt(value))}>
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
          <Button onClick={onSetPreferredPresence} disabled={loading || !isAuthenticated || !userObjectId}>
            Set User Preferred Presence
          </Button>
          <Button
            variant="outline"
            onClick={onClearPreferredPresence}
            disabled={loading || !isAuthenticated || !userObjectId}
            className="whitespace-nowrap bg-transparent"
          >
            Clear Preferred
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
