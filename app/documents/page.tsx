"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileText, Search, Filter, Eye, Download, PenTool, CheckCircle, XCircle, Clock, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

// Datos simulados expandidos
const mockDocuments = [
  {
    id: 1,
    title: "Solicitud de Vacaciones - Enero 2024",
    status: "En revisión",
    date: "2024-01-15",
    signatures: 0,
    author: "Juan Pérez",
    size: "245 KB",
    type: "Solicitud",
  },
  {
    id: 2,
    title: "Contrato de Trabajo - María González",
    status: "Firmado",
    date: "2024-01-14",
    signatures: 3,
    author: "RRHH",
    size: "1.2 MB",
    type: "Contrato",
  },
  {
    id: 3,
    title: "Informe Mensual Diciembre 2023",
    status: "Rechazado",
    date: "2024-01-13",
    signatures: 0,
    author: "Carlos Silva",
    size: "890 KB",
    type: "Informe",
  },
  {
    id: 4,
    title: "Propuesta Proyecto Digitalización",
    status: "En revisión",
    date: "2024-01-12",
    signatures: 1,
    author: "Ana López",
    size: "2.1 MB",
    type: "Propuesta",
  },
  {
    id: 5,
    title: "Política de Seguridad Actualizada",
    status: "Firmado",
    date: "2024-01-11",
    signatures: 5,
    author: "Seguridad TI",
    size: "567 KB",
    type: "Política",
  },
  {
    id: 6,
    title: "Presupuesto Anual 2024",
    status: "En revisión",
    date: "2024-01-10",
    signatures: 2,
    author: "Finanzas",
    size: "3.4 MB",
    type: "Presupuesto",
  },
]

export default function DocumentsPage() {
  const [userRole, setUserRole] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const router = useRouter()

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

  const filteredDocuments = mockDocuments.filter((doc) => {
    const matchesSearch =
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.author.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || doc.status === statusFilter
    const matchesType = typeFilter === "all" || doc.type === typeFilter

    return matchesSearch && matchesStatus && matchesType
  })

  const canSign = (status: string) => {
    return (userRole === "supervisor" || userRole === "firmante") && status === "En revisión"
  }

  if (!userRole) return null

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Volver
                </Button>
              </Link>
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-semibold text-gray-900">Lista de Documentos</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Filter className="w-5 h-5" />
              <span>Filtros y Búsqueda</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar documentos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="En revisión">En revisión</SelectItem>
                  <SelectItem value="Firmado">Firmado</SelectItem>
                  <SelectItem value="Rechazado">Rechazado</SelectItem>
                </SelectContent>
              </Select>

              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los tipos</SelectItem>
                  <SelectItem value="Solicitud">Solicitud</SelectItem>
                  <SelectItem value="Contrato">Contrato</SelectItem>
                  <SelectItem value="Informe">Informe</SelectItem>
                  <SelectItem value="Propuesta">Propuesta</SelectItem>
                  <SelectItem value="Política">Política</SelectItem>
                  <SelectItem value="Presupuesto">Presupuesto</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("")
                  setStatusFilter("all")
                  setTypeFilter("all")
                }}
              >
                Limpiar Filtros
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Documents List */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Documentos ({filteredDocuments.length})</CardTitle>
                <CardDescription>Gestiona y revisa todos los documentos del sistema</CardDescription>
              </div>
              {(userRole === "empleado" || userRole === "firmante") && (
                <Link href="/upload">
                  <Button>
                    <FileText className="w-4 h-4 mr-2" />
                    Subir Documento
                  </Button>
                </Link>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredDocuments.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No se encontraron documentos con los filtros aplicados</p>
                </div>
              ) : (
                filteredDocuments.map((doc) => (
                  <div key={doc.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <FileText className="w-5 h-5 text-blue-600" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 truncate">{doc.title}</h3>
                          <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                            <span>Por: {doc.author}</span>
                            <span>•</span>
                            <span>{doc.date}</span>
                            <span>•</span>
                            <span>{doc.size}</span>
                            <span>•</span>
                            <span>{doc.signatures} firmas</span>
                          </div>
                          <div className="flex items-center space-x-2 mt-2">
                            {getStatusBadge(doc.status)}
                            <Badge variant="secondary">{doc.type}</Badge>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 ml-4">
                        <Link href={`/documents/${doc.id}`}>
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4 mr-1" />
                            Ver
                          </Button>
                        </Link>

                        {doc.status === "Firmado" && (
                          <Button variant="ghost" size="sm">
                            <Download className="w-4 h-4 mr-1" />
                            Descargar
                          </Button>
                        )}

                        {canSign(doc.status) && (
                          <Link href={`/documents/${doc.id}/sign`}>
                            <Button size="sm">
                              <PenTool className="w-4 h-4 mr-1" />
                              Firmar
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
