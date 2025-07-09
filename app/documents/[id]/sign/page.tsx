"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { FileText, PenTool, Shield, AlertTriangle, CheckCircle, ArrowLeft, User, Calendar } from "lucide-react"
import Link from "next/link"
import { useRouter, useParams } from "next/navigation"
import { DocumentService } from "@/lib/documentService"

export default function SignDocumentPage() {
  const [userRole, setUserRole] = useState("")
  const [userEmail, setUserEmail] = useState("")
  const [comments, setComments] = useState("")
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [isSigningProcess, setIsSigningProcess] = useState(false)
  const [signatureComplete, setSignatureComplete] = useState(false)
  const [document, setDocument] = useState<any>(null)
  const [error, setError] = useState("")
  const router = useRouter()
  const params = useParams()

  useEffect(() => {
    const role = localStorage.getItem("userRole")
    const email = localStorage.getItem("userEmail")
    if (!role || !email) {
      router.push("/")
      return
    }
    setUserRole(role)
    setUserEmail(email)
    // Obtener documento real
    const fetchDocument = async () => {
      try {
        const rawDoc = await DocumentService.getDocument(Number(params.id));
        // Adaptar las firmas
        const signatures = (rawDoc.signatures || []).map((sig: any) => ({
          id: sig.id,
          signer: sig.user?.name || "Desconocido",
          signerEmail: sig.user?.email || "",
          signerRole: sig.user?.role || "",
          date: sig.ts ? new Date(sig.ts).toLocaleString("es-CL") : "",
          hash: sig.sha256_hash || "",
        }));

        // Adaptar el documento
        const document = {
          ...rawDoc,
          title: rawDoc.name,
          author: rawDoc.user?.name || "Desconocido",
          authorEmail: rawDoc.user?.email || "",
          date: rawDoc.upload_date ? new Date(rawDoc.upload_date).toLocaleString("es-CL") : "",
          size: rawDoc.file_size ? `${(rawDoc.file_size / 1024).toFixed(1)} KB` : "",
          signatures,
          hash: rawDoc.hash || "No disponible",
          status: rawDoc.status || "",
          type: "PDF",
          created: rawDoc.upload_date ? new Date(rawDoc.upload_date).toLocaleString("es-CL") : "",
        };
        setDocument(document);
        console.log('Documento adaptado para la vista:', document);
      } catch (err) {
        setError("No se pudo cargar el documento");
      }
    }
    fetchDocument()
  }, [router, params.id])

  const handleSign = async () => {
    if (!acceptTerms) {
      alert("Debes aceptar los términos y condiciones para firmar")
      return
    }
    setIsSigningProcess(true)
    setError("")
    try {
      await DocumentService.signDocument(Number(params.id))
      setIsSigningProcess(false)
      setSignatureComplete(true)
      setTimeout(() => {
        router.push(`/documents/${params.id}`)
      }, 3000)
    } catch (err: any) {
      setIsSigningProcess(false)
      setError(err.message || "Error al firmar el documento")
    }
  }

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case "empleado":
        return "Empleado"
      case "supervisor":
        return "Supervisor"
      case "firmante":
        return "Usuario Firmante"
      case "gestor":
        return "Gestor Institucional"
      default:
        return "Usuario"
    }
  }

  if (!userRole) return null
  if (error) return <div className="p-8 text-center text-red-600">{error}</div>

  if (!document) {
    return <div className="p-8 text-center text-gray-600">Cargando documento...</div>
  }

  if (signatureComplete) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">¡Firma Aplicada Exitosamente!</h2>
            <p className="text-gray-600 mb-4">Tu firma electrónica ha sido registrada y validada con hash SHA-256.</p>
            <p className="text-sm text-gray-500">Redirigiendo al documento en unos segundos...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Link href={`/documents/${params.id}`}>
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Volver al Documento
                </Button>
              </Link>
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <PenTool className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-semibold text-gray-900">Firmar Documento</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Document Preview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="w-5 h-5" />
                  <span>Documento a Firmar</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-lg">{document.title}</h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
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
                  </div>

                  {/* Document Preview Area */}
                  <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-2">Vista previa del documento</p>
                    <p className="text-sm text-gray-500">Revisa cuidadosamente el contenido antes de firmar</p>
                    <Button variant="outline" className="mt-4">
                      Ver PDF Completo
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Signature Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <PenTool className="w-5 h-5" />
                  <span>Aplicar Firma Electrónica</span>
                </CardTitle>
                <CardDescription>Tu firma será vinculada a tu identidad y protegida con hash SHA-256</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Signer Info */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Información del Firmante</h4>
                  <div className="space-y-1 text-sm">
                    <p>
                      <strong>Nombre:</strong> {getRoleDisplayName(userRole)}
                    </p>
                    <p>
                      <strong>Email:</strong> {userEmail}
                    </p>
                    <p>
                      <strong>Rol:</strong> {getRoleDisplayName(userRole)}
                    </p>
                    <p>
                      <strong>Fecha y Hora:</strong> {new Date().toLocaleString("es-CL")}
                    </p>
                  </div>
                </div>

                {/* Comments */}
                <div className="space-y-2">
                  <Label htmlFor="comments">Comentarios (Opcional)</Label>
                  <Textarea
                    id="comments"
                    placeholder="Agrega comentarios sobre tu firma o el documento..."
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    rows={3}
                  />
                </div>

                {/* Security Notice */}
                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Seguridad:</strong> Tu firma será protegida con encriptación SHA-256. Una vez firmado,
                    cualquier modificación al documento invalidará automáticamente la firma.
                  </AlertDescription>
                </Alert>

                {/* Terms and Conditions */}
                <div className="space-y-4">
                  <div className="flex items-start space-x-2">
                    <Checkbox 
                      id="terms" 
                      checked={acceptTerms} 
                      onCheckedChange={(checked) => setAcceptTerms(checked === true)} 
                    />
                    <div className="grid gap-1.5 leading-none">
                      <Label
                        htmlFor="terms"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Acepto los términos y condiciones
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Al firmar este documento, confirmo que he revisado su contenido y acepto la validez legal de mi
                        firma electrónica simple.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Sign Button */}
                <Button onClick={handleSign} disabled={!acceptTerms || isSigningProcess} className="w-full" size="lg">
                  {isSigningProcess ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Aplicando Firma...
                    </>
                  ) : (
                    <>
                      <PenTool className="w-4 h-4 mr-2" />
                      Firmar Documento
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Current Signatures */}
            <Card>
              <CardHeader>
                <CardTitle>Firmas Actuales</CardTitle>
                <CardDescription>{document.signatures.length}/5 firmas aplicadas</CardDescription>
              </CardHeader>
              <CardContent>
                {document.signatures.length === 0 ? (
                  <p className="text-sm text-gray-500">No hay firmas aún</p>
                ) : (
                  <div className="space-y-3">
                    {document.signatures.map((signature: any) => (
                      <div key={signature.id} className="border rounded-lg p-3">
                        <div className="flex items-center justify-between mb-1">
                          <div>
                            <p className="font-medium text-sm">{signature.signer}</p>
                            <p className="text-xs text-gray-500">{signature.signerEmail} | {signature.signerRole}</p>
                          </div>
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Firmado
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-500">Fecha: {signature.date}</p>
                        <p className="text-xs text-gray-500 break-all">Hash: {signature.hash}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Security Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="w-5 h-5" />
                  <span>Seguridad</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm">
                  <p className="font-medium mb-1">Hash del Documento:</p>
                  <code className="text-xs text-gray-600 break-all bg-gray-50 p-2 rounded block">
                    {document.hash}
                  </code>
                </div>
                <div className="text-sm">
                  <p className="font-medium mb-1">Tipo de Firma:</p>
                  <p className="text-gray-600">Firma Electrónica Simple (FES)</p>
                </div>
                <div className="text-sm">
                  <p className="font-medium mb-1">Encriptación:</p>
                  <p className="text-gray-600">SHA-256</p>
                </div>
              </CardContent>
            </Card>

            {/* Warning */}
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Importante:</strong> Una vez firmado, el documento no podrá ser modificado. Asegúrate de revisar
                todo el contenido antes de proceder.
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </div>
    </div>
  )
}
