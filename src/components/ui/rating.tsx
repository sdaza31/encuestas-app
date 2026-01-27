import * as React from "react"
import { cn } from "@/lib/utils"
import { Star, Heart, User, Frown, Meh, Smile, UserX, UserCheck } from "lucide-react"

interface RatingProps {
    value?: number
    onChange?: (value: number) => void
    max?: number
    labels?: { min: string; max: string }
    activeColor?: string
    iconStyle?: 'star' | 'heart' | 'user' | 'smile'
}

export function StarRating({ value = 0, onChange, max = 5, labels, activeColor, iconStyle = 'star' }: RatingProps) {
    const [hoverValue, setHoverValue] = React.useState<number | null>(null)

    const getIcon = (index: number, val: number) => {
        const rating = index + 1;
        const normalize = (r: number) => r / max; // 0..1
        const ratio = normalize(rating);

        if (iconStyle === 'heart') return <Heart className="w-8 h-8 fill-current" />;

        if (iconStyle === 'user') {
            // Logic requested: 
            // Low -> Arms crossed (UserX/UserMinus approx)
            // Mid -> Thinking (User)
            // High -> Waving (UserCheck/Hand approx)
            // Ideally we stick to standard lucide or use widely available ones.
            // Let's use: UserX (Low), User (Mid), UserCheck (High/Happy)
            if (ratio <= 0.4) return <UserX className="w-8 h-8 fill-current" />;
            if (ratio <= 0.7) return <User className="w-8 h-8 fill-current" />;
            return <UserCheck className="w-8 h-8 fill-current" />;
        }

        if (iconStyle === 'smile') {
            if (ratio <= 0.4) return <Frown className="w-8 h-8 fill-current" />;
            if (ratio <= 0.7) return <Meh className="w-8 h-8 fill-current" />;
            return <Smile className="w-8 h-8 fill-current" />;
        }

        // Default star
        return <Star className="w-8 h-8 fill-current" />;
    }

    const getDynamicColor = (index: number) => {
        // Only for user/smile dynamic styles if no activeColor is forced? 
        // Or should we always respect activeColor if present? 
        // User asked for "shape change", usually implies color change too like in the image (Red -> Yellow -> Green).
        // Let's apply traffic light colors IF activeColor is NOT set.
        if (activeColor) return activeColor;

        const ratio = (index + 1) / max;
        if (ratio <= 0.4) return "text-red-500";
        if (ratio <= 0.7) return "text-yellow-500";
        return "text-green-500";
    }

    return (
        <div className="space-y-2">
            {labels && (
                <div className="flex justify-between text-sm text-muted-foreground w-full max-w-[200px]">
                    <span>{labels.min}</span>
                    <span>{labels.max}</span>
                </div>
            )}
            <div className="flex gap-6">
                {Array.from({ length: max }).map((_, i) => {
                    const ratingValue = i + 1
                    const isHoveredOrFilled = (hoverValue !== null ? hoverValue : value) >= ratingValue

                    // For dynamic icons (smile/user), we want the icon to reflect the CURRENT rating being hovered/selected, 
                    // NOT the individual star's position necessarily? 
                    // Actually standard behavior: 1st star always sad, 5th star always happy. 
                    // BUT in the user image, it looks like a scale where each step has its own static identity.
                    // Let's implement static identity per step (1=Red/Crossed, 5=Green/Waving).

                    const Icon = getIcon(i, ratingValue);

                    // Color logic
                    let colorClass = "text-gray-200";
                    let style: React.CSSProperties = {};

                    if (isHoveredOrFilled) {
                        if (activeColor) {
                            style = { color: activeColor };
                        } else if (iconStyle === 'user' || iconStyle === 'smile') {
                            // Force dynamic colors for these styles if no custom color
                            const dynColor = getDynamicColor(i);
                            if (dynColor.startsWith("text-")) colorClass = dynColor;
                            else style = { color: dynColor };
                        } else {
                            // Default yellow for stars/hearts
                            colorClass = iconStyle === 'heart' ? "text-red-500" : "text-yellow-400";
                        }
                    } else {
                        colorClass = "text-gray-200"; // Empty state
                    }

                    return (
                        <button
                            key={i}
                            type="button"
                            className={cn(
                                "p-1 transition-colors focus:outline-none transform hover:scale-110",
                                !activeColor && !style.color ? colorClass : ""
                            )}
                            style={style}
                            onMouseEnter={() => setHoverValue(ratingValue)}
                            onMouseLeave={() => setHoverValue(null)}
                            onClick={() => onChange?.(ratingValue)}
                        >
                            {Icon}
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
