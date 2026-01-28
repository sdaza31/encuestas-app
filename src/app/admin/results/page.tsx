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
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, Calendar, Activity, Download, FileText } from "lucide-react"

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

    if (loading) return <div className="flex items-center justify-center min-h-[50vh] text-muted-foreground">Cargando dashboard...</div>
    if (!survey) return <div className="flex items-center justify-center min-h-[50vh] text-destructive">Encuesta no encontrada</div>

    // Métricas
    const totalResponses = responses.length;
    const lastResponseDate = responses.length > 0
        ? responses.sort((a, b) => b.submittedAt?.toMillis() - a.submittedAt?.toMillis())[0].submittedAt?.toDate().toLocaleDateString()
        : "Sin actividad";

    // Calculamos si hay actividad reciente (últimos 7 días)
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const recentActivity = responses.filter(r => r.submittedAt?.toDate() > oneWeekAgo).length;

    return (
        <div className="container mx-auto py-8 space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Dashboard de Resultados</h1>
                    <p className="text-muted-foreground">{survey.title}</p>
                </div>
                <Button onClick={downloadCSV} disabled={responses.length === 0} className="w-full md:w-auto">
                    <Download className="mr-2 h-4 w-4" />
                    Exportar CSV
                </Button>
            </div>

            {/* KPI Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Respuestas</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalResponses}</div>
                        <p className="text-xs text-muted-foreground">
                            respuestas totales recibidas
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Última Actividad</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{lastResponseDate}</div>
                        <p className="text-xs text-muted-foreground">
                            fecha del último envío
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Actividad Reciente</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{recentActivity}</div>
                        <p className="text-xs text-muted-foreground">
                            respuestas esta semana
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Detailed Table */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-primary" />
                        <CardTitle>Detalle de Respuestas</CardTitle>
                    </div>
                    <CardDescription>
                        Listado completo de todas las respuestas recibidas para esta encuesta.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {responses.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-10 text-center text-muted-foreground">
                            <Users className="h-10 w-10 mb-4 opacity-20" />
                            <p>Aún no hay respuestas para mostrar.</p>
                        </div>
                    ) : (
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/50">
                                        <TableHead className="w-[180px]">Fecha y Hora</TableHead>
                                        {survey.questions.map(q => (
                                            <TableHead key={q.id} className="min-w-[200px]">{q.title}</TableHead>
                                        ))}
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {responses.map((r) => (
                                        <TableRow key={r.id}>
                                            <TableCell className="font-medium whitespace-nowrap">
                                                {r.submittedAt?.toDate ? r.submittedAt.toDate().toLocaleString() : 'N/A'}
                                            </TableCell>
                                            {survey.questions.map(q => {
                                                const answer = r.answers?.[q.id];
                                                let displayValue = answer;

                                                if (Array.isArray(answer)) {
                                                    displayValue = answer.join(", ");
                                                    return (
                                                        <TableCell key={q.id}>
                                                            <div className="flex flex-wrap gap-1">
                                                                {answer.map((item, idx) => (
                                                                    <span key={idx} className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80">
                                                                        {item}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </TableCell>
                                                    );
                                                } else if (typeof answer === 'boolean') {
                                                    displayValue = answer ? 'Sí' : 'No';
                                                } else if (q.type === 'radio' || q.type === 'select') {
                                                    const option = q.options?.find(opt => opt.value === answer);
                                                    if (option) displayValue = option.label;
                                                }

                                                return (
                                                    <TableCell key={q.id}>
                                                        {displayValue?.toString() || <span className="text-muted-foreground italic">Sin respuesta</span>}
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
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Cargando...</div>}>
            <ResultsContent />
        </Suspense>
    )
}
