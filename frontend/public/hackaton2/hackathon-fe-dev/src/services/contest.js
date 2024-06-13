import { HOSTS } from "../constants/hosts";
import { http } from "./http";

export const getContests = () => {
    const method = "GET";
    const host = HOSTS.MAIN;
    const url = "/contests";
    return http({ method, host, url });
};

export const getContest = (id) => {
    const method = "GET";
    const host = HOSTS.MAIN;
    const url = `/contests/${id}`;
    return http({ method, host, url });
};
