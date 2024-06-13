import { HOSTS } from "../constants/hosts";
import { http } from "./http";
import { FIRST_PLAYER, FIRST_PLAYER_CELL, SECOND_PLAYER, SECOND_PLAYER_CELL } from "../constants/game";
import { PlayerTypes } from "../constants/player-types";
import { getHumanName } from "./humans";
import { toast } from "react-toastify";
import { getTeamProfile } from "./team";
import t from "./translation";

export const createGame = (lobbyHash) => {
    const method = "POST";
    const url = "/games";
    const host = HOSTS.MAIN;
    const data = { lobbyHash };
    return http({ method, url, host, data });
};

export const getGameInfo = (gameId) => {
    const method = "GET";
    const url = `/games/${gameId}`;
    const host = HOSTS.MAIN;
    return http({ method, url, host });
};

export const getPlayerRating = (playerId) => {
    const method = "GET";
    const url = `/humans/${playerId}`;
    const host = HOSTS.MAIN;
    return http({ method, url, host });
};

export const getGameConfig = () => {
    const method = "GET";
    const url = "/games/config";
    const host = HOSTS.MAIN;
    return http({ method, url, host });
};

export const whoseTurn = (moves) => {
    return moves.length % 2 === 0 ? FIRST_PLAYER_CELL : SECOND_PLAYER_CELL;
};

export const getPlayerGameInfo = async (player, callback, eventId) => {
    let info;
    if (player.type === PlayerTypes.HUMAN) {
        info =  await getUserInfo(player);
        info.id = player.id;
        info.parentId = player.parentId;
    } else {
        info = await getTeamInfo(eventId, player.parentId);
    }
    callback(info);
};

export const getRatingGamesSettings = () => {
    const method = "GET";
    const url = "/settings";
    const host = HOSTS.MAIN;
    return http({ method, url, host });
};

const getUserInfo = async (player) => {
    const ln = localStorage.getItem("ln");
    try {
        const rating = await getPlayerRating(player.id);
        const user = await getHumanName(player.parentId);
        return ({ name: `${user.firstName} ${user.lastName}`, points: rating.rating });
    } catch (e) {
        toast(t(ln, "failed_to_get_user_information"));
    }
};

const getTeamInfo = async (eventId, teamId) => {
    try {
        return getTeamProfile(eventId, teamId);
    } catch(e) {
        console.log(e);
    }
};
