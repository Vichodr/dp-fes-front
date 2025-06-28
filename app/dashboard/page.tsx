"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bell, FileText, Upload, Users, Eye, PenTool, CheckCircle, XCircle, Clock, Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { AuthService } from "@/lib/authService"
import { DocumentService } from "@/lib/documentService"
import { Document } from "@/lib/api"

export default function Dashboard() {
  const [userRole, setUserRole] = useState("")
  const [userName, setUserName] = useState("")
  const [documents, setDocuments] = useState<Document[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const role = AuthService.getCurrentUserRole()
        const user = AuthService.getCurrentUser()
        if (!role || !user) {
          router.push("/")
          return
        }
        setUserRole(role)
        setUserName(user.name)
        await loadDocuments()
      } catch (error) {
        console.error("Error checking auth:", error)
        router.push("/")
      }
    }
    checkAuth()
  }, [router])

  const loadDocuments = async () => {
    try {
      setIsLoading(true)
      const response = await DocumentService.getUserDocuments()
      setDocuments(response.documents)
    } catch (error) {
      console.error("Error loading documents:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            <Clock className="w-3 h-3 mr-1" />
            En revisión
          </Badge>
        )
      case "SIGNED":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <CheckCircle className="w-3 h-3 mr-1" />
            Firmado
          </Badge>
        )
      case "REJECTED":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            <XCircle className="w-3 h-3 mr-1" />
            Rechazado
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case "EMPLOYEE":
        return "Empleado"
      case "SUPERVISOR":
        return "Supervisor"
      case "SIGNER":
        return "Usuario Firmante"
      case "INSTITUTIONAL_MANAGER":
        return "Gestor Institucional"
      case "ADMIN":
        return "Administrador"
      default:
        return "Usuario"
    }
  }

  const handleLogout = () => {
    AuthService.logout()
    router.push("/")
  }

  // Calcular estadísticas
  const totalDocuments = documents.length
  const pendingDocuments = documents.filter(doc => doc.status === "PENDING").length
  const signedDocuments = documents.filter(doc => doc.status === "SIGNED").length
  const rejectedDocuments = documents.filter(doc => doc.status === "REJECTED").length

  // Obtener documentos recientes (últimos 4)
  const recentDocuments = documents.slice(0, 4)

  if (!userRole) return null

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-semibold text-gray-900">Sistema de Gestión Documental</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                <span className="font-medium">{getRoleDisplayName(userRole)}</span>
                <br />
                <span className="text-xs">{userName}</span>
              </div>
              <Button variant="outline" onClick={handleLogout}>
                Cerrar Sesión
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Bienvenido, {getRoleDisplayName(userRole)}</h2>
          <p className="text-gray-600">Gestiona tus documentos de forma segura y eficiente</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Documentos</p>
                  <p className="text-2xl font-bold text-gray-900">{totalDocuments}</p>
                </div>
                <FileText className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">En Revisión</p>
                  <p className="text-2xl font-bold text-yellow-600">{pendingDocuments}</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Firmados</p>
                  <p className="text-2xl font-bold text-green-600">{signedDocuments}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Rechazados</p>
                  <p className="text-2xl font-bold text-red-600">{rejectedDocuments}</p>
                </div>
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Acciones Rápidas</CardTitle>
                <CardDescription>Acciones disponibles según tu rol</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {(userRole === "EMPLOYEE" || userRole === "SIGNER") && (
                    <Link href="/upload">
                      <Button className="w-full h-20 flex flex-col items-center justify-center space-y-2">
                        <Upload className="w-6 h-6" />
                        <span>Subir Documento</span>
                      </Button>
                    </Link>
                  )}

                  <Link href="/documents">
                    <Button
                      variant="outline"
                      className="w-full h-20 flex flex-col items-center justify-center space-y-2"
                    >
                      <Eye className="w-6 h-6" />
                      <span>Ver Documentos</span>
                    </Button>
                  </Link>

                  {(userRole === "SUPERVISOR" || userRole === "SIGNER") && (
                    <Link href="/documents?filter=pending">
                      <Button
                        variant="outline"
                        className="w-full h-20 flex flex-col items-center justify-center space-y-2"
                      >
                        <PenTool className="w-6 h-6" />
                        <span>Firmar Documentos</span>
                      </Button>
                    </Link>
                  )}

                  {userRole === "INSTITUTIONAL_MANAGER" && (
                    <Link href="/users">
                      <Button
                        variant="outline"
                        className="w-full h-20 flex flex-col items-center justify-center space-y-2"
                      >
                        <Users className="w-6 h-6" />
                        <span>Gestionar Usuarios</span>
                      </Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Recent Documents */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Documentos Recientes</CardTitle>
                <CardDescription>Últimos documentos en el sistema</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                    <span className="ml-2 text-gray-600">Cargando documentos...</span>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentDocuments.length === 0 ? (
                      <div className="text-center py-8">
                        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">No hay documentos recientes</p>
                      </div>
                    ) : (
                      recentDocuments.map((doc) => (
                        <div
                          key={doc.id}
                          className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                        >
                          <div className="flex items-center space-x-3">
                            <FileText className="w-5 h-5 text-gray-400" />
                            <div>
                              <p className="font-medium text-gray-900">{doc.filename}</p>
                              <p className="text-sm text-gray-500">
                                {new Date(doc.created_at).toLocaleDateString('es-ES')}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            {getStatusBadge(doc.status)}
                            <Link href={`/documents/${doc.id}`}>
                              <Button variant="ghost" size="sm">
                                Ver
                              </Button>
                            </Link>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
                <div className="mt-4">
                  <Link href="/documents">
                    <Button variant="outline" className="w-full">
                      Ver Todos los Documentos
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Notifications */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bell className="w-5 h-5" />
                  <span>Notificaciones</span>
                </CardTitle>
                <CardDescription>Alertas y actualizaciones recientes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pendingDocuments > 0 && (
                    <div className="p-3 border rounded-lg">
                      <div className="flex items-start space-x-2">
                        <Clock className="w-4 h-4 text-yellow-500 mt-0.5" />
                        <p className="text-sm text-gray-700">
                          Tienes {pendingDocuments} documento{pendingDocuments > 1 ? 's' : ''} pendiente{pendingDocuments > 1 ? 's' : ''} de revisión
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {signedDocuments > 0 && (
                    <div className="p-3 border rounded-lg">
                      <div className="flex items-start space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                        <p className="text-sm text-gray-700">
                          {signedDocuments} documento{signedDocuments > 1 ? 's' : ''} firmado{signedDocuments > 1 ? 's' : ''} exitosamente
                        </p>
                      </div>
                    </div>
                  )}

                  {rejectedDocuments > 0 && (
                    <div className="p-3 border rounded-lg">
                      <div className="flex items-start space-x-2">
                        <XCircle className="w-4 h-4 text-red-500 mt-0.5" />
                        <p className="text-sm text-gray-700">
                          {rejectedDocuments} documento{rejectedDocuments > 1 ? 's' : ''} rechazado{rejectedDocuments > 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                  )}

                  {totalDocuments === 0 && (
                    <div className="p-3 border rounded-lg">
                      <div className="flex items-start space-x-2">
                        <FileText className="w-4 h-4 text-blue-500 mt-0.5" />
                        <p className="text-sm text-gray-700">
                          No hay documentos en el sistema. ¡Comienza subiendo tu primer documento!
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
