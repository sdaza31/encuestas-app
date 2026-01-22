"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { getSurveyResponses, getSurvey } from "@/lib/services"
import { Survey } from "@/types"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

function ResultsContent() {
    const searchParams = useSearchParams()
    const id = searchParams.get('id')
    const [responses, setResponses] = useState<any[]>([])
    const [survey, setSurvey] = useState<Survey | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!id) return

        const fetchData = async () => {
            try {
                const [surveyData, responsesData] = await Promise.all([
                    getSurvey(id),
                    getSurveyResponses(id)
                ])
                setSurvey(surveyData)
                setResponses(responsesData)
            } catch (error) {
                console.error(error)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [id])

    const downloadCSV = () => {
        if (!survey || responses.length === 0) return;

        // Headers
        const headers = ['Fecha de Envio', ...survey.questions.map(q => q.title)];
        const csvRows = [headers.join(',')];

        // Rows
        for (const r of responses) {
            const row = [
                // Formato de fecha y hora local completo sin comas
                r.submittedAt?.toDate ? `"${r.submittedAt.toDate().toLocaleString().replace(/,/g, ' -')}"` : '"N/A"',
                ...survey.questions.map(q => {
                    const answer = r.answers?.[q.id];
                    let displayValue = answer;

                    if (Array.isArray(answer)) {
                        displayValue = answer.join(" - "); // Guiones en lugar de comas
                    } else if (typeof answer === 'boolean') {
                        displayValue = answer ? 'Si' : 'No';
                    } else if (q.type === 'radio' || q.type === 'select') {
                        const option = q.options?.find(opt => opt.value === answer);
                        if (option) displayValue = option.label;
                    }

                    const stringValue = displayValue?.toString() || '';
                    const escaped = stringValue.replace(/"/g, '""');
                    return `"${escaped}"`;
                })
            ];
            csvRows.push(row.join(','));
        }

        const csvData = csvRows.join('\n');
        // Agregar BOM para que Excel reconozca UTF-8 correctamente
        const blob = new Blob(["\uFEFF" + csvData], { type: 'text/csv;charset=utf-8;' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.setAttribute('hidden', '');
        a.setAttribute('href', url);
        a.setAttribute('download', `resultados_${survey.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.csv`);
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    if (loading) return <div className="p-8 text-center">Cargando resultados...</div>
    if (!survey) return <div className="p-8 text-center">Encuesta no encontrada</div>

    return (
        <div className="container mx-auto py-8 space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Resultados: {survey.title}</h1>
                <Button onClick={downloadCSV} disabled={responses.length === 0}>
                    Exportar CSV
                </Button>
            </div>

            <div className="grid gap-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Respuestas ({responses.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {responses.length === 0 ? (
                            <p className="text-muted-foreground">No hay respuestas aún.</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Fecha</TableHead>
                                            {survey.questions.map(q => (
                                                <TableHead key={q.id} className="min-w-[200px]">{q.title}</TableHead>
                                            ))}
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {responses.map((r) => (
                                            <TableRow key={r.id}>
                                                <TableCell className="whitespace-nowrap">
                                                    {r.submittedAt?.toDate ? r.submittedAt.toDate().toLocaleString().replace(/,/g, ' -') : 'N/A'}
                                                </TableCell>
                                                {survey.questions.map(q => {
                                                    const answer = r.answers?.[q.id];
                                                    let displayValue = answer;

                                                    if (Array.isArray(answer)) {
                                                        displayValue = answer.join(" - ");
                                                    } else if (typeof answer === 'boolean') {
                                                        displayValue = answer ? 'Si' : 'No';
                                                    } else if (q.type === 'radio' || q.type === 'select') {
                                                        // Intenta buscar el label de la opción si existe
                                                        const option = q.options?.find(opt => opt.value === answer);
                                                        if (option) displayValue = option.label;
                                                    }

                                                    return (
                                                        <TableCell key={q.id}>
                                                            {displayValue?.toString() || '-'}
                                                        </TableCell>
                                                    )
                                                })}
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
            )
}

            export default function ResultsPage() {
    return (
            <Suspense fallback={<div>Cargando...</div>}>
                <ResultsContent />
            </Suspense>
            )
}
