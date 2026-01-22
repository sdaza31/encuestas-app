"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { getSurvey } from "@/lib/services"
import { Survey } from "@/types"
import { SurveyViewer } from "@/components/SurveyViewer"

function SurveyContent() {
    const searchParams = useSearchParams()
    const id = searchParams.get('id')
    const [survey, setSurvey] = useState<Survey | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false)

    useEffect(() => {
        if (!id) {
            setLoading(false)
            return
        }

        getSurvey(id)
            .then(data => {
                if (data) {
                    setSurvey(data)
                } else {
                    setError(true)
                }
            })
            .catch(() => setError(true))
            .finally(() => setLoading(false))
    }, [id])

    if (loading) return <div className="flex items-center justify-center min-h-screen">Cargando encuesta...</div>
    if (error || !survey) return <div className="flex items-center justify-center min-h-screen text-destructive">Encuesta no encontrada o ID inválido.</div>

    return <SurveyViewer survey={survey} />
}

export default function SurveyPage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Cargando...</div>}>
            <SurveyContent />
        </Suspense>
    )
}
