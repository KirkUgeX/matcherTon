import { authHttp } from "./http";
import { clearStorage, getAccessToken, getRefreshToken, setAccessToken, setRefreshToken } from "./localStorage";
import jwtDecode from "jwt-decode";
import { Roles } from "../constants/roles";
import { globalDispatch, globalNavigate } from "../App";
import { ROUTES } from "../constants/routes";
import { resetState } from "../redux/reducers/user";

export const login = async (googleToken) => {
    const method = "GET";
    const path = "/auth/google";
    const token = googleToken;
    const tokens = await authHttp({ method, path, token });
    // id, role, teamId
    // roles: "user", "admin"
    setAccessToken(tokens.accessToken);
    setRefreshToken(tokens.refreshToken);
    return getUserInfo(tokens.accessToken);
};

export const initialRefresh = async () => {
    const refreshToken = getRefreshToken();
    if (refreshToken) {
        await refresh();
    }
};

export const refresh = async () => {
    const method = "PUT";
    const path = "/auth";
    const token = getRefreshToken();
    try {
        const tokens = await authHttp({ method, path, token });
        setAccessToken(tokens.accessToken);
        setRefreshToken(tokens.refreshToken);
        await checkTokenExpiration(tokens.accessToken);
    } catch (e) {
        if (e.status === 401) {
            globalDispatch(resetState());
            logout()
                .finally(() => {
                    clearStorage();
                    globalDispatch(resetState());
                    return globalNavigate(ROUTES.LOGIN);
                });
        }
    }
    // if (interval) clearInterval(interval);
    // const decodedJwt = jwtDecode(tokens.accessToken);
    // const { exp, iat } = decodedJwt;
    // setRefreshInterval(exp, iat);
};

export const logout = () => {
    const method = "DELETE";
    const path = "/auth";
    const token = getRefreshToken();
    return authHttp({ method, path, token });
};

export const getUserInfo = async (accessToken) => {
    const token = accessToken || getAccessToken(); // checking if token exists
    if (token) {
        await checkTokenExpiration(token); // checking if token is not expired
        const freshToken = getAccessToken(); // In case, if token was expired and refreshed we take a new one from the localStorage
        const decodedToken = jwtDecode(freshToken);
        const user = { id: decodedToken.sub, role: decodedToken.role, teamId: decodedToken.teamId };
        const role = user.teamId && user.role !== Roles.ADMIN ? Roles.TEAM_MEMBER : user.role;
        return { ...user, role };
    }
    return null;
};

let refreshTimer = null;

const checkTokenExpiration = async (token) => {
    const decodedToken = jwtDecode(token);
    const { exp, iat } = decodedToken;
    const diff = exp - iat; // 3600 seconds by default
    const timeLeftBeforeRefresh = diff * 0.25; // After 75% of the token time has gone e.g. 9000
    const currentTime = Date.now() / 1000; // in seconds
    const tokenLeftToLive = exp - currentTime;
    if (tokenLeftToLive < timeLeftBeforeRefresh) {
        return refresh();
    }
    setTimerForTokenRefresh(Math.floor((tokenLeftToLive - timeLeftBeforeRefresh) * 1000));
};

const setTimerForTokenRefresh = (time) => {
    refreshTimer = setTimeout(() => {
        clearTimeout(refreshTimer);
        refresh();
    }, time);
};

export const isUser = (role) => {
    return role && role.toUpperCase() === Roles.USER.toUpperCase();
};

export const isTeamMember = (role) => {
    return role && role.toUpperCase() === Roles.TEAM_MEMBER.toUpperCase();
};

export const isAdmin = (role) => {
    return role && role.toUpperCase() === Roles.ADMIN.toUpperCase();
};
