"use client"

import { useState, useEffect, useRef } from "react"
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
import { DocumentService } from "@/lib/documentService"

export default function DocumentDetailPage() {
  const [userRole, setUserRole] = useState("")
  const [activeTab, setActiveTab] = useState("details")
  const [document, setDocument] = useState<any>(null)
  const [error, setError] = useState("")
  const router = useRouter()
  const params = useParams()
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)

  useEffect(() => {
    const role = localStorage.getItem("userRole")
    if (!role) {
      router.push("/")
      return
    }
    setUserRole(role)
    // Obtener documento real
    const fetchDocument = async () => {
      try {
        const doc = await DocumentService.getDocument(Number(params.id))
        // Adaptar los campos para la vista
        const document = {
          ...doc,
          title: doc.name,
          author: doc.user?.name || "Desconocido",
          authorEmail: doc.user?.email || "",
          date: doc.upload_date ? new Date(doc.upload_date).toLocaleString("es-CL") : "",
          size: doc.file_size ? `${(doc.file_size / 1024).toFixed(1)} KB` : "",
          type: "PDF",
          created: doc.upload_date ? new Date(doc.upload_date).toLocaleString("es-CL") : "",
          signatures: doc.signatures || [],
          hash: (doc.signatures && doc.signatures.length > 0)
            ? doc.signatures[doc.signatures.length - 1].sha256_hash
            : "No disponible",
          history: doc.history || [],
        }
        setDocument(document)
        console.log('Documento adaptado para la vista detalle:', document)
      } catch (err) {
        setError("No se pudo cargar el documento")
      }
    }
    fetchDocument()
  }, [router, params.id])

  useEffect(() => {
    if (!document || !document.id) {
      setPdfUrl(null);
      return;
    }
    if (canDownload()) {
      // Descargar el PDF y crear un blob URL para la vista previa
      DocumentService.downloadDocument(document.id).then(blob => {
        const url = window.URL.createObjectURL(blob)
        setPdfUrl(url)
        return () => window.URL.revokeObjectURL(url)
      })
    } else {
      setPdfUrl(null)
    }
    // Cleanup al desmontar
    return () => {
      if (pdfUrl) window.URL.revokeObjectURL(pdfUrl)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [document && document.id, document && document.status])

  const getStatusBadge = (status: string) => {
    switch (status) {
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

  const canSign = () => {
    return (userRole === "SUPERVISOR" || userRole === "SIGNER") && document && document.status === "IN_REVIEW"
  }

  const canDownload = () => {
    return document && document.status === "SIGNED"
  }

  if (!userRole) return null
  if (error) return <div className="p-8 text-center text-red-600">{error}</div>
  if (!document) return <div className="p-8 text-center text-gray-600">Cargando documento...</div>

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
                    <CardTitle className="text-xl mb-2">{document.title}</CardTitle>
                    <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                      <div className="flex items-center space-x-1">
                        <User className="w-4 h-4" />
                        <span>{document.author}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>{document.date}</span>
                      </div>
                      <span>{document.size}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(document.status)}
                      <Badge variant="secondary">{document.type}</Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-4">{document.description}</p>

                {/* Document Hash */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Hash className="w-4 h-4 text-gray-500" />
                    <span className="font-medium text-sm">Hash SHA-256</span>
                  </div>
                  <code className="text-xs text-gray-600 break-all">{document.hash}</code>
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
                    Firmas ({document.signatures.length})
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
                      {canDownload() && pdfUrl ? (
                        <iframe
                          src={pdfUrl}
                          id="pdf-preview"
                          title="Vista previa del PDF"
                          className="w-full h-96 rounded shadow"
                          style={{ minHeight: '24rem' }}
                        />
                      ) : (
                        <>
                          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-600 mb-2">Vista previa del documento PDF</p>
                          <p className="text-sm text-gray-500">
                            En un entorno real, aquí se mostraría el contenido del PDF
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === "signatures" && (
                  <div className="space-y-4">
                    {document.signatures.length === 0 ? (
                      <div className="text-center py-8">
                        <PenTool className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">Este documento aún no tiene firmas</p>
                      </div>
                    ) : (
                      document.signatures.map((signature: any) => (
                        <div key={signature.id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <h4 className="font-medium">{signature.user?.name || "Desconocido"}</h4>
                              <p className="text-xs text-gray-500">{signature.user?.email || ""} | {signature.user?.role || ""}</p>
                            </div>
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Firmado
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-500 mb-2">{signature.ts ? new Date(signature.ts).toLocaleString("es-CL") : ""}</p>
                          <div className="bg-gray-50 p-2 rounded">
                            <p className="text-xs text-gray-600">Hash de firma:</p>
                            <code className="text-xs text-gray-600 break-all">{signature.sha256_hash || ""}</code>
                          </div>
                        </div>
                      ))
                    )}
                    <div className="text-sm text-gray-500 text-center">
                      Máximo 5 firmas por documento ({document.signatures.length}/5)
                    </div>
                  </div>
                )}

                {activeTab === "history" && (
                  <div className="space-y-4">
                    {Array.isArray(document.history) && document.history.length > 0 ? (
                      document.history.map((event: any, index: number) => (
                        <div key={event.id} className="flex items-start space-x-3">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium text-sm">{event.action}</h4>
                              <span className="text-xs text-gray-500">{event.date}</span>
                            </div>
                            <p className="text-sm text-gray-600">Por: {event.user}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-gray-500 text-center">No hay historial para este documento.</div>
                    )}
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
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={async () => {
                    try {
                      const blob = await DocumentService.downloadDocument(document.id);
                      const url = window.URL.createObjectURL(blob);
                      window.open(url, '_blank');
                    } catch (error) {
                      alert("Error al abrir el PDF");
                    }
                  }}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Ver PDF Completo
                </Button>

                {canDownload() && (
                  <Button
                    className="w-full"
                    variant="outline"
                    onClick={async () => {
                      try {
                        const blob = await DocumentService.downloadDocument(document.id);
                        const url = window.URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = document.name || `documento-${document.id}.pdf`;
                        document.body.appendChild(a);
                        a.click();
                        window.URL.revokeObjectURL(url);
                        document.body.removeChild(a);
                      } catch (error) {
                        alert("Error al descargar el PDF");
                      }
                    }}
                  >
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

                {userRole === "SUPERVISOR" && document.status === "IN_REVIEW" && (
                  <>
                    <Separator />
                    {/* Eliminar botón de aprobar */}
                    <Button
                      className="w-full"
                      variant="outline"
                      onClick={async () => {
                        try {
                          await DocumentService.rejectDocument(document.id);
                          // Opcional: recargar documento o mostrar mensaje
                          window.location.reload();
                        } catch (err) {
                          alert("Error al rechazar el documento");
                        }
                      }}
                    >
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
                  <span>{document.status}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Firmas:</span>
                  <span>{document.signatures.length}/5</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Tamaño:</span>
                  <span>{document.size}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Tipo:</span>
                  <span>{document.type}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Creado:</span>
                  <span>{document.date}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
