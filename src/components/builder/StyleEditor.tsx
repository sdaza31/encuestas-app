import * as React from "react"
import { AlignLeft, AlignCenter, AlignRight, Bold, Italic } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { TextStyle } from "@/types"

interface StyleEditorProps {
    label: string;
    value?: TextStyle;
    onChange: (style: TextStyle) => void;
}

const FONT_FAMILIES = [
    { label: 'Predeterminada', value: 'inherit' },
    { label: 'Sans Serif (Inter)', value: 'var(--font-sans), system-ui, sans-serif' },
    { label: 'Serif (Playfair)', value: 'Georgia, Cambria, "Times New Roman", Times, serif' },
    { label: 'Monospace', value: 'Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace' },
    { label: 'Cursive', value: '"Comic Sans MS", "Comic Sans", cursive' },
];

export function StyleEditor({ label, value = {}, onChange }: StyleEditorProps) {
    const handleAlign = (align: 'left' | 'center' | 'right') => {
        onChange({ ...value, textAlign: align });
    }

    const toggleBold = () => {
        onChange({ ...value, isBold: !value.isBold });
    }

    const toggleItalic = () => {
        onChange({ ...value, isItalic: !value.isItalic });
    }

    const handleColor = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange({ ...value, color: e.target.value });
    }

    const handleFontFamily = (e: React.ChangeEvent<HTMLSelectElement>) => {
        onChange({ ...value, fontFamily: e.target.value });
    }

    const handleFontSize = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = parseInt(e.target.value);
        if (!isNaN(val)) {
            onChange({ ...value, fontSize: val });
        }
    }

    return (
        <div className="bg-card w-full border rounded-md shadow-sm overflow-hidden">
            <div className="bg-muted/30 px-3 py-2 border-b">
                <Label className="text-xs font-semibold text-muted-foreground uppercase">{label}</Label>
            </div>

            <div className="p-3 space-y-3">
                <div className="flex gap-2">
                    <div className="flex-1 min-w-0">
                        <Label className="text-[10px] text-muted-foreground mb-1 block">Fuente</Label>
                        <Select value={value.fontFamily || 'inherit'} onChange={handleFontFamily} className="w-full h-8 text-xs bg-background">
                            {FONT_FAMILIES.map(f => (
                                <option key={f.value} value={f.value}>{f.label}</option>
                            ))}
                        </Select>
                    </div>
                    <div className="w-16 flex-shrink-0">
                        <Label className="text-[10px] text-muted-foreground mb-1 block">Tamaño</Label>
                        <Input
                            type="number"
                            value={value.fontSize || 16}
                            onChange={handleFontSize}
                            className="h-8 text-xs px-2 text-center bg-background"
                            min={8}
                            max={72}
                        />
                    </div>
                </div>

                <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 scrollbar-none">
                    <div className="flex bg-muted p-0.5 rounded-md flex-shrink-0">
                        <Button
                            variant="ghost"
                            size="icon"
                            className={`h-7 w-7 rounded-sm ${value.textAlign === 'left' || !value.textAlign ? "bg-background shadow-sm" : "hover:bg-transparent"}`}
                            onClick={() => handleAlign('left')}
                            title="Alinear Izquierda"
                        >
                            <AlignLeft className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className={`h-7 w-7 rounded-sm ${value.textAlign === 'center' ? "bg-background shadow-sm" : "hover:bg-transparent"}`}
                            onClick={() => handleAlign('center')}
                            title="Centrar"
                        >
                            <AlignCenter className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className={`h-7 w-7 rounded-sm ${value.textAlign === 'right' ? "bg-background shadow-sm" : "hover:bg-transparent"}`}
                            onClick={() => handleAlign('right')}
                            title="Alinear Derecha"
                        >
                            <AlignRight className="h-3.5 w-3.5" />
                        </Button>
                    </div>

                    <div className="w-px h-6 bg-border mx-1 flex-shrink-0" />

                    <div className="flex items-center gap-1 flex-shrink-0">
                        <Button
                            variant="outline"
                            size="icon"
                            className={`h-8 w-8 px-0 ${value.isBold ? "bg-foreground text-background hover:bg-foreground/90 hover:text-background" : ""}`}
                            onClick={toggleBold}
                            title="Negrita"
                        >
                            <Bold className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            className={`h-8 w-8 px-0 ${value.isItalic ? "bg-foreground text-background hover:bg-foreground/90 hover:text-background" : ""}`}
                            onClick={toggleItalic}
                            title="Cursiva"
                        >
                            <Italic className="h-4 w-4" />
                        </Button>
                    </div>

                    <div className="w-px h-6 bg-border mx-1 flex-shrink-0" />

                    <label className="flex items-center justify-center h-8 w-8 border rounded-md cursor-pointer hover:bg-muted/50 flex-shrink-0 relative overflow-hidden group">
                        <span className="text-xs font-bold select-none group-hover:opacity-0 transition-opacity" style={{ color: value.color || '#000000' }}>A</span>
                        <input
                            type="color"
                            value={value.color || "#000000"}
                            onChange={handleColor}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            title="Color de Texto"
                        />
                        <div className="absolute bottom-0 left-0 right-0 h-1" style={{ backgroundColor: value.color || '#000000' }} />
                    </label>
                </div>
            </div>
        </div>
    )
}
