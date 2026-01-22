"use client"

import * as React from "react"
import { Survey } from "@/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import { StarRating, NumericScale } from "@/components/ui/rating"
import { submitResponse } from "@/lib/services"

interface SurveyViewerProps {
    survey: Survey
    isPreview?: boolean
    onBack?: () => void
}

export function SurveyViewer({ survey, isPreview = false, onBack }: SurveyViewerProps) {
    const [answers, setAnswers] = React.useState<Record<string, any>>({})
    const [submitting, setSubmitting] = React.useState(false)
    const [submitted, setSubmitted] = React.useState(false) // Local submitted state for success message

    const handleAnswerChange = (questionId: string, value: any) => {
        setAnswers(prev => ({
            ...prev,
            [questionId]: value
        }))
    }

    const handleSubmit = async () => {
        if (isPreview) {
            alert("En modo vista previa no se envían datos real.\nRespuestas: " + JSON.stringify(answers, null, 2));
            return;
        }

        setSubmitting(true);
        try {
            await submitResponse(survey.id, answers);
            setSubmitted(true);
        } catch (error) {
            console.error(error);
            alert("Error al enviar la respuesta.");
        } finally {
            setSubmitting(false);
        }
    }

    if (submitted) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4 bg-muted/20">
                <div className="max-w-md w-full bg-card p-8 rounded-lg shadow-lg text-center space-y-4">
                    <h2 className="text-2xl font-bold text-green-600">¡Gracias!</h2>
                    <p className="text-muted-foreground">Tus respuestas han sido registradas correctamente.</p>
                </div>
            </div>
        )
    }

    return (
        <div
            className="min-h-screen w-full py-8 transition-colors duration-300"
            style={{ backgroundColor: survey.theme?.backgroundColor || 'transparent' }}
        >
            <div className="max-w-2xl mx-auto">
                {isPreview && onBack && (
                    <div className="mb-6 flex justify-between items-center px-4">
                        <h2 className="text-xl font-bold">Vista Previa</h2>
                        <Button variant="outline" onClick={onBack} className="bg-background">
                            Volver a Editar
                        </Button>
                    </div>
                )}

                <div className="bg-card rounded-lg shadow-lg border overflow-hidden mx-4">
                    {survey.theme?.bannerUrl && (
                        <div className="h-48 w-full overflow-hidden bg-muted">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={survey.theme.bannerUrl}
                                alt="Banner de encuesta"
                                className="w-full h-full object-cover"
                            />
                        </div>
                    )}

                    <div className="p-8">
                        <div className="mb-8">
                            <h1 className="text-3xl font-bold tracking-tight mb-2">{survey.title || "Sin título"}</h1>
                            <p className="text-muted-foreground">{survey.description}</p>
                        </div>

                        <div className="space-y-8">
                            {survey.questions.map((q, idx) => (
                                <div key={q.id} className="space-y-3">
                                    <Label className="text-base font-semibold">
                                        {idx + 1}. {q.title} {q.required && <span className="text-destructive">*</span>}
                                    </Label>

                                    {q.type === 'text' && (
                                        <Input
                                            type="text"
                                            placeholder={q.validation?.inputType === 'number' ? "Ingresa un número..." : "Tu respuesta..."}
                                            value={answers[q.id] || ''}
                                            onChange={(e) => {
                                                let val = e.target.value;
                                                const type = q.validation?.inputType || 'any';
                                                const maxLen = q.validation?.maxLength;

                                                if (type === 'number') val = val.replace(/[^0-9]/g, '');
                                                else if (type === 'text') val = val.replace(/[0-9]/g, '');

                                                if (maxLen && val.length > maxLen) val = val.slice(0, maxLen);

                                                handleAnswerChange(q.id, val);
                                            }}
                                        />
                                    )}

                                    {q.type === 'radio' && (
                                        <div className="space-y-2">
                                            {q.options?.map(opt => (
                                                <label key={opt.id} className="flex items-center space-x-2 cursor-pointer">
                                                    <input
                                                        type="radio"
                                                        name={q.id}
                                                        value={opt.value}
                                                        checked={answers[q.id] === opt.value}
                                                        onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                                                        className="h-4 w-4 border-gray-300 text-primary focus:ring-primary"
                                                    />
                                                    <span>{opt.label}</span>
                                                </label>
                                            ))}
                                        </div>
                                    )}

                                    {q.type === 'checkbox' && (
                                        <div className="space-y-2">
                                            {q.options?.map(opt => (
                                                <label key={opt.id} className="flex items-center space-x-2 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        name={q.id}
                                                        value={opt.value}
                                                        checked={Array.isArray(answers[q.id]) && answers[q.id].includes(opt.value)}
                                                        onChange={(e) => {
                                                            const current = (answers[q.id] as string[]) || [];
                                                            const newVal = e.target.checked
                                                                ? [...current, opt.value]
                                                                : current.filter(v => v !== opt.value);
                                                            handleAnswerChange(q.id, newVal);
                                                        }}
                                                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                                    />
                                                    <span>{opt.label}</span>
                                                </label>
                                            ))}
                                        </div>
                                    )}

                                    {q.type === 'select' && (
                                        <Select
                                            value={answers[q.id] || ''}
                                            onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                                        >
                                            <option value="">Selecciona una opción</option>
                                            {q.options?.map(opt => (
                                                <option key={opt.id} value={opt.value}>{opt.label}</option>
                                            ))}
                                        </Select>
                                    )}

                                    {q.type === 'date' && (
                                        <Input
                                            type="date"
                                            className="w-full sm:w-auto"
                                            value={answers[q.id] || ''}
                                            onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                                        />
                                    )}

                                    {q.type === 'rating-stars' && (
                                        <StarRating
                                            labels={{ min: 'Muy insatisfecho', max: 'Muy satisfecho' }}
                                            value={answers[q.id] || 0}
                                            onChange={(val) => handleAnswerChange(q.id, val)}
                                        />
                                    )}

                                    {q.type === 'rating-scale' && (
                                        <NumericScale
                                            max={10}
                                            labels={{ min: 'Muy insatisfecho', max: 'Muy satisfecho' }}
                                            value={answers[q.id] || 0}
                                            onChange={(val) => handleAnswerChange(q.id, val)}
                                        />
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className="mt-8 pt-6 border-t">
                            <Button className="w-full" onClick={handleSubmit} disabled={submitting}>
                                {submitting ? "Enviando..." : "Enviar Encuesta"}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
