"use client"

import * as React from "react"
import { Survey, Question } from "@/types"
import { QuestionEditor } from "./QuestionEditor"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Eye, Save } from "lucide-react"

import { createSurvey } from "@/lib/services"
import { SurveyViewer } from "@/components/SurveyViewer"

export function SurveyBuilder() {
    const [survey, setSurvey] = React.useState<Survey>({
        id: crypto.randomUUID(),
        title: "Nueva Encuesta",
        description: "",
        questions: []
    })

    const [isPreview, setIsPreview] = React.useState(false)
    const [isSaving, setIsSaving] = React.useState(false)
    const [shareUrl, setShareUrl] = React.useState<string | null>(null)



    const addQuestion = () => {
        const newQuestion: Question = {
            id: crypto.randomUUID(),
            type: 'text',
            title: "",
            required: false,
            options: []
        }
        setSurvey(prev => ({
            ...prev,
            questions: [...prev.questions, newQuestion]
        }))
    }

    const updateQuestion = (updatedQuestion: Question) => {
        setSurvey(prev => ({
            ...prev,
            questions: prev.questions.map(q => q.id === updatedQuestion.id ? updatedQuestion : q)
        }))
    }

    const deleteQuestion = (id: string) => {
        setSurvey(prev => ({
            ...prev,
            questions: prev.questions.filter(q => q.id !== id)
        }))
    }



    const handleSave = async () => {
        setIsSaving(true);
        try {
            // We use the ID returned by Firestore or the one we generated if we set it explicitly.
            // In services.ts we used addDoc which ignores the passed ID if we don't set it in specific ways,
            // but we are passing the whole object. Let's see services.ts implementation again. 
            // It adds the survey object. 
            const id = await createSurvey(survey);

            // Construct global URL (assuming deployed or localhost)
            const url = `${window.location.origin}/survey?id=${id}`;
            setShareUrl(url);
            alert("Encuesta guardada con éxito.");
        } catch (error) {
            console.error(error);
            alert("Error al guardar la encuesta.");
        } finally {
            setIsSaving(false);
        }
    };

    if (isPreview) {
        return (
            <SurveyViewer
                survey={survey}
                isPreview={true}
                onBack={() => setIsPreview(false)}
            />
        )
    }

    return (
        <div className="max-w-4xl mx-auto py-8 space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Constructor de Encuestas</h1>
                    <p className="text-muted-foreground">Diseña tu encuesta y personaliza su apariencia.</p>
                </div>
                <Button variant="secondary" onClick={() => setIsPreview(true)}>
                    <Eye className="mr-2 h-4 w-4" /> Vista Previa
                </Button>
                <Button onClick={handleSave} disabled={isSaving}>
                    <Save className="mr-2 h-4 w-4" /> {isSaving ? "Guardando..." : "Guardar"}
                </Button>
            </div>


            {
                shareUrl && (
                    <div className="p-4 bg-green-100 border border-green-300 text-green-800 rounded-md">
                        <p className="font-bold">¡Encuesta Guardada!</p>
                        <p>Comparte este link: <a href={shareUrl} target="_blank" className="underline">{shareUrl}</a></p>
                    </div>
                )
            }

            <div className="grid gap-6 p-6 bg-card rounded-xl border shadow-sm">
                <div className="grid gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="survey-title">Título de la Encuesta</Label>
                        <Input
                            id="survey-title"
                            value={survey.title}
                            onChange={(e) => setSurvey({ ...survey, title: e.target.value })}
                            className="text-lg font-semibold"
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="survey-desc">Descripción</Label>
                        <Input
                            id="survey-desc"
                            value={survey.description}
                            onChange={(e) => setSurvey({ ...survey, description: e.target.value })}
                            placeholder="Descripción breve de la encuesta..."
                        />
                    </div>
                </div>

                <div className="border-t pt-4 mt-2">
                    <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">Personalización Visual</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="bg-color">Color de Fondo</Label>
                            <div className="flex gap-2">
                                <Input
                                    id="bg-color"
                                    type="color"
                                    className="w-12 h-10 p-1 cursor-pointer"
                                    value={survey.theme?.backgroundColor || "#ffffff"}
                                    onChange={(e) => setSurvey({
                                        ...survey,
                                        theme: {
                                            backgroundColor: e.target.value,
                                            bannerUrl: survey.theme?.bannerUrl
                                        }
                                    })}
                                />
                                <Input
                                    placeholder="#FFFFFF"
                                    value={survey.theme?.backgroundColor || ""}
                                    onChange={(e) => setSurvey({
                                        ...survey,
                                        theme: {
                                            backgroundColor: e.target.value,
                                            bannerUrl: survey.theme?.bannerUrl
                                        }
                                    })}
                                    className="flex-1"
                                />
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="banner-url">URL del Banner/Imagen</Label>
                            <Input
                                id="banner-url"
                                placeholder="https://ejemplo.com/imagen.jpg"
                                value={survey.theme?.bannerUrl || ""}
                                onChange={(e) => setSurvey({
                                    ...survey,
                                    theme: {
                                        backgroundColor: survey.theme?.backgroundColor || "#ffffff",
                                        bannerUrl: e.target.value
                                    }
                                })}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                {survey.questions.map((q) => (
                    <QuestionEditor
                        key={q.id}
                        question={q}
                        onUpdate={updateQuestion}
                        onDelete={() => deleteQuestion(q.id)}
                    />
                ))}
            </div>

            <Button onClick={addQuestion} className="w-full py-8 border-dashed border-2 bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground" variant="outline">
                <Plus className="mr-2 h-5 w-5" /> Añadir Pregunta
            </Button>
        </div >
    )
}
