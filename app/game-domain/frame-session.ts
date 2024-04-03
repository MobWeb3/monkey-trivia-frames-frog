export interface MutableFrameSession {
    _id: string;
    name: string;
    metaphor_id: string;
    numberOfQuestions: number;
}

// Define the read-only session interface based on the mutable session interface
export type FrameSession = Readonly<MutableFrameSession> ;