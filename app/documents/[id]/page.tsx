"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  FileText,
  Download,
  PenTool,
  Eye,
  Clock,
  User,
  Calendar,
  Hash,
  ArrowLeft,
  CheckCircle,
  XCircle,
} from "lucide-react"
import Link from "next/link"
import { useRouter, useParams } from "next/navigation"

// Datos simulados del documento
const mockDocument = {
  id: 1,
  title: "Solicitud de Vacaciones - Enero 2024",
  status: "En revisión",
  date: "2024-01-15",
  author: "Juan Pérez",
  size: "245 KB",
  type: "Solicitud",
  description:
    "Solicitud de vacaciones para el período del 15 al 30 de enero de 2024. Incluye justificación y planificación de tareas durante la ausencia.",
  hash: "a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456",
  signatures: [
    {
      id: 1,
      signer: "María González - Supervisor",
      date: "2024-01-16 10:30",
      status: "Firmado",
      hash: "def123456789abcdef123456789abcdef123456789abcdef123456789abcdef12",
    },
  ],
  history: [
    {
      id: 1,
      action: "Documento subido",
      user: "Juan Pérez",
      date: "2024-01-15 09:15",
      details: "Documento inicial cargado al sistema",
    },
    {
      id: 2,
      action: "En revisión",
      user: "Sistema",
      date: "2024-01-15 09:16",
      details: "Estado cambiado automáticamente a 'En revisión'",
    },
    {
      id: 3,
      action: "Firma aplicada",
      user: "María González",
      date: "2024-01-16 10:30",
      details: "Primera firma electrónica aplicada",
    },
  ],
}

export default function DocumentDetailPage() {
  const [userRole, setUserRole] = useState("")
  const [activeTab, setActiveTab] = useState("details")
  const router = useRouter()
  const params = useParams()

  useEffect(() => {
    const role = localStorage.getItem("userRole")
    if (!role) {
      router.push("/")
      return
    }
    setUserRole(role)
  }, [router])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "En revisión":
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            <Clock className="w-3 h-3 mr-1" />
            En revisión
          </Badge>
        )
      case "Firmado":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <CheckCircle className="w-3 h-3 mr-1" />
            Firmado
          </Badge>
        )
      case "Rechazado":
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

  const canSign = () => {
    return (userRole === "supervisor" || userRole === "firmante") && mockDocument.status === "En revisión"
  }

  const canDownload = () => {
    return mockDocument.status === "Firmado"
  }

  if (!userRole) return null

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Link href="/documents">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Volver a Documentos
                </Button>
              </Link>
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-semibold text-gray-900">Detalle del Documento</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Document Info */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-xl mb-2">{mockDocument.title}</CardTitle>
                    <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                      <div className="flex items-center space-x-1">
                        <User className="w-4 h-4" />
                        <span>{mockDocument.author}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>{mockDocument.date}</span>
                      </div>
                      <span>{mockDocument.size}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(mockDocument.status)}
                      <Badge variant="secondary">{mockDocument.type}</Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-4">{mockDocument.description}</p>

                {/* Document Hash */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Hash className="w-4 h-4 text-gray-500" />
                    <span className="font-medium text-sm">Hash SHA-256</span>
                  </div>
                  <code className="text-xs text-gray-600 break-all">{mockDocument.hash}</code>
                </div>
              </CardContent>
            </Card>

            {/* Tabs */}
            <Card>
              <CardHeader>
                <div className="flex space-x-4 border-b">
                  <button
                    onClick={() => setActiveTab("details")}
                    className={`pb-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === "details"
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    Vista Previa
                  </button>
                  <button
                    onClick={() => setActiveTab("signatures")}
                    className={`pb-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === "signatures"
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    Firmas ({mockDocument.signatures.length})
                  </button>
                  <button
                    onClick={() => setActiveTab("history")}
                    className={`pb-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === "history"
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    Historial
                  </button>
                </div>
              </CardHeader>
              <CardContent>
                {activeTab === "details" && (
                  <div className="space-y-4">
                    <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                      <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 mb-2">Vista previa del documento PDF</p>
                      <p className="text-sm text-gray-500">
                        En un entorno real, aquí se mostraría el contenido del PDF
                      </p>
                    </div>
                  </div>
                )}

                {activeTab === "signatures" && (
                  <div className="space-y-4">
                    {mockDocument.signatures.length === 0 ? (
                      <div className="text-center py-8">
                        <PenTool className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">Este documento aún no tiene firmas</p>
                      </div>
                    ) : (
                      mockDocument.signatures.map((signature) => (
                        <div key={signature.id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium">{signature.signer}</h4>
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              {signature.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-500 mb-2">{signature.date}</p>
                          <div className="bg-gray-50 p-2 rounded">
                            <p className="text-xs text-gray-600">Hash de firma:</p>
                            <code className="text-xs text-gray-600 break-all">{signature.hash}</code>
                          </div>
                        </div>
                      ))
                    )}
                    <div className="text-sm text-gray-500 text-center">
                      Máximo 5 firmas por documento ({mockDocument.signatures.length}/5)
                    </div>
                  </div>
                )}

                {activeTab === "history" && (
                  <div className="space-y-4">
                    {mockDocument.history.map((event, index) => (
                      <div key={event.id} className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-sm">{event.action}</h4>
                            <span className="text-xs text-gray-500">{event.date}</span>
                          </div>
                          <p className="text-sm text-gray-600">Por: {event.user}</p>
                          <p className="text-xs text-gray-500 mt-1">{event.details}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Acciones</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full" variant="outline">
                  <Eye className="w-4 h-4 mr-2" />
                  Ver PDF Completo
                </Button>

                {canDownload() && (
                  <Button className="w-full" variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Descargar PDF
                  </Button>
                )}

                {canSign() && (
                  <Link href={`/documents/${params.id}/sign`}>
                    <Button className="w-full">
                      <PenTool className="w-4 h-4 mr-2" />
                      Firmar Documento
                    </Button>
                  </Link>
                )}

                {userRole === "supervisor" && mockDocument.status === "En revisión" && (
                  <>
                    <Separator />
                    <Button className="w-full" variant="outline">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Aprobar
                    </Button>
                    <Button className="w-full" variant="outline">
                      <XCircle className="w-4 h-4 mr-2" />
                      Rechazar
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Document Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Información</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Estado:</span>
                  <span>{mockDocument.status}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Firmas:</span>
                  <span>{mockDocument.signatures.length}/5</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Tamaño:</span>
                  <span>{mockDocument.size}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Tipo:</span>
                  <span>{mockDocument.type}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Creado:</span>
                  <span>{mockDocument.date}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
