import * as React from "react"
import { AlignLeft, AlignCenter, AlignRight, Bold, Italic } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
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

const FONT_SIZES = [
    { label: 'Pequeño', value: 'sm' },
    { label: 'Normal', value: 'base' },
    { label: 'Grande', value: 'lg' },
    { label: 'Extra Grande', value: 'xl' },
    { label: '2X Grande', value: '2xl' },
    { label: '3X Grande', value: '3xl' },
    { label: '4X Grande', value: '4xl' },
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

    const handleFontSize = (e: React.ChangeEvent<HTMLSelectElement>) => {
        onChange({ ...value, fontSize: e.target.value as any });
    }

    return (
        <div className="space-y-3 bg-muted/30 p-3 rounded-lg border">
            <Label className="text-xs font-semibold text-muted-foreground uppercase">{label}</Label>

            <div className="grid grid-cols-2 gap-2">
                <Select value={value.fontFamily || 'inherit'} onChange={handleFontFamily} className="h-8 text-xs">
                    {FONT_FAMILIES.map(f => (
                        <option key={f.value} value={f.value}>{f.label}</option>
                    ))}
                </Select>

                <Select value={value.fontSize || 'base'} onChange={handleFontSize} className="h-8 text-xs">
                    {FONT_SIZES.map(s => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                </Select>
            </div>

            <div className="flex items-center gap-2 justify-between">
                <div className="flex bg-muted p-1 rounded-md">
                    <Button
                        variant="ghost"
                        size="icon"
                        className={`h-7 w-7 rounded-sm ${value.textAlign === 'left' || !value.textAlign ? "bg-background shadow-sm" : "hover:bg-transparent"}`}
                        onClick={() => handleAlign('left')}
                        title="Alinear Izquierda"
                    >
                        <AlignLeft className="h-3 w-3" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className={`h-7 w-7 rounded-sm ${value.textAlign === 'center' ? "bg-background shadow-sm" : "hover:bg-transparent"}`}
                        onClick={() => handleAlign('center')}
                        title="Centrar"
                    >
                        <AlignCenter className="h-3 w-3" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className={`h-7 w-7 rounded-sm ${value.textAlign === 'right' ? "bg-background shadow-sm" : "hover:bg-transparent"}`}
                        onClick={() => handleAlign('right')}
                        title="Alinear Derecha"
                    >
                        <AlignRight className="h-3 w-3" />
                    </Button>
                </div>

                <div className="flex items-center gap-1">
                    <Button
                        variant="outline"
                        size="icon"
                        className={`h-8 w-8 ${value.isBold ? "bg-foreground text-background hover:bg-foreground/90 hover:text-background" : ""}`}
                        onClick={toggleBold}
                        title="Negrita"
                    >
                        <Bold className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="outline"
                        size="icon"
                        className={`h-8 w-8 ${value.isItalic ? "bg-foreground text-background hover:bg-foreground/90 hover:text-background" : ""}`}
                        onClick={toggleItalic}
                        title="Cursiva"
                    >
                        <Italic className="h-4 w-4" />
                    </Button>
                </div>

                <div className="flex items-center gap-2 border rounded-md px-2 py-1 h-8 bg-background">
                    <span className="text-xs text-muted-foreground mr-1 select-none">A</span>
                    <input
                        type="color"
                        value={value.color || "#000000"}
                        onChange={handleColor}
                        className="h-6 w-6 cursor-pointer bg-transparent border-none p-0 w-8"
                        title="Color de Texto"
                    />
                </div>
            </div>
        </div>
    )
}
