"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Shield, Users, Clock } from "lucide-react"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const router = useRouter()

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    // Simulación de login - en producción esto sería una llamada al backend
    if (email && password) {
      // Simular diferentes roles basados en el email
      const role = email.includes("gestor")
        ? "gestor"
        : email.includes("supervisor")
          ? "supervisor"
          : email.includes("firmante")
            ? "firmante"
            : "empleado"

      localStorage.setItem("userRole", role)
      localStorage.setItem("userEmail", email)
      router.push("/dashboard")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Left side - Login Form */}
        <div className="flex justify-center">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold">Iniciar Sesión</CardTitle>
              <CardDescription>Sistema de Gestión de Documentos con Firma Digital</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Correo Electrónico</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="usuario@institucion.cl"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Contraseña</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full">
                  Ingresar al Sistema
                </Button>
              </form>

              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">Usuarios de prueba:</p>
                <div className="text-xs space-y-1">
                  <p>
                    <strong>Empleado:</strong> empleado@test.cl
                  </p>
                  <p>
                    <strong>Supervisor:</strong> supervisor@test.cl
                  </p>
                  <p>
                    <strong>Firmante:</strong> firmante@test.cl
                  </p>
                  <p>
                    <strong>Gestor:</strong> gestor@test.cl
                  </p>
                  <p className="text-gray-500">Contraseña: cualquiera</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right side - Features */}
        <div className="space-y-6">
          <div className="text-center lg:text-left">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Gestión Documental Segura</h1>
            <p className="text-lg text-gray-600 mb-8">
              Digitaliza, firma y rastrea documentos oficiales con total seguridad y trazabilidad.
            </p>
          </div>

          <div className="grid gap-4">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Shield className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Firma Electrónica Simple</h3>
                <p className="text-sm text-gray-600">Hasta 5 firmas por documento con validación SHA-256</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Users className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Control de Acceso por Roles</h3>
                <p className="text-sm text-gray-600">Empleados, Supervisores, Firmantes y Gestores</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Clock className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Trazabilidad Completa</h3>
                <p className="text-sm text-gray-600">Historial detallado de todas las acciones</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
