"use client"

import { useState } from "react"
import { signInWithEmailAndPassword } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Eye, EyeOff } from "lucide-react"

export default function LoginPage() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState("")
    const router = useRouter()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            await signInWithEmailAndPassword(auth, email, password)
            router.push("/admin/builder")
        } catch (err) {
            console.error(err)
            setError("Error al iniciar sesión. Verifica tus credenciales.")
        }
    }

    return (
        <div className="min-h-screen w-full relative flex items-center justify-center overflow-hidden bg-[#1a0b2e]">
            {/* Background Network Effect - Simulated */}
            <div className="absolute inset-0 z-0">
                {/* Radial Gradient Base */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#4a148c] via-[#1a0b2e] to-[#000000] opacity-80"></div>

                {/* Dot Grid Pattern to simulate network nodes */}
                <div className="absolute inset-0 opacity-20"
                    style={{
                        backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)',
                        backgroundSize: '30px 30px'
                    }}>
                </div>
            </div>

            <div className="z-10 w-full max-w-[400px] flex flex-col items-center gap-8 p-4">
                {/* Main Card */}
                <div className="w-full bg-white rounded-lg shadow-2xl p-8 pt-10 pb-12 flex flex-col items-center animate-in fade-in zoom-in duration-500">

                    {/* Logo Area */}
                    <div className="mb-10 flex flex-col items-center">
                        <div className="flex items-center gap-1 mb-2">
                            {/* 'ccm' part */}
                            <span className="text-5xl font-bold text-[#311b4e] tracking-tighter" style={{ fontFamily: 'sans-serif' }}>ccm</span>
                            {/* 'tec' box */}
                            <div className="bg-[#8e24aa] text-white px-2 py-1 rounded-sm ml-1">
                                <span className="text-4xl font-bold tracking-tighter leading-none block">tec</span>
                            </div>
                        </div>
                        <p className="text-[10px] tracking-[0.2em] text-[#666] uppercase font-bold">Technology For Service</p>
                        <p className="text-[9px] text-[#8e24aa] font-bold mt-1 tracking-wider">Innovate | Connect | Inspire</p>
                    </div>

                    <form onSubmit={handleLogin} className="w-full space-y-5">
                        <div className="space-y-1">
                            <LabelInputContainer>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="Email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="h-12 bg-[#2e3248] border-none text-white placeholder:text-gray-300 rounded-md focus-within:ring-2 focus-within:ring-purple-500/50 pl-4"
                                    required
                                />
                            </LabelInputContainer>
                        </div>
                        <div className="space-y-1">
                            <LabelInputContainer>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Passsword"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="h-12 bg-[#2e3248] border-none text-white placeholder:text-gray-300 rounded-md focus-within:ring-2 focus-within:ring-purple-500/50 pl-4 pr-10"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
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
                    {/* Simulating the bottom branding icon */}
                    <div className="flex justify-center items-center opacity-60">
                        <div className="relative w-8 h-8">
                            <div className="absolute inset-0 border border-white/40 rounded-full flex items-center justify-center">
                                <div className="w-2 h-2 bg-green-500/80 rounded-full shadow-[0_0_5px_rgba(34,197,94,0.8)]"></div>
                            </div>
                            <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full border border-white/40"></div>
                            <div className="absolute -bottom-2 -left-2 w-3 h-3 rounded-full border border-white/20"></div>
                        </div>
                        <span className="ml-3 text-sm font-medium tracking-wide">Aravel</span>
                    </div>

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
