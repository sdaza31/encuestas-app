"use client"

import * as React from "react"
import { Survey, Question } from "@/types"
import { QuestionEditor } from "./QuestionEditor"
import { StyleEditor } from "./StyleEditor"
import { ThemeManager } from "./ThemeManager"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import { Plus, Eye, Save } from "lucide-react"

import { createSurvey, updateSurvey, uploadImage } from "@/lib/services"
import { SurveyViewer } from "@/components/SurveyViewer"
import { SurveyList } from "@/components/admin/SurveyList"

import { ShareModal } from "./ShareModal"
import { ImportQuestionsModal } from "./ImportQuestionsModal"
import { RichTextEditor } from "@/components/ui/RichTextEditor"

export function SurveyBuilder() {
    const [survey, setSurvey] = React.useState<Survey>({
        id: crypto.randomUUID(),
        title: "Nueva Encuesta",
        description: "",
        questions: []
    })

    const [isPreview, setIsPreview] = React.useState(false)
    const [isSaving, setIsSaving] = React.useState(false)
    const [isUploading, setIsUploading] = React.useState(false)
    const [isShareModalOpen, setIsShareModalOpen] = React.useState(false)
    const [isUpdate, setIsUpdate] = React.useState(false)

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

    const handleShare = () => {
        if (!survey.id) return;
        setIsShareModalOpen(true);
    }

    const handleSave = async () => {
        setIsSaving(true);
        try {
            let id = survey.id;
            if (isUpdate) {
                await updateSurvey(survey);
            } else {
                id = await createSurvey(survey);
                setSurvey(prev => ({ ...prev, id: id }));
                setIsUpdate(true);
            }

            setLastSave(Date.now());
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

    const handleSelectSurvey = (selectedSurvey: Survey) => {
        if (confirm("Si cambias de encuesta sin guardar, perderás los cambios actuales. ¿Continuar?")) {
            setSurvey(selectedSurvey);
            setIsUpdate(true);
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
            setIsUpdate(false);
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
            <ShareModal
                isOpen={isShareModalOpen}
                onClose={() => setIsShareModalOpen(false)}
                surveyId={survey.id}
            />
            <div className="flex justify-between items-center px-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Panel de Administración</h1>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={handleNewSurvey}>
                        <Plus className="mr-2 h-4 w-4" /> Nueva
                    </Button>
                    <Button variant="outline" onClick={handleShare} title="Ver link para compartir" disabled={!isUpdate && !survey.id}>
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

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 px-4 items-start">
                <div className="hidden md:block col-span-1 bg-card rounded-xl border shadow-sm p-4 sticky top-4">
                    <h2 className="font-semibold mb-4 text-lg">Mis Encuestas</h2>
                    <SurveyList
                        onSelect={handleSelectSurvey}
                        currentSurveyId={survey.id}
                        lastUpdated={lastSave}
                    />
                </div>

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
                                <RichTextEditor
                                    value={survey.description}
                                    onChange={(val) => setSurvey({ ...survey, description: val })}
                                    placeholder="Descripción breve de la encuesta..."
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="thank-you-msg">Mensaje de Agradecimiento</Label>
                                <RichTextEditor
                                    value={survey.thankYouMessage || ""}
                                    onChange={(val) => setSurvey({ ...survey, thankYouMessage: val })}
                                    placeholder="¡Gracias! Tus respuestas han sido enviadas."
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="footer-msg">Mensaje Pie de Encuesta (antes de enviar)</Label>
                                <RichTextEditor
                                    value={survey.footerMessage || ""}
                                    onChange={(val) => setSurvey({ ...survey, footerMessage: val })}
                                    placeholder="Ej. Gracias por tu tiempo. Tus respuestas son anónimas."
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

                            <div className="border border-indigo-100 bg-indigo-50/50 p-4 rounded-xl space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label className="text-base font-semibold text-indigo-900">Acceso y Seguridad</Label>
                                        <p className="text-sm text-indigo-700">Controla quién puede ver y responder esta encuesta.</p>
                                    </div>
                                </div>
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label>Tipo de Acceso</Label>
                                        <Select
                                            value={survey.privacy || 'public'}
                                            onChange={(e) => setSurvey({ ...survey, privacy: e.target.value as 'public' | 'private' })}
                                        >
                                            <option value="public">Pública (Cualquiera con el link)</option>
                                            <option value="private">Restringida (Solo emails autorizados)</option>
                                        </Select>
                                        <p className="text-xs text-muted-foreground">
                                            {survey.privacy === 'private'
                                                ? "Solo los usuarios en la lista podrán acceder ingresando su correo."
                                                : "Cualquier persona con el enlace podrá responder."}
                                        </p>
                                    </div>

                                    {survey.privacy === 'private' && (
                                        <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                                            <Label>Correos Autorizados (Uno por línea)</Label>
                                            <textarea
                                                className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                placeholder={`usuario1@empresa.com\nusuario2@empresa.com\n...`}
                                                value={survey.allowedEmails?.join('\n') || ''}
                                                onChange={(e) => {
                                                    const text = e.target.value;
                                                    const emails = text.split('\n').map(s => s.trim()).filter(Boolean);
                                                    setSurvey({ ...survey, allowedEmails: emails });
                                                }}
                                            />
                                            <p className="text-xs text-muted-foreground">
                                                Total autorizados: {survey.allowedEmails?.length || 0}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <ThemeManager
                            currentTheme={survey.theme}
                            onApplyTheme={(theme) => setSurvey(prev => ({ ...prev, theme }))}
                        />

                        <div className="border-t pt-4 mt-2">
                            <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">Personalización Visual</h3>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="bg-color">Fondo de la Página</Label>
                                    <div className="flex gap-2">
                                        <div className="relative flex-1">
                                            <Input
                                                id="bg-color"
                                                placeholder="Ej. #ffffff o linear-gradient(...)"
                                                value={survey.theme?.backgroundColor || ""}
                                                onChange={(e) => {
                                                    let val = e.target.value;
                                                    // Remove "background:" or "background-image:" prefixes
                                                    val = val.replace(/background(-image)?\s*:\s*/gi, '');

                                                    // Split by semicolon to handle multiple declarations (e.g. fallback color + gradient)
                                                    const parts = val.split(';').map(p => p.trim()).filter(p => p);

                                                    if (parts.length > 0) {
                                                        // If there's a gradient, prefer it
                                                        const gradientPart = parts.find(p => p.toLowerCase().includes('gradient'));
                                                        val = gradientPart || parts[parts.length - 1];
                                                    }

                                                    setSurvey({
                                                        ...survey,
                                                        theme: {
                                                            ...(survey.theme || {}),
                                                            backgroundColor: val
                                                        }
                                                    })
                                                }}
                                                className="font-mono text-xs"
                                            />
                                        </div>
                                        <Input
                                            type="color"
                                            className="w-12 h-10 p-1 cursor-pointer shrink-0"
                                            value={survey.theme?.backgroundColor?.startsWith('#') ? survey.theme.backgroundColor : "#ffffff"}
                                            onChange={(e) => setSurvey({
                                                ...survey,
                                                theme: {
                                                    ...(survey.theme || {}),
                                                    backgroundColor: e.target.value
                                                }
                                            })}
                                        />
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Puedes usar un color (#hex) o código CSS. Para degradados visita: <a href="https://cssgradient.io/" target="_blank" rel="noreferrer" className="text-primary hover:underline">cssgradient.io</a>
                                    </p>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="section-bg-color">Fondo de Títulos/Secciones</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            type="color"
                                            className="w-12 h-10 p-1 cursor-pointer shrink-0"
                                            value={survey.theme?.sectionBackground || "#822A88"}
                                            onChange={(e) => setSurvey({
                                                ...survey,
                                                theme: {
                                                    ...(survey.theme || {}),
                                                    backgroundColor: survey.theme?.backgroundColor || "#ffffff",
                                                    sectionBackground: e.target.value
                                                }
                                            })}
                                        />
                                        <Input
                                            placeholder="#822A88"
                                            value={survey.theme?.sectionBackground || ""}
                                            onChange={(e) => {
                                                const val = e.target.value.replace(/;\s*$/, '').replace(/background(-image)?:\s*/gi, '').trim();
                                                setSurvey({
                                                    ...survey,
                                                    theme: {
                                                        ...(survey.theme || {}),
                                                        backgroundColor: survey.theme?.backgroundColor || "#ffffff",
                                                        sectionBackground: val
                                                    }
                                                })
                                            }}
                                            className="flex-1 font-mono"
                                        />
                                    </div>
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="active-color">Color de Énfasis (Estrellas/Escalas)</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            type="color"
                                            className="w-12 h-10 p-1 cursor-pointer shrink-0"
                                            value={survey.theme?.activeColor || "#822A88"}
                                            onChange={(e) => setSurvey({
                                                ...survey,
                                                theme: {
                                                    ...(survey.theme || {}),
                                                    backgroundColor: survey.theme?.backgroundColor || "#ffffff",
                                                    activeColor: e.target.value
                                                }
                                            })}
                                        />
                                        <Input
                                            placeholder="#822A88"
                                            value={survey.theme?.activeColor || ""}
                                            onChange={(e) => setSurvey({
                                                ...survey,
                                                theme: {
                                                    ...(survey.theme || {}),
                                                    backgroundColor: survey.theme?.backgroundColor || "#ffffff",
                                                    activeColor: e.target.value
                                                }
                                            })}
                                            className="flex-1 font-mono"
                                        />
                                    </div>
                                </div>
                                <div className="grid gap-2 md:col-span-2">
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
                                                        ...(survey.theme || {}),
                                                        backgroundColor: survey.theme?.backgroundColor || "#ffffff",
                                                        bannerUrl: e.target.value
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
                                                        if (file.size > 5 * 1024 * 1024) {
                                                            alert("El archivo es demasiado grande (max 5MB)");
                                                            return;
                                                        }
                                                        try {
                                                            setIsUploading(true);
                                                            const url = await uploadImage(file);
                                                            setSurvey(prev => ({
                                                                ...prev,
                                                                theme: {
                                                                    ...(prev.theme || {}),
                                                                    backgroundColor: prev.theme?.backgroundColor || "#ffffff",
                                                                    bannerUrl: url
                                                                }
                                                            }));
                                                        } catch (error: any) {
                                                            console.error(error);
                                                            if (error?.code === 'storage/unauthorized') {
                                                                alert("⛔ Error de Permisos: No tienes permiso para subir archivos.");
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
                        </div>

                        <div className="border-t pt-4 mt-2">
                            <Label className="block mb-4 text-sm font-semibold text-muted-foreground uppercase tracking-wide">Tipografía y Estilos</Label>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                                    label="Título de Sección"
                                    value={survey.theme?.sectionTitleStyle}
                                    onChange={(s) => setSurvey(prev => ({ ...prev, theme: { ...prev.theme, sectionTitleStyle: s, backgroundColor: prev.theme?.backgroundColor || "#ffffff" } }))}
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

                    <div className="grid grid-cols-2 gap-4">
                        <Button onClick={addQuestion} className="w-full py-8 border-dashed border-2 bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground" variant="outline">
                            <Plus className="mr-2 h-5 w-5" /> Añadir Pregunta
                        </Button>
                        <ImportQuestionsModal
                            onImport={(newQuestions) => {
                                setSurvey(prev => ({
                                    ...prev,
                                    questions: [...prev.questions, ...newQuestions]
                                }));
                            }}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}
