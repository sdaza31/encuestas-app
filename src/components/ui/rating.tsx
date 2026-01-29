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
                <div className="flex justify-between text-sm text-muted-foreground w-full px-1">
                    <span>{labels.min}</span>
                    <span>{labels.max}</span>
                </div>
            )}
            <div className="flex gap-4 sm:gap-6 flex-wrap justify-center">
                {Array.from({ length: max }).map((_, i) => {
                    const ratingValue = i + 1
                    const isHoveredOrFilled = (hoverValue !== null ? hoverValue : value) >= ratingValue

                    const Icon = getIcon(i, ratingValue);

                    // Color logic
                    let colorClass = "";
                    let style: React.CSSProperties = {};

                    if (activeColor) {
                        style = {
                            color: activeColor,
                            opacity: isHoveredOrFilled ? 1 : 0.5
                        };
                    } else {
                        // Default fallback if no activeColor is explicitly passed (though it usually is)
                        if (isHoveredOrFilled) {
                            if (iconStyle === 'user' || iconStyle === 'smile') {
                                const dynColor = getDynamicColor(i);
                                if (dynColor.startsWith("text-")) colorClass = dynColor;
                                else style = { color: dynColor };
                            } else {
                                colorClass = iconStyle === 'heart' ? "text-red-500" : "text-yellow-400";
                            }
                        } else {
                            colorClass = "text-gray-200";
                        }
                    }

                    return (
                        <button
                            key={i}
                            type="button"
                            className={cn(
                                "p-1 transition-all focus:outline-none transform hover:scale-110",
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

export function NumericScale({ value, onChange, max = 10, labels, activeColor, nps }: RatingProps & { nps?: boolean }) {
    const [hoverValue, setHoverValue] = React.useState<number | null>(null)

    // Corporate colors gradient: Light Lilac -> Corporate Purple (Lighter by default)
    // #E6CEF2 (Very light purple) -> #A970AF (Light purple)
    const gradientBackground = `linear-gradient(to right, #E6CEF2, #CDA4D4, #A970AF)`;

    // Removed color definitions as requested - using neutral text

    return (
        <div className="space-y-3 w-full">
            {nps ? (
                <div className="flex w-full text-xs sm:text-sm font-medium text-muted-foreground pb-1">
                    <div className="flex-1 text-center border-b-2 border-muted pb-1 mx-1" style={{ flexGrow: 6 }}>Detractor</div>
                    <div className="flex-1 text-center border-b-2 border-muted pb-1 mx-1" style={{ flexGrow: 2 }}>Neutral</div>
                    <div className="flex-1 text-center border-b-2 border-muted pb-1 mx-1" style={{ flexGrow: 2 }}>Promotor</div>
                </div>
            ) : (
                labels && (
                    <div className="flex justify-between text-sm text-muted-foreground w-full">
                        <span>{labels.min}</span>
                        <span>{labels.max}</span>
                    </div>
                )
            )}

            <div
                className="flex w-full rounded-md overflow-hidden border bg-background relative"
                style={{ background: gradientBackground }}
            >
                {Array.from({ length: max }).map((_, i) => {
                    const ratingValue = i + 1
                    const isSelected = value === ratingValue
                    const isHovered = hoverValue === ratingValue

                    // Always use corporate color or provided activeColor
                    const buttonActiveColor = activeColor || '#822A88';

                    return (
                        <button
                            key={i}
                            type="button"
                            onClick={() => onChange?.(ratingValue)}
                            onMouseEnter={() => setHoverValue(ratingValue)}
                            onMouseLeave={() => setHoverValue(null)}
                            className={cn(
                                "flex-1 h-12 flex items-center justify-center text-sm sm:text-lg font-medium transition-all focus:outline-none relative z-10",
                                isSelected ? "font-bold scale-110 shadow-lg z-20 ring-2 ring-white" : "text-black/60 hover:text-white hover:bg-white/10"
                            )}
                            style={{
                                backgroundColor: isSelected || isHovered ? buttonActiveColor : 'transparent',
                                color: isSelected || isHovered ? 'white' : undefined,
                                textShadow: isSelected || isHovered ? '0 1px 2px rgba(0,0,0,0.3)' : 'none'
                            }}
                        >
                            <span className="relative z-10">{ratingValue}</span>
                        </button>
                    )
                })}
            </div>
        </div>
    )
}
