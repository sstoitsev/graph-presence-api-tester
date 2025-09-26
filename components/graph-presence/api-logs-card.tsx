import { ChevronDown, ChevronRight } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

import type { ApiLog } from "@/lib/presence"

interface ApiLogsCardProps {
  apiLogs: ApiLog[]
  isOpen: boolean
  onToggle: (open: boolean) => void
  onClearLogs: () => void
}

export const ApiLogsCard = ({ apiLogs, isOpen, onToggle, onClearLogs }: ApiLogsCardProps) => {
  return (
    <Card className="mb-6">
      <Collapsible open={isOpen} onOpenChange={onToggle}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  API Request/Response Logs
                  <Badge variant="outline" className="text-xs">
                    {apiLogs.length}
                  </Badge>
                </CardTitle>
                <CardDescription>
                  View detailed logs of all API requests and responses for troubleshooting (tokens are redacted for
                  security)
                </CardDescription>
              </div>
              {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent>
            <div className="flex justify-between items-center mb-4">
              <p className="text-sm text-muted-foreground">
                Logs are stored in browser memory only and will disappear on page reload.
              </p>
              <Button variant="outline" size="sm" onClick={onClearLogs} disabled={apiLogs.length === 0}>
                Clear Logs
              </Button>
            </div>

            {apiLogs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No API calls logged yet. Make some API requests to see logs here.
              </div>
            ) : (
              <div className="space-y-4">
                {apiLogs.map((log) => (
                  <div key={log.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant={log.status === "success" ? "default" : "destructive"}>{log.method}</Badge>
                        <code className="text-sm bg-muted px-2 py-1 rounded">{log.endpoint}</code>
                        <Badge variant="outline" className={log.status === "success" ? "text-green-600" : "text-red-600"}>
                          {log.status}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(log.timestamp).toLocaleTimeString()} ({log.duration}ms)
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <h5 className="text-sm font-medium mb-2">Request:</h5>
                        <pre className="text-xs bg-muted p-2 rounded border whitespace-pre-wrap break-words">
                          {JSON.stringify(log.request, null, 2)}
                        </pre>
                      </div>
                      <div>
                        <h5 className="text-sm font-medium mb-2">Response:</h5>
                        <pre className="text-xs bg-muted p-2 rounded border whitespace-pre-wrap break-words">
                          {JSON.stringify(log.response, null, 2)}
                        </pre>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}
