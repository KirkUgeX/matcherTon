import { HOSTS } from "../constants/hosts";
import { http } from "./http";
import { getContest } from "./contest";
import { mainTeamsInfo } from "./teams";
import { toast } from "react-toastify";

export const humansStats = ({ pageNumber, sorting, size }) => {
    const queryParams = new URLSearchParams({
        page: pageNumber,
        sort: [sorting],
        size
    });
    const method = "GET";
    const url = queryParams ? `/humans?${queryParams}` : "/humans";
    const host = HOSTS.MAIN;
    return http({ method, host, url });
};

export const getGeneralStats = (eventId, contestId) => {
    const method = "GET";
    const url = `/${eventId}/stat/${contestId}`;
    const host = HOSTS.MAIN;
    return http({ method, host, url });
};

export const getPlayerStats = async (place, contestId, eventId) => {
    const contestData = await getContest(contestId);

    const statistic = contestData.statistics;

    const sortedStatistics = statistic
        .sort((first, second) => second.contestScore - first.contestScore)
        .sort((first, second) => {
            if (first.contestScore === second.contestScore) {
                return first.averageMoveTime - second.averageMoveTime;
            }
        });

    const thirdPlaceStats = sortedStatistics[place-1];

    const players = contestData.players;
    const teams = await mainTeamsInfo(eventId);

    const player = players.find((player) => player.id === thirdPlaceStats.playerId);

    player.team = teams.find((team) => team.id === player.parentId);

    player.averageMoveTime = thirdPlaceStats.averageMoveTime;
    player.contestScore = thirdPlaceStats.contestScore;
    player.wins = 0;
    player.ties = 0;
    player.losses = 0;

    contestData.matches.forEach((match) => {
        match.rounds.forEach((round) => {
            round.games.forEach((game) => {

                if (game.firstPlayerId === player.id || game.secondPlayerId === player.id) {
                    if (game.winnerId === player.id) {
                        player.wins++;
                    } else if (game.winnerId === null) {
                        player.ties++;
                    } else {
                        player.losses++;
                    }
                }
            });
        });
    });

    return player;
};
