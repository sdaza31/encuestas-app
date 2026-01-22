"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { onAuthStateChanged } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { SurveyBuilder } from "@/components/builder/SurveyBuilder"
import { Button } from "@/components/ui/button"

export default function AdminBuilderPage() {
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (!user) {
                router.push("/admin/login")
            } else {
                setLoading(false)
            }
        })

        return () => unsubscribe()
    }, [router])

    if (loading) {
        return <div className="flex items-center justify-center min-h-screen">Cargando...</div>
    }

    return (
        <main className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8">
            <div className="flex justify-end mb-4">
                <Button variant="outline" onClick={() => auth.signOut()}>Cerrar Sesión</Button>
            </div>
            <SurveyBuilder />
        </main>
    )
}
