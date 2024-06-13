import { HOSTS } from "../constants/hosts";
import { http } from "./http";

export const mainTeamsInfo = (eventId) => {
    const method = "GET";
    const url = `/${eventId}/teams`;
    const host = HOSTS.MAIN;
    return http({ method, host, url });
};

export const getTeamsIdNameHashTable = async (eventId) => {
    const teams = await mainTeamsInfo(eventId);
    const hash = {};

    teams.map((team) => {
        hash[team.id] = team.name;
    });

    return hash;
};
