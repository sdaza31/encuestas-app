"use client"

import { useEffect, useState } from "react"
import { Survey } from "@/types"
import { getAllSurveys } from "@/lib/services"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ExternalLink, Edit } from "lucide-react"

interface SurveyListProps {
    onSelect: (survey: Survey) => void
    currentSurveyId?: string
    lastUpdated?: number // Prop to trigger refresh
}

export function SurveyList({ onSelect, currentSurveyId, lastUpdated }: SurveyListProps) {
    const [surveys, setSurveys] = useState<Survey[]>([])
    const [loading, setLoading] = useState(true)

    const fetchSurveys = async () => {
        setLoading(true)
        try {
            const data = await getAllSurveys()
            setSurveys(data)
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchSurveys()
    }, [lastUpdated])

    if (loading) {
        return <div className="p-4 text-center text-muted-foreground">Cargando encuestas...</div>
    }

    if (surveys.length === 0) {
        return <div className="p-4 text-center text-muted-foreground">No hay encuestas guardadas aún.</div>
    }

    return (
        <ScrollArea className="h-[calc(100vh-200px)]">
            <div className="space-y-2 p-2">
                {surveys.map((survey) => (
                    <div
                        key={survey.id}
                        className={`p-3 rounded-lg border cursor-pointer transition-colors ${currentSurveyId === survey.id
                                ? "bg-accent border-primary"
                                : "hover:bg-muted"
                            }`}
                        onClick={() => onSelect(survey)}
                    >
                        <h3 className="font-semibold truncate">{survey.title}</h3>
                        <p className="text-xs text-muted-foreground truncate">{survey.description || "Sin descripción"}</p>

                        <div className="flex justify-end mt-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    const url = `${window.location.origin}/encuestas-app/survey?id=${survey.id}`;
                                    window.open(url, '_blank');
                                }}
                                title="Abrir encuesta"
                            >
                                <ExternalLink className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
        </ScrollArea>
    )
}
