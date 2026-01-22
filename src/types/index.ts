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

export interface Survey {
    id: string;
    title: string;
    description: string;
    theme?: {
        backgroundColor: string;
        bannerUrl?: string;
    };
    thankYouMessage?: string;
    questions: Question[];
}
