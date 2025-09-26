import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

import type { UserData } from "@/lib/presence"

interface UserInfoCardProps {
  userData: UserData | null
  loading: boolean
  isAuthenticated: boolean
  userObjectId: string
  onWhoAmI: () => void | Promise<unknown>
}

export const UserInfoCard = ({ userData, loading, isAuthenticated, userObjectId, onWhoAmI }: UserInfoCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>User Information</CardTitle>
        <CardDescription>Get information about the target user (Who Am I)</CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={onWhoAmI} disabled={loading || !isAuthenticated || !userObjectId}>
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
  )
}
