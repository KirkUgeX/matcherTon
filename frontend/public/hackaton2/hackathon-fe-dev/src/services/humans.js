import { HOSTS } from "../constants/hosts";
import { http } from "./http";
import { humansStats } from "./stats";

export const getHumanName = async (humanId) => {
    const method = "GET";
    const url = `/users/${humanId}/profiles`;
    const host = HOSTS.UMS;
    return http({ method, url, host });
};

export const getHumansNames = (ids) => {
    const method = "POST";
    const host = HOSTS.UMS;
    const data = { ids };
    const url = "/search/users";
    return http({ method, url, host, data });
};

export const getTopHumansTableData = async (
    pageNumber,
    sortingName,
    sortingValue,
    size
) => {
    const sorting =
        sortingName && sortingValue ? `${sortingName},${sortingValue}` : null;
    const humans = await humansStats({ pageNumber, sorting, size });
    const { results } = humans;
    const userIds = results
        .map((item) => item.parentId)
        .filter((item) => {
            return Number.isNaN(+item);
        });
    const humansNames = await getHumansNames(userIds);

    const mappedResults = results.map((item) => {
        const name = humansNames.find((name) => name.id === item.parentId);
        if (item.rating) {
            return [
                (name && `${name.firstName} ${name.lastName}`) ||
                    "Name not found",
                item.stats.totalGames,
                {
                    wins: item.stats.wins,
                    ties: item.stats.ties,
                    losses: item.stats.loses,
                },
                item.rating,
            ];
        }
        return [
            (name && `${name.firstName} ${name.lastName}`) || "Name not found",
            item.stats.totalGames,
            {
                wins: item.stats.wins,
                ties: item.stats.ties,
                losses: item.stats.loses,
            },
        ];
    });
    return { humans, results: mappedResults };
};

export const getAllHumans = async () => {
    const method = "GET";
    const url = "/humans";
    const host = HOSTS.MAIN;
    return http({ method, url, host });
};

export const getHumansIdNameHashTable = async (humans) => {
    const humansInfo = await getHumansNames(humans);
    const hash = {};

    humansInfo.map((human) => {
        hash[human.id] = `${human.firstName} ${human.lastName}`;
    });

    return hash;
};
