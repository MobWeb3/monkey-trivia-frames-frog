import axios from 'axios';
import { BASE_URL } from '../api-service-config';
import { FrameSession } from '../game-domain/frame-session';
import { Question } from '../game-domain/question';

interface ApiPostParams {
    url: string;
    data: any;
}

async function apiPost({ url, data }: ApiPostParams): Promise<FrameSession> {
    try {
        const response = await axios.post(`${BASE_URL}${url}`, data);
        return response.data as FrameSession;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export const getFrameSession = async (id: string) => {
    return apiPost({
        url: '/api/frames/session',
        data: { id },
    });
}

export const getQuestions = async (metaphor_id: string) => {
    try {
        const response = await axios.post(
            `${BASE_URL}/api/mongo/getQuestionsByMethaporId`,
             {metaphor_id}
            );
        return response.data as Question[];
    } catch (error) {
        console.error(error);
        throw error;
    }
}