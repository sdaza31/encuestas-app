"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Lock } from "lucide-react"

interface AccessGateProps {
    allowedEmails?: string[];
    onAccessGranted: () => void;
    surveyTitle?: string;
}

export function AccessGate({ allowedEmails, onAccessGranted, surveyTitle }: AccessGateProps) {
    const [email, setEmail] = React.useState("")
    const [error, setError] = React.useState("")

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!email) {
            setError("Por favor ingresa tu correo.");
            return;
        }

        const normalizedEmail = email.trim().toLowerCase();

        // Check if normalized email is in the list (also normalized)
        const isAllowed = allowedEmails?.some(e => e.trim().toLowerCase() === normalizedEmail);

        if (isAllowed) {
            onAccessGranted();
        } else {
            setError("⛔ Acceso denegado: Este correo no está autorizado para responder esta encuesta.");
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-muted/20">
            <div className="max-w-md w-full bg-card p-8 rounded-xl shadow-lg border space-y-6">
                <div className="text-center space-y-2">
                    <div className="mx-auto w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 mb-4">
                        <Lock className="w-6 h-6" />
                    </div>
                    <h2 className="text-2xl font-bold">Acceso Restringido</h2>
                    {surveyTitle && <p className="text-muted-foreground font-medium">{surveyTitle}</p>}
                    <p className="text-sm text-muted-foreground">
                        Esta encuesta es privada. Por favor ingresa tu correo electrónico para verificar tu acceso.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">Correo Electrónico</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="tu@dominio.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="bg-background"
                        />
                    </div>

                    {error && (
                        <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm font-medium animate-in fade-in slide-in-from-top-1">
                            {error}
                        </div>
                    )}

                    <Button type="submit" className="w-full">
                        Entrar
                    </Button>
                </form>

                <p className="text-xs text-center text-muted-foreground">
                    Si crees que deberías tener acceso, contacta al administrador de la encuesta.
                </p>
            </div>
        </div>
    )
}
