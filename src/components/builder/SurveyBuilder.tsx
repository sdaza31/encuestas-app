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
import { SurveyList } from "@/components/admin/SurveyList"

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



    const [lastSave, setLastSave] = React.useState(0)

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const id = await createSurvey(survey);

            // Si es una encuesta nueva que acabamos de guardar, actualizamos el ID local
            // para que futuros guardados sean updates (aunque createSurvey actual siempre crea nuevo por ahora en services.ts, 
            // idealmente deberíamos hacer update si ya existe ID, pero services.ts siempre hace addDoc. 
            // Por ahora asumimos comportamiento de create siempre).

            // Construct global URL
            // Usamos window.location.origin y añadimos basePath si es necesario
            const basePath = window.location.pathname.includes('/encuestas-app') ? '/encuestas-app' : '';
            const url = `${window.location.origin}${basePath}/survey?id=${id}`;
            setShareUrl(url);
            setLastSave(Date.now()); // Trigger list refresh
            // alert("Encuesta guardada con éxito."); // Eliminamos alert intrusivo
        } catch (error: any) {
            console.error("Error saving survey:", error);
            const msg = error?.message || "Error desconocido";

            if (msg.includes("permission-denied") || msg.includes("Missing or insufficient permissions")) {
                alert("⛔ Error de permisos: No tienes acceso para escribir en la base de datos.\n\nPor favor, ve a Firebase Console -> Firestore Database -> Rules y asegúrate de permitir la escritura.\n\nDetalle: " + msg);
            } else {
                alert(`❌ Error al guardar:\n${msg}`);
            }
        } finally {
            setIsSaving(false);
        }
    };

    // Función para manejar la selección de una encuesta de la lista
    const handleSelectSurvey = (selectedSurvey: Survey) => {
        if (confirm("Si cambias de encuesta sin guardar, perderás los cambios actuales. ¿Continuar?")) {
            setSurvey(selectedSurvey);
            setShareUrl(null);
        }
    };

    const handleNewSurvey = () => {
        if (confirm("Se borrarán los datos actuales. ¿Crear nueva?")) {
            setSurvey({
                id: crypto.randomUUID(),
                title: "Nueva Encuesta",
                description: "",
                questions: []
            });
            setShareUrl(null);
        }
    }

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
        <div className="max-w-7xl mx-auto py-6 space-y-6">
            <div className="flex justify-between items-center px-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Panel de Administración</h1>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={handleNewSurvey}>
                        <Plus className="mr-2 h-4 w-4" /> Nueva
                    </Button>
                    <Button variant="secondary" onClick={() => setIsPreview(true)}>
                        <Eye className="mr-2 h-4 w-4" /> Vista Previa
                    </Button>
                    <Button onClick={handleSave} disabled={isSaving}>
                        <Save className="mr-2 h-4 w-4" /> {isSaving ? "Guardando..." : "Guardar"}
                    </Button>
                </div>
            </div>

            {
                shareUrl && (
                    <div className="mx-4 p-4 bg-green-100 border border-green-300 text-green-800 rounded-md flex justify-between items-center">
                        <div>
                            <p className="font-bold">¡Encuesta Guardada!</p>
                            <p className="text-sm break-all">Link: <a href={shareUrl} target="_blank" className="underline">{shareUrl}</a></p>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => setShareUrl(null)}>X</Button>
                    </div>
                )
            }

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 px-4 items-start">

                {/* Columna Izquierda: Lista de Encuestas */}
                <div className="hidden md:block col-span-1 bg-card rounded-xl border shadow-sm p-4 sticky top-4">
                    <h2 className="font-semibold mb-4 text-lg">Mis Encuestas</h2>
                    <SurveyList
                        onSelect={handleSelectSurvey}
                        currentSurveyId={survey.id}
                        lastUpdated={lastSave}
                    />
                </div>

                {/* Columna Derecha: Editor */}
                <div className="col-span-1 md:col-span-3 space-y-8">
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
                            <div className="grid gap-2">
                                <Label htmlFor="thank-you-msg">Mensaje de Agradecimiento</Label>
                                <Input
                                    id="thank-you-msg"
                                    value={survey.thankYouMessage || ""}
                                    onChange={(e) => setSurvey({ ...survey, thankYouMessage: e.target.value })}
                                    placeholder="¡Gracias! Tus respuestas han sido enviadas. (Opcional)"
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
                </div>
            </div>
        </div >
    )
}
