"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Shield, AlertTriangle, Activity, Download, RefreshCw } from "lucide-react"

interface SecurityLog {
  timestamp: string
  level: "INFO" | "WARNING" | "CRITICAL"
  event: string
  ip?: string
  details: any
}

export function SecurityDashboard() {
  const [logs, setLogs] = useState<SecurityLog[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [stats, setStats] = useState({
    totalRequests: 0,
    blockedIPs: 0,
    failedLogins: 0,
    criticalAlerts: 0,
  })

  useEffect(() => {
    fetchLogs()
    const interval = setInterval(fetchLogs, 30000) // Atualizar a cada 30 segundos
    return () => clearInterval(interval)
  }, [])

  const fetchLogs = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/security/logs")
      const data = await response.json()

      if (data.logs) {
        setLogs(data.logs)
        calculateStats(data.logs)
      }
    } catch (error) {
      console.error("Erro ao buscar logs:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const calculateStats = (logs: SecurityLog[]) => {
    const stats = {
      totalRequests: logs.filter((log) => log.event === "REQUEST").length,
      blockedIPs: new Set(logs.filter((log) => log.event === "RATE_LIMIT_EXCEEDED").map((log) => log.ip)).size,
      failedLogins: logs.filter((log) => log.event === "LOGIN_FAILED").length,
      criticalAlerts: logs.filter((log) => log.level === "CRITICAL").length,
    }
    setStats(stats)
  }

  const exportLogs = async () => {
    try {
      const response = await fetch("/api/security/logs", { method: "POST" })
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `security-logs-${new Date().toISOString().split("T")[0]}.json`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error("Erro ao exportar logs:", error)
    }
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case "CRITICAL":
        return "destructive"
      case "WARNING":
        return "secondary"
      case "INFO":
        return "outline"
      default:
        return "outline"
    }
  }

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString("pt-BR")
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Shield className="w-6 h-6" />
          Dashboard de Segurança
        </h1>
        <div className="flex gap-2">
          <Button onClick={fetchLogs} disabled={isLoading} variant="outline" size="sm">
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Atualizar
          </Button>
          <Button onClick={exportLogs} variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Exportar Logs
          </Button>
        </div>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Requisições</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRequests}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">IPs Bloqueados</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.blockedIPs}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Logins Falhados</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.failedLogins}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alertas Críticos</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.criticalAlerts}</div>
          </CardContent>
        </Card>
      </div>

      {/* Logs de Segurança */}
      <Card>
        <CardHeader>
          <CardTitle>Logs de Segurança</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">Todos</TabsTrigger>
              <TabsTrigger value="CRITICAL">Críticos</TabsTrigger>
              <TabsTrigger value="WARNING">Avisos</TabsTrigger>
              <TabsTrigger value="INFO">Info</TabsTrigger>
            </TabsList>

            {["all", "CRITICAL", "WARNING", "INFO"].map((level) => (
              <TabsContent key={level} value={level} className="space-y-2">
                <div className="max-h-96 overflow-y-auto space-y-2">
                  {logs
                    .filter((log) => level === "all" || log.level === level)
                    .slice(0, 50)
                    .map((log, index) => (
                      <div key={index} className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant={getLevelColor(log.level)}>{log.level}</Badge>
                            <span className="font-medium">{log.event}</span>
                            {log.ip && <span className="text-sm text-gray-500">IP: {log.ip}</span>}
                          </div>
                          <p className="text-sm text-gray-600">{formatTimestamp(log.timestamp)}</p>
                          {Object.keys(log.details).length > 0 && (
                            <details className="mt-2">
                              <summary className="text-sm text-blue-600 cursor-pointer">Ver detalhes</summary>
                              <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-x-auto">
                                {JSON.stringify(log.details, null, 2)}
                              </pre>
                            </details>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
