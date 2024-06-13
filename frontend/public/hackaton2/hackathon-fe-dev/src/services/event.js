import { HOSTS } from "../constants/hosts";
import { http } from "./http";

export const getActiveEventProfile = () => {
    const method = "GET";
    const host = HOSTS.UMS;
    const url = "/events/active";
    return http({ method, host, url });
};
