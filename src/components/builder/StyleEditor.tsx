import * as React from "react"
import { AlignLeft, AlignCenter, AlignRight, Bold } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { TextStyle } from "@/types"

interface StyleEditorProps {
    label: string;
    value?: TextStyle;
    onChange: (style: TextStyle) => void;
}

export function StyleEditor({ label, value = {}, onChange }: StyleEditorProps) {
    const handleAlign = (align: 'left' | 'center' | 'right') => {
        onChange({ ...value, textAlign: align });
    }

    const toggleBold = () => {
        onChange({ ...value, isBold: !value.isBold });
    }

    const handleColor = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange({ ...value, color: e.target.value });
    }

    return (
        <div className="space-y-2">
            <Label className="text-xs font-semibold text-muted-foreground uppercase">{label}</Label>
            <div className="flex items-center gap-2">
                <div className="flex bg-muted rounded-md p-1">
                    <Button
                        variant={value.textAlign === 'left' || !value.textAlign ? "secondary" : "ghost"}
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => handleAlign('left')}
                        title="Alinear Izquierda"
                    >
                        <AlignLeft className="h-3 w-3" />
                    </Button>
                    <Button
                        variant={value.textAlign === 'center' ? "secondary" : "ghost"}
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => handleAlign('center')}
                        title="Centrar"
                    >
                        <AlignCenter className="h-3 w-3" />
                    </Button>
                    <Button
                        variant={value.textAlign === 'right' ? "secondary" : "ghost"}
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => handleAlign('right')}
                        title="Alinear Derecha"
                    >
                        <AlignRight className="h-3 w-3" />
                    </Button>
                </div>

                <Button
                    variant={value.isBold ? "secondary" : "outline"}
                    size="icon"
                    className="h-8 w-8"
                    onClick={toggleBold}
                    title="Negrita"
                >
                    <Bold className="h-4 w-4" />
                </Button>

                <div className="flex items-center gap-2 border rounded-md px-2 py-1 h-8">
                    <span className="text-xs text-muted-foreground mr-1">A</span>
                    <input
                        type="color"
                        value={value.color || "#000000"}
                        onChange={handleColor}
                        className="h-6 w-6 cursor-pointer bg-transparent border-none p-0"
                        title="Color de Texto"
                    />
                </div>
            </div>
        </div>
    )
}
