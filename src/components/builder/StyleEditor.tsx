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
                <div className="flex bg-muted p-1 rounded-md">
                    <Button
                        variant="ghost"
                        size="icon"
                        className={`h-6 w-6 rounded-sm ${value.textAlign === 'left' || !value.textAlign ? "bg-white text-black shadow-sm" : "hover:bg-transparent"}`}
                        onClick={() => handleAlign('left')}
                        title="Alinear Izquierda"
                    >
                        <AlignLeft className="h-3 w-3" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className={`h-6 w-6 rounded-sm ${value.textAlign === 'center' ? "bg-white text-black shadow-sm" : "hover:bg-transparent"}`}
                        onClick={() => handleAlign('center')}
                        title="Centrar"
                    >
                        <AlignCenter className="h-3 w-3" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className={`h-6 w-6 rounded-sm ${value.textAlign === 'right' ? "bg-white text-black shadow-sm" : "hover:bg-transparent"}`}
                        onClick={() => handleAlign('right')}
                        title="Alinear Derecha"
                    >
                        <AlignRight className="h-3 w-3" />
                    </Button>
                </div>

                <Button
                    variant="outline"
                    size="icon"
                    className={`h-8 w-8 ${value.isBold ? "bg-black text-white hover:bg-gray-800 hover:text-white" : ""}`}
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
