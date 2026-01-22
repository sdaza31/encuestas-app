export type QuestionType = 'radio' | 'checkbox' | 'text' | 'select' | 'date' | 'rating-stars' | 'rating-scale';

export interface Option {
    id: string;
    label: string;
    value: string;
}

export interface Question {
    id: string;
    type: QuestionType;
    title: string;
    options?: Option[]; // present only for radio, checkbox, select
    required: boolean;
    validation?: {
        inputType?: 'text' | 'number' | 'any';
        maxLength?: number;
    };
    iconStyle?: 'star' | 'heart' | 'user' | 'smile';
}

export interface TextStyle {
    textAlign?: 'left' | 'center' | 'right';
    isBold?: boolean;
    isItalic?: boolean;
    color?: string;
    fontSize?: 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
    fontFamily?: string;
}

export interface Survey {
    id: string;
    title: string;
    description: string;
    theme?: ThemeConfig;
    limitOneResponse?: boolean;
    thankYouMessage?: string;
    questions: Question[];
}

export interface ThemeConfig {
    backgroundColor: string;
    bannerUrl?: string;
    titleStyle?: TextStyle;
    descriptionStyle?: TextStyle;
    questionTitleStyle?: TextStyle;
    answerStyle?: TextStyle;
    activeColor?: string;
}

export interface SavedTheme {
    id: string;
    name: string;
    config: ThemeConfig;
    createdAt?: any; // Firestore Timestamp
}
