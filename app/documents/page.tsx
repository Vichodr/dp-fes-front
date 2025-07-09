"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileText, Search, Filter, Eye, Download, PenTool, CheckCircle, XCircle, Clock, ArrowLeft, AlertCircle, Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { AuthService } from "@/lib/authService"
import { DocumentService } from "@/lib/documentService"
import { Document } from "@/lib/api"

export default function DocumentsPage() {
  const [userRole, setUserRole] = useState("")
  const [documents, setDocuments] = useState<Document[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const role = AuthService.getCurrentUserRole()
        if (!role) {
          router.push("/")
          return
        }
        setUserRole(role)
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
      setError(error instanceof Error ? error.message : "Error al cargar documentos")
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
      case "IN_REVIEW":
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

  const filteredDocuments = documents.filter((doc) => {
    if (userRole === "SUPERVISOR") {
      const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase());
      if (statusFilter === "all") {
        return matchesSearch;
      }
      return doc.status === statusFilter && matchesSearch;
    }
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || doc.status === statusFilter;
    return matchesSearch && matchesStatus;
  })

  const canSign = (status: string) => {
    return (userRole === "SUPERVISOR" || userRole === "SIGNER") && (status === "PENDING" || status === "IN_REVIEW")
  }

  const handleDownload = async (documentId: number) => {
    try {
      const blob = await DocumentService.downloadDocument(documentId)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `documento-${documentId}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      setError(error instanceof Error ? error.message : "Error al descargar documento")
    }
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
        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2 text-red-600">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
            <Button variant="ghost" size="sm" onClick={() => setError("")} className="ml-auto">
              ×
            </Button>
          </div>
        )}

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Filter className="w-5 h-5" />
              <span>Filtros y Búsqueda</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  <SelectItem value="PENDING">En revisión</SelectItem>
                  <SelectItem value="IN_REVIEW">En revisión</SelectItem>
                  <SelectItem value="SIGNED">Firmado</SelectItem>
                  <SelectItem value="REJECTED">Rechazado</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("")
                  setStatusFilter("all")
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
              {(userRole === "EMPLOYEE" || userRole === "SIGNER") && (
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
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                <span className="ml-2 text-gray-600">Cargando documentos...</span>
              </div>
            ) : (
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
                            <h3 className="font-medium text-gray-900 truncate">{doc.name}</h3>
                            <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                              <span>{new Date(doc.upload_date).toLocaleDateString('es-ES')}</span>
                              <span>•</span>
                              <span>ID: {doc.id}</span>
                            </div>
                            <div className="flex items-center space-x-2 mt-2">
                              {getStatusBadge(doc.status)}
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

                          {doc.status === "SIGNED" && (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleDownload(doc.id)}
                            >
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
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
