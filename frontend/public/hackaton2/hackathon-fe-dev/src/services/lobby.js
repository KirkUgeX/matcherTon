import { HOSTS } from "../constants/hosts";
import { http } from "./http";

export const create = (data) => {
    const method = "POST";
    const url = "/lobbies";
    // const data = {/* Need to be clarified  */};
    const host = HOSTS.MAIN;
    return http({ method, data, host, url });
};

export const joinLobby = ({ hash, type }) => {
    const method = "PUT";
    const url = `/lobbies/${hash}?playerType=${type}`;
    const host = HOSTS.MAIN;
    return http({ method, host, url });
};
