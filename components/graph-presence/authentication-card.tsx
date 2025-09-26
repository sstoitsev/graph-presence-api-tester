import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type OnChange = (value: string) => void

interface AuthenticationCardProps {
  tenantId: string
  appId: string
  appSecret: string
  userObjectId: string
  showSecret: boolean
  loading: boolean
  isAuthenticated: boolean
  canAuthenticate: boolean
  onTenantIdChange: OnChange
  onAppIdChange: OnChange
  onAppSecretChange: OnChange
  onUserObjectIdChange: OnChange
  onToggleSecret: () => void
  onGetAppToken: () => void | Promise<unknown>
  onClearStoredData: () => void
}

export const AuthenticationCard = ({
  tenantId,
  appId,
  appSecret,
  userObjectId,
  showSecret,
  loading,
  isAuthenticated,
  canAuthenticate,
  onTenantIdChange,
  onAppIdChange,
  onAppSecretChange,
  onUserObjectIdChange,
  onToggleSecret,
  onGetAppToken,
  onClearStoredData,
}: AuthenticationCardProps) => {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Client Credentials Authentication</CardTitle>
        <CardDescription>Configure your Azure AD app registration details for client credentials flow</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="tenantId">Tenant ID</Label>
            <Input
              id="tenantId"
              placeholder="Enter your Azure AD tenant ID"
              value={tenantId}
              onChange={(event) => onTenantIdChange(event.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="appId">Application (Client) ID</Label>
            <Input
              id="appId"
              placeholder="Enter your app registration client ID"
              value={appId}
              onChange={(event) => onAppIdChange(event.target.value)}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="appSecret">Client Secret</Label>
          <div className="flex gap-2">
            <Input
              id="appSecret"
              type={showSecret ? "text" : "password"}
              placeholder="Enter your app registration client secret"
              value={appSecret}
              onChange={(event) => onAppSecretChange(event.target.value)}
              className="flex-1"
            />
            <Button type="button" variant="outline" size="sm" onClick={onToggleSecret} className="px-3">
              {showSecret ? "Hide" : "Show"}
            </Button>
          </div>
        </div>

        <div>
          <Label htmlFor="userObjectId">User Object ID</Label>
          <Input
            id="userObjectId"
            placeholder="Enter the target user's object ID"
            value={userObjectId}
            onChange={(event) => onUserObjectIdChange(event.target.value)}
          />
        </div>

        <div className="flex gap-2 items-center flex-wrap">
          <Button onClick={onGetAppToken} disabled={loading || !canAuthenticate}>
            {loading ? "Acquiring Token..." : "Get App Token"}
          </Button>
          <Button variant="outline" onClick={onClearStoredData}>
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
  )
}
