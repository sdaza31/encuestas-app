import * as React from "react"
import { cn } from "@/lib/utils"
import { Star } from "lucide-react"

interface RatingProps {
    value?: number
    onChange?: (value: number) => void
    max?: number
    labels?: { min: string; max: string }
    activeColor?: string
}

export function StarRating({ value = 0, onChange, max = 5, labels, activeColor }: RatingProps) {
    const [hoverValue, setHoverValue] = React.useState<number | null>(null)

    return (
        <div className="space-y-2">
            {labels && (
                <div className="flex justify-between text-sm text-muted-foreground w-full max-w-[200px]">
                    <span>{labels.min}</span>
                    <span>{labels.max}</span>
                </div>
            )}
            <div className="flex gap-1">
                {Array.from({ length: max }).map((_, i) => {
                    const ratingValue = i + 1
                    const isFilled = (hoverValue !== null ? hoverValue : value) >= ratingValue

                    const style = isFilled && activeColor ? { color: activeColor } : {};
                    const className = isFilled && !activeColor ? "text-yellow-400" : isFilled ? "" : "text-gray-300";

                    return (
                        <button
                            key={i}
                            type="button"
                            className={cn(
                                "p-1 transition-colors focus:outline-none",
                                className
                            )}
                            style={style}
                            onMouseEnter={() => setHoverValue(ratingValue)}
                            onMouseLeave={() => setHoverValue(null)}
                            onClick={() => onChange?.(ratingValue)}
                        >
                            <Star className="w-8 h-8 fill-current" />
                        </button>
                    )
                })}
            </div>
        </div>
    )
}

export function NumericScale({ value, onChange, max = 10, labels, activeColor }: RatingProps) {
    // Function to calculate color based on value (Red -> Yellow -> Green)
    const getColor = (index: number, total: number) => {
        if (activeColor) return activeColor;

        // Map index (0 to total-1) to Hue (0 to 120)
        // 0 -> Red (0)
        // Middle -> Yellow (60)
        // End -> Green (120)
        const hue = (index / (total - 1)) * 120
        return `hsl(${hue}, 80%, 60%)`
    }

    // Hover state for scale
    const [hoverValue, setHoverValue] = React.useState<number | null>(null)

    return (
        <div className="space-y-2 w-full">
            {labels && (
                <div className="flex justify-between text-sm text-muted-foreground w-full">
                    <span>{labels.min}</span>
                    <span>{labels.max}</span>
                </div>
            )}
            <div className="flex w-full rounded-md overflow-hidden border bg-background">
                {Array.from({ length: max }).map((_, i) => {
                    const ratingValue = i + 1
                    const isSelected = value === ratingValue
                    const isHovered = hoverValue === ratingValue

                    const baseColor = getColor(i, max)

                    return (
                        <button
                            key={i}
                            type="button"
                            onClick={() => onChange?.(ratingValue)}
                            onMouseEnter={() => setHoverValue(ratingValue)}
                            onMouseLeave={() => setHoverValue(null)}
                            className={cn(
                                "flex-1 h-12 flex items-center justify-center text-sm sm:text-lg font-medium transition-all focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary relative",
                                isSelected ? "ring-2 ring-primary z-20 font-bold scale-110 shadow-lg" : "",
                                !isSelected && isHovered ? "z-10 brightness-90" : ""
                            )}
                            style={{
                                backgroundColor: isSelected || isHovered ? baseColor : 'transparent',
                                color: isSelected || isHovered ? 'white' : 'inherit',
                                borderRight: i < max - 1 ? '1px solid hsl(var(--border))' : 'none'
                            }}
                        >
                            <span className="relative z-10">{ratingValue}</span>
                            {/* Background gradient hint always visible slightly? Or just plain buttons that light up? */}
                            {/* User requested "color range from red yellow and green", implying the scale itself might be colored or just the selection. */}
                            {/* "la escala numerica siempre esta verde, debe cambiar segun el usuario marque la opcion" -> Only the selection changes color? Or the whole bar is a gradient? */}
                            {/* Let's try coloring the background lightly to show the scale, and intensely on selection. */}
                            <div
                                className="absolute inset-0 opacity-20 pointer-events-none"
                                style={{ backgroundColor: baseColor }}
                            />
                        </button>
                    )
                })}
            </div>
        </div>
    )
}
