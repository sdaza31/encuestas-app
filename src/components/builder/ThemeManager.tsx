import * as React from "react"
import { SavedTheme, ThemeConfig } from "@/types"
import { createTheme, getThemes, deleteTheme } from "@/lib/services"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import { Save, Trash2, Palette } from "lucide-react"

interface ThemeManagerProps {
    currentTheme?: ThemeConfig;
    onApplyTheme: (theme: ThemeConfig) => void;
}

export function ThemeManager({ currentTheme, onApplyTheme }: ThemeManagerProps) {
    const [themes, setThemes] = React.useState<SavedTheme[]>([])
    const [newThemeName, setNewThemeName] = React.useState("")
    const [selectedThemeId, setSelectedThemeId] = React.useState<string>("")
    const [isLoading, setIsLoading] = React.useState(false)
    const [isSaving, setIsSaving] = React.useState(false)

    const loadThemes = React.useCallback(async () => {
        setIsLoading(true)
        try {
            const data = await getThemes()
            setThemes(data)
        } catch (error) {
            console.error("Error loading themes:", error)
        } finally {
            setIsLoading(false)
        }
    }, [])

    React.useEffect(() => {
        loadThemes()
    }, [loadThemes])

    const handleSaveTheme = async () => {
        if (!newThemeName.trim() || !currentTheme) return;

        setIsSaving(true)
        try {
            await createTheme(newThemeName, currentTheme)
            setNewThemeName("")
            await loadThemes()
            alert("Tema guardado exitosamente")
        } catch (error) {
            console.error("Error saving theme:", error)
            alert("Error al guardar el tema")
        } finally {
            setIsSaving(false)
        }
    }

    const handleDeleteTheme = async () => {
        if (!selectedThemeId) return;
        if (!confirm("¿Estás seguro de que quieres eliminar el tema seleccionado?")) return;

        try {
            await deleteTheme(selectedThemeId)
            setSelectedThemeId("")
            await loadThemes()
        } catch (error) {
            console.error("Error deleting theme:", error)
            alert("Error al eliminar el tema")
        }
    }

    const handleSelectTheme = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const themeId = e.target.value;
        setSelectedThemeId(themeId);

        const theme = themes.find(t => t.id === themeId);
        if (theme) {
            onApplyTheme(theme.config);
        }
    }

    return (
        <div className="space-y-4 p-4 border rounded-md bg-muted/10">
            <div className="flex items-center gap-2 mb-2">
                <Palette className="h-4 w-4" />
                <h3 className="text-sm font-semibold uppercase tracking-wide">Gestor de Temas</h3>
            </div>

            <div className="grid gap-4">
                <div className="grid gap-2">
                    <Label className="text-xs">Cargar Tema Guardado</Label>
                    <div className="flex gap-2">
                        <Select
                            value={selectedThemeId}
                            onChange={handleSelectTheme}
                            className="flex-1"
                        >
                            <option value="">Seleccionar un tema...</option>
                            {themes.map((t) => (
                                <option key={t.id} value={t.id}>
                                    {t.name}
                                </option>
                            ))}
                        </Select>

                        <Button
                            variant="destructive"
                            size="icon"
                            disabled={!selectedThemeId}
                            onClick={handleDeleteTheme}
                            title="Eliminar tema seleccionado"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                    {themes.length === 0 && !isLoading && (
                        <p className="text-xs text-muted-foreground">No hay temas guardados aún.</p>
                    )}
                </div>

                <div className="grid gap-2 pt-2 border-t">
                    <Label className="text-xs">Guardar Configuración Actual</Label>
                    <div className="flex gap-2">
                        <Input
                            placeholder="Nombre del nuevo tema"
                            value={newThemeName}
                            onChange={(e) => setNewThemeName(e.target.value)}
                            className="h-9"
                        />
                        <Button
                            size="sm"
                            onClick={handleSaveTheme}
                            disabled={!newThemeName.trim() || isSaving}
                        >
                            <Save className="h-3 w-3 mr-1" />
                            {isSaving ? "..." : "Guardar"}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
