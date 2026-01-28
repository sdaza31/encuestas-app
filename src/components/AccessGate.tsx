"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Image from "next/image"
import ccmLogo from "@/assets/ccm-tec-logo.png"

interface AccessGateProps {
    allowedEmails?: string[];
    onAccessGranted: (email: string) => void;
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
            onAccessGranted(normalizedEmail);
        } else {
            setError("⛔ Acceso denegado: Este correo no está autorizado para responder esta encuesta.");
        }
    }

    return (
        <div
            className="min-h-screen w-full relative flex items-center justify-center overflow-hidden"
            style={{
                background: 'linear-gradient(0deg, rgba(22, 17, 56, 1) 0%, rgba(130, 42, 136, 1) 64%, rgba(169, 112, 175, 1) 100%)'
            }}
        >
            <div className="z-10 w-full max-w-[400px] flex flex-col items-center gap-8 p-4">
                {/* Main Card */}
                <div className="w-full bg-white rounded-lg shadow-2xl p-8 pt-10 pb-12 flex flex-col items-center animate-in fade-in zoom-in duration-500">

                    {/* Logo Area */}
                    <div className="mb-8 flex flex-col items-center text-center">
                        <Image
                            src={ccmLogo}
                            alt="CCM Tec Logo"
                            className="w-48 h-auto object-contain mb-6"
                            priority
                        />
                        <h2 className="text-xl font-bold text-gray-900">Acceso Restringido</h2>
                        {surveyTitle && <p className="text-sm text-gray-500 font-medium mt-1">{surveyTitle}</p>}
                    </div>

                    <div className="mb-4 text-center">
                        <p className="text-xs text-gray-400 max-w-[280px] mx-auto">
                            Esta encuesta es privada. Ingresa tu correo para verificar tu acceso.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="w-full space-y-5">
                        <div className="space-y-1">
                            <LabelInputContainer>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="Correo Electrónico"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="h-12 bg-[#2e3248] border-none text-white placeholder:text-gray-300 rounded-md focus-within:ring-2 focus-within:ring-purple-500/50 pl-4"
                                    required
                                />
                            </LabelInputContainer>
                        </div>

                        {error && <p className="text-sm text-red-500 text-center font-medium animate-pulse">{error}</p>}

                        <Button
                            type="submit"
                            className="w-full h-12 text-lg font-normal tracking-wide bg-gradient-to-r from-[#7b1fa2] to-[#ab47bc] hover:from-[#6a1b9a] hover:to-[#8e24aa] transition-all rounded-full mt-2 shadow-lg text-white border-none"
                        >
                            Entrar
                        </Button>
                    </form>
                </div>

                {/* Footer Section */}
                <div className="text-center text-white/50 space-y-4">
                    <p className="text-[10px] text-white/70">
                        Copyright © 2026 developed by <span className="underline decoration-white/30 underline-offset-2 hover:text-white transition-colors cursor-default">Call Center Mall</span>
                    </p>
                </div>
            </div>
        </div>
    )
}

function LabelInputContainer({ children, className }: { children: React.ReactNode; className?: string }) {
    return (
        <div className={`flex flex-col space-y-2 w-full ${className}`}>
            {children}
        </div>
    );
}
