"use client"

import * as React from "react"
import { Survey, TextStyle } from "@/types"
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

const getTextStyle = (style?: TextStyle): React.CSSProperties => {
    if (!style) return {};
    return {
        textAlign: style.textAlign,
        color: style.color,
        fontWeight: style.isBold ? 'bold' : 'normal',
        fontStyle: style.isItalic ? 'italic' : 'normal',
        fontSize: style.fontSize ? `${style.fontSize}px` : undefined,
        fontFamily: style.fontFamily === 'inherit' ? undefined : style.fontFamily,
    };
};

export function SurveyViewer({ survey, isPreview = false, onBack }: SurveyViewerProps) {
    const [answers, setAnswers] = React.useState<Record<string, string | number | string[]>>({})
    const [submitting, setSubmitting] = React.useState(false)
    const [submitted, setSubmitted] = React.useState(false) // Local submitted state for success message

    const [alreadyResponded, setAlreadyResponded] = React.useState(false);

    React.useEffect(() => {
        if (survey.limitOneResponse && !isPreview && survey.id) {
            const hasResponded = localStorage.getItem(`survey_responded_${survey.id}`);
            if (hasResponded) {
                setAlreadyResponded(true);
            }
        }
    }, [survey.id, survey.limitOneResponse, isPreview]);

    const handleAnswerChange = (questionId: string, value: string | number | string[]) => {
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
            if (survey.limitOneResponse) {
                localStorage.setItem(`survey_responded_${survey.id}`, 'true');
            }
        } catch (error) {
            console.error(error);
            alert("Error al enviar la respuesta.");
        } finally {
            setSubmitting(false);
        }
    }

    if (alreadyResponded) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4 bg-muted/20">
                <div className="max-w-md w-full bg-card p-8 rounded-lg shadow-lg text-center space-y-4 border border-yellow-200 bg-yellow-50">
                    <h2 className="text-xl font-bold text-yellow-800">Ya has respondido</h2>
                    <p className="text-yellow-700">
                        Esta encuesta solo permite una respuesta por persona y ya hemos registrado la tuya.
                    </p>
                </div>
            </div>
        )
    }

    if (submitted) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4 bg-muted/20">
                <div className="max-w-md w-full bg-card p-8 rounded-lg shadow-lg text-center space-y-4">
                    <h2 className="text-2xl font-bold text-green-600">¡Gracias!</h2>
                    <p className="text-muted-foreground whitespace-pre-line">
                        {survey.thankYouMessage || "Tus respuestas han sido registradas correctamente."}
                    </p>
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

                {/* Header Card */}
                <div className="bg-card rounded-xl shadow-sm border overflow-hidden mb-6 mx-4">
                    {survey.theme?.bannerUrl && (
                        <div className="w-full bg-muted/30">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={survey.theme.bannerUrl}
                                alt="Banner de encuesta"
                                className="w-full h-auto max-h-[400px] object-contain mx-auto"
                            />
                        </div>
                    )}

                    <div className="p-6 md:p-8" style={{ textAlign: survey.theme?.titleStyle?.textAlign }}>
                        <h1
                            className="text-3xl font-bold tracking-tight mb-2"
                            style={getTextStyle(survey.theme?.titleStyle)}
                        >
                            {survey.title || "Sin título"}
                        </h1>
                        <p
                            className="text-muted-foreground"
                            style={getTextStyle(survey.theme?.descriptionStyle)}
                        >
                            {survey.description}
                        </p>
                    </div>
                </div>

                {/* Questions List */}
                <div className="space-y-4 mx-4">
                    {survey.questions.map((q, idx) => (
                        <div key={q.id} className="bg-card p-6 rounded-xl shadow-sm border space-y-4 transition-all hover:shadow-md">
                            <Label
                                className="text-base font-semibold block"
                                style={getTextStyle(survey.theme?.questionTitleStyle)}
                            >
                                {idx + 1}. {q.title} {q.required && <span className="text-destructive">*</span>}
                            </Label>

                            <div style={getTextStyle(survey.theme?.answerStyle)}>

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
                                        className="bg-background/50"
                                    />
                                )}

                                {q.type === 'radio' && (
                                    <div className="space-y-2">
                                        {q.options?.map(opt => (
                                            <div key={opt.id} className={`flex items-center space-x-2 p-2 rounded-md hover:bg-muted/50 transition-colors ${answers[q.id] === opt.value ? 'bg-muted/50' : ''}`}>
                                                <input
                                                    type="radio"
                                                    id={`${q.id}-${opt.id}`}
                                                    name={q.id}
                                                    value={opt.value}
                                                    checked={answers[q.id] === opt.value}
                                                    onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                                                    className="h-4 w-4 border-gray-300 text-primary focus:ring-primary cursor-pointer"
                                                />
                                                <label htmlFor={`${q.id}-${opt.id}`} className="flex-1 cursor-pointer">{opt.label}</label>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {q.type === 'checkbox' && (
                                    <div className="space-y-2">
                                        {q.options?.map(opt => (
                                            <div key={opt.id} className={`flex items-center space-x-2 p-2 rounded-md hover:bg-muted/50 transition-colors ${Array.isArray(answers[q.id]) && (answers[q.id] as string[]).includes(opt.value) ? 'bg-muted/50' : ''}`}>
                                                <input
                                                    type="checkbox"
                                                    id={`${q.id}-${opt.id}`}
                                                    name={q.id}
                                                    value={opt.value}
                                                    checked={Array.isArray(answers[q.id]) && (answers[q.id] as string[]).includes(opt.value)}
                                                    onChange={(e) => {
                                                        const current = (answers[q.id] as string[]) || [];
                                                        const newVal = e.target.checked
                                                            ? [...current, opt.value]
                                                            : current.filter(v => v !== opt.value);
                                                        handleAnswerChange(q.id, newVal);
                                                    }}
                                                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                                                />
                                                <label htmlFor={`${q.id}-${opt.id}`} className="flex-1 cursor-pointer">{opt.label}</label>
                                            </div>
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
                                        className="w-full sm:w-auto bg-background/50"
                                        value={answers[q.id] || ''}
                                        onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                                    />
                                )}

                                {q.type === 'rating-stars' && (
                                    <div className="flex justify-center py-2">
                                        <StarRating
                                            labels={{ min: 'Muy insatisfecho', max: 'Muy satisfecho' }}
                                            value={(answers[q.id] as number) || 0}
                                            onChange={(val) => handleAnswerChange(q.id, val)}
                                            activeColor={survey.theme?.activeColor}
                                            iconStyle={q.iconStyle}
                                        />
                                    </div>
                                )}

                                {q.type === 'rating-scale' && (
                                    <div className="py-2">
                                        <NumericScale
                                            max={10}
                                            labels={{ min: 'Muy insatisfecho', max: 'Muy satisfecho' }}
                                            value={(answers[q.id] as number) || 0}
                                            onChange={(val) => handleAnswerChange(q.id, val)}
                                            activeColor={survey.theme?.activeColor}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mx-4 mt-8 pb-12">
                    <Button
                        size="lg"
                        className="w-full shadow-lg text-lg py-6"
                        onClick={handleSubmit}
                        disabled={submitting}
                        style={{
                            backgroundColor: survey.theme?.activeColor ? survey.theme.activeColor : undefined,
                            color: survey.theme?.activeColor ? '#ffffff' : undefined // Simple contrast guess
                        }}
                    >
                        {submitting ? "Enviando..." : "Enviar Encuesta"}
                    </Button>
                </div>
            </div>
        </div>
    )
}
