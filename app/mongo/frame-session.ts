import axios from 'axios';
import { BASE_URL } from '../api-service-config';
import { GameSession } from '../game-domain/game-session';
// import { Topic } from '../game-domain/Topic';

interface ApiPostParams {
    url: string;
    data: any;
}

async function apiPost({ url, data }: ApiPostParams): Promise<GameSession> {
    try {
        const response = await axios.post(`${BASE_URL}${url}`, data);
        return response.data as GameSession;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export const getSession = async (sessionId: string) => {
    return apiPost({
        url: '/api/mongo/getSession',
        data: { sessionId },
    });
}
