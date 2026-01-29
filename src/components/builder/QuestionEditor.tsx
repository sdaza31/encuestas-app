import * as React from "react"
import { Question, QuestionType, Option } from "@/types"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Trash2, Plus, X, ArrowUp, ArrowDown } from "lucide-react"

interface QuestionEditorProps {
    question: Question
    onUpdate: (updatedQuestion: Question) => void
    onDelete: () => void
    onMoveUp?: () => void
    onMoveDown?: () => void
}

export function QuestionEditor({ question, onUpdate, onDelete, onMoveUp, onMoveDown }: QuestionEditorProps) {
    const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newType = e.target.value as QuestionType
        onUpdate({
            ...question,
            type: newType,
            // Initialize options if switching to a type that needs them
            options: (newType === 'radio' || newType === 'checkbox' || newType === 'select') && !question.options
                ? []
                : question.options
        })
    }

    const addOption = () => {
        const newOption: Option = {
            id: crypto.randomUUID(),
            label: `Opción ${(question.options?.length || 0) + 1}`,
            value: `opcion-${(question.options?.length || 0) + 1}`
        }
        onUpdate({
            ...question,
            options: [...(question.options || []), newOption]
        })
    }

    const updateOption = (id: string, field: keyof Option, value: string) => {
        onUpdate({
            ...question,
            options: question.options?.map(opt =>
                opt.id === id ? { ...opt, [field]: value } : opt
            )
        })
    }

    const removeOption = (id: string) => {
        onUpdate({
            ...question,
            options: question.options?.filter(opt => opt.id !== id)
        })
    }

    return (
        <Card className="w-full relative group">
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="flex bg-background/50 backdrop-blur-sm rounded-md border shadow-sm">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onMoveUp}
                        disabled={!onMoveUp}
                        className="h-8 w-8 text-muted-foreground hover:text-foreground disabled:opacity-30"
                        title="Subir"
                    >
                        <ArrowUp className="h-4 w-4" />
                    </Button>
                    <div className="w-px bg-border my-1" />
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onMoveDown}
                        disabled={!onMoveDown}
                        className="h-8 w-8 text-muted-foreground hover:text-foreground disabled:opacity-30"
                        title="Bajar"
                    >
                        <ArrowDown className="h-4 w-4" />
                    </Button>
                    <div className="w-px bg-border my-1" />
                    <Button variant="ghost" size="icon" onClick={onDelete} className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10">
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            </div>
            <CardHeader>
                <CardTitle className="text-lg">Editar Pregunta</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid gap-2">
                    <Label htmlFor={`q-title-${question.id}`}>
                        {question.type === 'section' ? 'Título de la sección' : 'Título de la pregunta'}
                    </Label>
                    <Input
                        id={`q-title-${question.id}`}
                        value={question.title}
                        onChange={(e) => onUpdate({ ...question, title: e.target.value })}
                        placeholder={question.type === 'section' ? "Nombre de la categoría o sección" : "¿Qué te gustaría preguntar?"}
                        className={question.type === 'section' ? "font-bold text-primary border-primary/50" : ""}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor={`q-type-${question.id}`}>Tipo de elemento</Label>
                        <Select
                            id={`q-type-${question.id}`}
                            value={question.type}
                            onChange={handleTypeChange}
                        >
                            <option value="text">Texto Libre (Corto)</option>
                            <option value="long-text">Texto Largo (Párrafo)</option>
                            <option value="radio">Opción Única (Radio)</option>
                            <option value="checkbox">Casillas de Verificación (Checkbox)</option>
                            <option value="select">Lista Desplegable (Select)</option>
                            <option value="date">Fecha</option>
                            <option value="rating-stars">Rating (Estrellas)</option>
                            <option value="rating-scale">Escala Numérica (1-5)</option>
                            <option value="section">📌 Sección / Título</option>
                        </Select>
                    </div>

                    {question.type !== 'section' && (
                        <div className="flex items-end pb-2">
                            <label className="flex items-center space-x-2 text-sm font-medium cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={question.required}
                                    onChange={(e) => onUpdate({ ...question, required: e.target.checked })}
                                    className="form-checkbox h-4 w-4 text-primary rounded border-gray-300 focus:ring-primary"
                                />
                                <span>Obligatorio</span>
                            </label>
                        </div>
                    )}
                </div>

                {/* Validation Editor for Text Questions */}
                {(question.type === 'text' || question.type === 'long-text') && (
                    <div className="grid grid-cols-2 gap-4 mt-4 p-4 bg-muted/30 rounded-lg border border-dashed">
                        <div className="grid gap-2">
                            <Label htmlFor={`q-validation-type-${question.id}`}>Tipo de entrada</Label>
                            <Select
                                id={`q-validation-type-${question.id}`}
                                value={question.validation?.inputType || 'any'}
                                onChange={(e) => onUpdate({
                                    ...question,
                                    validation: { ...question.validation, inputType: e.target.value as 'text' | 'number' | 'any' }
                                })}
                            >
                                <option value="any">Cualquier Carácter</option>
                                <option value="text">Solo Letras</option>
                                <option value="number">Solo Números</option>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor={`q-max-length-${question.id}`}>Máx. Caracteres</Label>
                            <Input
                                id={`q-max-length-${question.id}`}
                                type="number"
                                placeholder="Ej. 140"
                                value={question.validation?.maxLength || ''}
                                onChange={(e) => onUpdate({
                                    ...question,
                                    validation: { ...question.validation, maxLength: e.target.value ? parseInt(e.target.value) : undefined }
                                })}
                            />
                        </div>
                    </div>
                )}

                {/* Rating Icon Style Editor */}
                {question.type === 'rating-stars' && (
                    <div className="grid gap-2 mt-4 p-4 bg-muted/30 rounded-lg border border-dashed">
                        <Label htmlFor={`q-icon-style-${question.id}`}>Estilo de Icono</Label>
                        <Select
                            id={`q-icon-style-${question.id}`}
                            value={question.iconStyle || 'star'}
                            onChange={(e) => onUpdate({
                                ...question,
                                iconStyle: e.target.value as any
                            })}
                        >
                            <option value="star">⭐ Estrellas (Clásico)</option>
                            <option value="heart">❤️ Corazones</option>
                            <option value="user">👤 Personas / Usuarios</option>
                            <option value="smile">😃 Emociones (Dinámico: Enojado - Neutro - Feliz)</option>
                        </Select>
                        <p className="text-xs text-muted-foreground">
                            {question.iconStyle === 'smile'
                                ? "Los iconos cambiarán automáticamente según la calificación elegida."
                                : "Se usará este icono para todos los niveles de calificación."}
                        </p>
                    </div>
                )}

                {/* Options Editor */}
                {(question.type === 'radio' || question.type === 'checkbox' || question.type === 'select') && (
                    <div className="space-y-2 mt-4">
                        <Label>Opciones</Label>
                        <div className="space-y-2">
                            {question.options?.map((option) => (
                                <div key={option.id} className="flex items-center gap-2">
                                    <div className="grid p-2 bg-muted rounded-full">
                                        {question.type === 'radio' && <div className="w-3 h-3 rounded-full border border-current" />}
                                        {question.type === 'checkbox' && <div className="w-3 h-3 rounded border border-current" />}
                                        {question.type === 'select' && <div className="w-3 h-3 border-b-2 border-r-2 border-current rotate-45 mb-1" />}
                                    </div>
                                    <Input
                                        value={option.label}
                                        onChange={(e) => updateOption(option.id, 'label', e.target.value)}
                                        placeholder="Etiqueta de opción"
                                        className="flex-1"
                                    />
                                    <Button variant="ghost" size="icon" onClick={() => removeOption(option.id)}>
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                        <Button variant="outline" size="sm" onClick={addOption} className="mt-2 text-primary">
                            <Plus className="h-4 w-4 mr-2" /> Añadir Opción
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
