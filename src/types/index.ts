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
}

export interface TextStyle {
    textAlign?: 'left' | 'center' | 'right';
    isBold?: boolean;
    color?: string;
    fontSize?: 'sm' | 'base' | 'lg' | 'xl' | '2xl';
}

export interface Survey {
    id: string;
    title: string;
    description: string;
    theme?: {
        backgroundColor: string;
        bannerUrl?: string;
        titleStyle?: TextStyle;
        descriptionStyle?: TextStyle;
        questionTitleStyle?: TextStyle;
        answerStyle?: TextStyle;
    };
    thankYouMessage?: string;
    questions: Question[];
}
