export interface Question {
    question?: string;
    options?: string[];
    answer?: string;
    source?: string;
    used?: boolean;
    metaphor_id?: string;
    general_id?: string;
}