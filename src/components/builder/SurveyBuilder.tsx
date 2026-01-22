"use client"

import * as React from "react"
import { Survey, Question } from "@/types"
import { QuestionEditor } from "./QuestionEditor"
import { StyleEditor } from "./StyleEditor"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Eye, Save } from "lucide-react"

import { createSurvey, updateSurvey, uploadImage } from "@/lib/services"
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
    const [isUploading, setIsUploading] = React.useState(false) // Estado separado para subida de imagen
    const [shareUrl, setShareUrl] = React.useState<string | null>(null)
    const [isUpdate, setIsUpdate] = React.useState(false) // Track if we are updating an existing remote survey



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

    // Helper para obtener URL
    const getShareUrl = (id: string) => {
        const basePath = window.location.pathname.includes('/encuestas-app') ? '/encuestas-app' : '';
        return `${window.location.origin}${basePath}/survey?id=${id}`;
    }

    const handleShare = () => {
        if (!survey.id) return;
        const url = getShareUrl(survey.id);
        // Si el ID es largo (UUID), probablemente no funcionará si no se ha guardado,
        // pero le damos el link igual.
        setShareUrl(url);
        navigator.clipboard.writeText(url).then(() => alert("Link copiado al portapapeles!"));
    }

    const handleSave = async () => {
        setIsSaving(true);
        try {
            let id = survey.id;

            // Si ya hemos guardado remotamente (isUpdate is true) o detectamos que el ID no es uno generado localmente (simple heuristic?),
            // usaremos update. 
            // La mejor forma es confiar en flag isUpdate que seteamos al crear o al cargar.

            if (isUpdate) {
                await updateSurvey(survey);
                // id se mantiene
            } else {
                id = await createSurvey(survey);
                setSurvey(prev => ({ ...prev, id: id }));
                setIsUpdate(true); // From now on, it's an update
            }

            const url = getShareUrl(id);
            setShareUrl(url);
            setLastSave(Date.now()); // Trigger list refresh
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
            setIsUpdate(true); // Al seleccionar una existente, estamos en modo update
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
            setIsUpdate(false); // Nueva encuesta = create mode
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
                    <Button variant="outline" onClick={handleShare} title="Ver link para compartir">
                        <span className="mr-2">🔗</span> Compartir
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

                            <div className="flex items-center space-x-2 border p-3 rounded-md bg-muted/20">
                                <input
                                    type="checkbox"
                                    id="limit-response"
                                    checked={survey.limitOneResponse || false}
                                    onChange={(e) => setSurvey({ ...survey, limitOneResponse: e.target.checked })}
                                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                                />
                                <div className="grid gap-1.5 leading-none">
                                    <label
                                        htmlFor="limit-response"
                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                    >
                                        Limitar a 1 respuesta por persona
                                    </label>
                                    <p className="text-xs text-muted-foreground">
                                        Si se activa, el usuario solo podrá enviar la encuesta una vez desde su navegador.
                                    </p>
                                </div>
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
                                <Label htmlFor="banner-url">Banner de la Encuesta</Label>
                                <div className="space-y-2">
                                    <div className="flex gap-2">
                                        <Input
                                            id="banner-url"
                                            placeholder="https://ejemplo.com/imagen.jpg"
                                            value={survey.theme?.bannerUrl || ""}
                                            onChange={(e) => setSurvey({
                                                ...survey,
                                                theme: {
                                                    backgroundColor: survey.theme?.backgroundColor || "#ffffff",
                                                    bannerUrl: e.target.value,
                                                    titleStyle: survey.theme?.titleStyle,
                                                    descriptionStyle: survey.theme?.descriptionStyle,
                                                    questionTitleStyle: survey.theme?.questionTitleStyle,
                                                    answerStyle: survey.theme?.answerStyle
                                                }
                                            })}
                                            className="flex-1"
                                        />
                                        <div className="relative">
                                            <input
                                                type="file"
                                                id="banner-upload"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={async (e) => {
                                                    const file = e.target.files?.[0];
                                                    if (!file) return;

                                                    // Basic validation
                                                    if (file.size > 5 * 1024 * 1024) { // 5MB limit
                                                        alert("El archivo es demasiado grande (max 5MB)");
                                                        return;
                                                    }

                                                    try {
                                                        setIsUploading(true);
                                                        const url = await uploadImage(file);
                                                        setSurvey(prev => ({
                                                            ...prev,
                                                            theme: {
                                                                ...prev.theme,
                                                                backgroundColor: prev.theme?.backgroundColor || "#ffffff",
                                                                bannerUrl: url
                                                            }
                                                        }));
                                                    } catch (error: any) {
                                                        console.error(error);
                                                        if (error?.code === 'storage/unauthorized') {
                                                            alert("⛔ Error de Permisos: No tienes permiso para subir archivos.\n\nVe a Firebase Console -> Storage -> Rules y configura:\nallow read, write: if true;");
                                                        } else {
                                                            alert("Error al subir la imagen: " + (error.message || error));
                                                        }
                                                    } finally {
                                                        setIsUploading(false);
                                                        e.target.value = '';
                                                    }
                                                }}
                                            />
                                            <Button
                                                variant="secondary"
                                                onClick={() => document.getElementById('banner-upload')?.click()}
                                                disabled={isUploading || isSaving}
                                                type="button"
                                            >
                                                {isUploading ? "Subiendo..." : "Subir Imagen"}
                                            </Button>
                                        </div>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Recomendado: 1920x400px o similar wide. Max 2MB. JPG/PNG.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="border-t pt-4 mt-2">
                            <Label className="block mb-4 text-sm font-semibold text-muted-foreground uppercase tracking-wide">Tipografía y Estilos</Label>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <StyleEditor
                                    label="Título Encuesta"
                                    value={survey.theme?.titleStyle}
                                    onChange={(s) => setSurvey(prev => ({ ...prev, theme: { ...prev.theme, titleStyle: s, backgroundColor: prev.theme?.backgroundColor || "#ffffff" } }))}
                                />
                                <StyleEditor
                                    label="Descripción"
                                    value={survey.theme?.descriptionStyle}
                                    onChange={(s) => setSurvey(prev => ({ ...prev, theme: { ...prev.theme, descriptionStyle: s, backgroundColor: prev.theme?.backgroundColor || "#ffffff" } }))}
                                />
                                <StyleEditor
                                    label="Títulos Preguntas"
                                    value={survey.theme?.questionTitleStyle}
                                    onChange={(s) => setSurvey(prev => ({ ...prev, theme: { ...prev.theme, questionTitleStyle: s, backgroundColor: prev.theme?.backgroundColor || "#ffffff" } }))}
                                />
                                <StyleEditor
                                    label="Respuestas"
                                    value={survey.theme?.answerStyle}
                                    onChange={(s) => setSurvey(prev => ({ ...prev, theme: { ...prev.theme, answerStyle: s, backgroundColor: prev.theme?.backgroundColor || "#ffffff" } }))}
                                />
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
