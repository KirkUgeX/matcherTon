import axios from "axios";
import {
    getAccessToken,
} from "./localStorage";
import { getMainHost, getUMSHost } from "./env";
import { HOSTS } from "../constants/hosts";

axios.interceptors.request.use((config) => {
    const accessToken = getAccessToken();
    if (accessToken && !config.headers.Authorization) config.headers.Authorization = `Bearer ${accessToken}`;

    return config;
});

export const http = async ({ url = "", method = "GET", data = {}, host = HOSTS.MAIN, timeout = 60 * 1000 }) => {
    url = buildURL(url, host);

    try {
        const response = await axios({
            url,
            method,
            data,
            timeout
        });

        if (!response.status) throw response;

        return response.data;
    } catch (e) {
        throw e.response ? { data: e.response.data, status: e.response.status } : "Check your internet connection";
    }
};

export const authHttp = async ({ path = "", method, token }) => {
    const host = HOSTS.UMS;
    const url = buildURL(path, host);

    try {
        const response = await axios({
            url,
            method,
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (!response.data || !response.status) throw response;

        return response.data;
    } catch (e) {
        throw e.response ? { data: e.response.data, status: e.response.status } : "Check your internet connection";
    }
};

const buildURL = (endpoint = "", host) => {
    if (host === HOSTS.UMS) {
        return getUMSHost() + endpoint;
    }
    return getMainHost() + endpoint;
};
