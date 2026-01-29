"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Modal } from "@/components/ui/Modal"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Question, QuestionType } from "@/types"
import { FileText, HelpCircle } from "lucide-react"

interface ImportQuestionsModalProps {
    onImport: (questions: Question[]) => void;
}

export function ImportQuestionsModal({ onImport }: ImportQuestionsModalProps) {
    const [isOpen, setIsOpen] = React.useState(false)
    const [text, setText] = React.useState("")
    const [error, setError] = React.useState<string | null>(null)

    const handleOpen = () => setIsOpen(true)

    const handleClose = () => {
        setIsOpen(false)
        setText("")
        setError(null)
    }

    const parseQuestions = () => {
        if (!text.trim()) {
            setError("Por favor ingresa texto para importar.")
            return;
        }

        const lines = text.split('\n').filter(line => line.trim().length > 0);
        const newQuestions: Question[] = [];
        const validTypes: QuestionType[] = ['radio', 'checkbox', 'text', 'select', 'date', 'rating-stars', 'rating-scale', 'section'];

        try {
            lines.forEach((line) => {
                const parts = line.split('|').map(p => p.trim());
                if (parts.length === 0) return;

                const title = parts[0];
                let type: QuestionType = 'text'; // Default
                let options: string[] = [];

                if (parts.length > 1) {
                    const rawType = parts[1].toLowerCase();
                    if (validTypes.includes(rawType as QuestionType)) {
                        type = rawType as QuestionType;
                    }
                }

                if (parts.length > 2) {
                    options = parts[2].split(',').map(o => o.trim()).filter(o => o.length > 0);
                }

                // Create Question object
                const question: Question = {
                    id: crypto.randomUUID(),
                    title: title,
                    type: type,
                    required: false,
                    options: options.map(opt => ({
                        id: crypto.randomUUID(),
                        label: opt,
                        value: opt
                    }))
                };

                newQuestions.push(question);
            });

            if (newQuestions.length === 0) {
                setError("No se pudieron detectar preguntas válidas.");
                return;
            }

            onImport(newQuestions);
            handleClose();

        } catch (e) {
            console.error("Error parsing questions:", e);
            setError("Error al procesar el texto. Verifica el formato.");
        }
    }

    return (
        <>
            <Button variant="outline" onClick={handleOpen}>
                <FileText className="mr-2 h-4 w-4" /> Importar Masiva
            </Button>

            <Modal isOpen={isOpen} onClose={handleClose} title="Importación Masiva de Preguntas">
                <div className="grid gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="import-text" className="items-center flex gap-2">
                            Texto de Preguntas
                            <span className="text-xs text-muted-foreground font-normal">(Una por línea)</span>
                        </Label>
                        <Textarea
                            id="import-text"
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            placeholder={`¿Cómo te llamas?
¿Qué color prefieres? | radio | Rojo, Azul, Verde
¿Fecha de nacimiento? | date
¿Hobbies? | checkbox | Leer, Correr, Cine`}
                            className="h-[300px] font-mono text-sm"
                        />
                    </div>

                    {error && (
                        <div className="text-destructive text-sm bg-destructive/10 p-2 rounded">
                            {error}
                        </div>
                    )}

                    <div className="bg-muted/50 p-4 rounded-lg text-sm space-y-2">
                        <div className="font-semibold flex items-center gap-2">
                            <HelpCircle className="h-4 w-4" /> Tipos soportados:
                        </div>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-muted-foreground">
                            <div><code>text</code> (Texto corto)</div>
                            <div><code>radio</code> (Selección única)</div>
                            <div><code>checkbox</code> (Selección múltiple)</div>
                            <div><code>select</code> (Desplegable)</div>
                            <div><code>date</code> (Fecha)</div>
                            <div><code>rating-stars</code> (Estrellas)</div>
                            <div><code>rating-scale</code> (Escala 1-10)</div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 mt-4">
                        <Button variant="outline" onClick={handleClose}>Cancelar</Button>
                        <Button onClick={parseQuestions}>Procesar e Importar</Button>
                    </div>
                </div>
            </Modal>
        </>
    )
}
