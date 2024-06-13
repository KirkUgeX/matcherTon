import { HOSTS } from "../constants/hosts";
import { http } from "./http";

export const addAI = (aiUrl) => {
    const url = "/ai";
    const method = "PUT";
    const data = { url: aiUrl };
    const host = HOSTS.MAIN;
    return http( { url, method, data, host });
};

export const getAI = () => {
    const url = "/ai";
    const method = "GET";
    const host = HOSTS.MAIN;
    return http( { url, method, host });
};

export const testAI = () => {
    const url = "/ai/validate";
    const method = "POST";
    const host = HOSTS.MAIN;
    const timeout = 120 * 1000;
    return http({ url, method, host, timeout });
};

export const getAIgames = (id) => {
    const url = `/ai/${id}`;
    const method = "GET";
    const host = HOSTS.MAIN;
    return http({ url, method, host });
};

export const getTeamProfile = (eventId, teamId) => {
    const url = `/${eventId}/teams/${teamId}`;
    const method = "GET";
    const host = HOSTS.MAIN;
    return http({ url, method, host });
};
