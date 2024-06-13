import { Fragment, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import t from "../../services/translation";
import { StatsPage } from "./Stats";
import { Roles } from "../../constants/roles";
import { Button } from "../../components";
import { buttonStyles, paddingSizes } from "../../components/Button";
import { getSocketsHost } from "../../services/env";
import { FULFILLED } from "../../sockets/constants";
import { AuthenticateEvent } from "../../sockets/events";
import { createGame } from "../../services/game";
import { QUERY_PARAMS_VALUES } from "../../constants/game";
import { ROUTES } from "../../constants/routes";
import { useNavigate, useParams } from "react-router-dom";
import { PlayerTypes } from "../../constants/player-types";
import { create } from "../../services/lobby";
import { getContest } from "../../services/contest";
import { WithCodePopup } from "../Users/components/WithCodePopup";
import { setGameState } from "../../redux/reducers/game";
import { getGeneralStats } from "../../services/stats";
import { getHumanName, getHumansNames } from "../../services/humans";

export const GeneralStats = () => {
    const navigate = useNavigate();
    const query = useParams();
    const dispatch = useDispatch();
    const ln = useSelector((state) => state.language.currentLanguage);
    const game = useSelector((state) => state.game.game);
    const event = useSelector((state) => state.event.event);
    const user = useSelector((state) => state.user);
    const [generalStatistic, setGeneralStatistic] = useState(null);
    const [lobby, setLobby] = useState(null);
    const [socket, setSocket] = useState(null);
    const [showWithCodePopup, setShowWithCodePopup] = useState(false);
    const [winner, setWinner] = useState();
    const [errorState, setErrorState] = useState(null);

    useEffect(() => {
        if (game?.gameId) {
            goToGame(game.gameId);
        }
    }, [game?.gameId]);

    const getStats = async () => {
        const genStats = await getGeneralStats(event.id, query.contestId);
        const genStatsObj = {
            firstPlace: genStats?.aiStatistics?.topThreeTeams[0],
            secondPlace: genStats?.aiStatistics?.topThreeTeams[1],
            thirdPlace: genStats?.aiStatistics?.topThreeTeams[2],
            bestPlayer: genStats?.humanStatistics?.humanWinner,
            bestMoveTimeTeam: formatResults(genStats?.aiStatistics?.bestTeamMoveTime),
            bestTeamByDraws: formatResults(genStats?.aiStatistics?.bestTeamByDraws),
            bestTeamByWins: formatResults(genStats?.aiStatistics?.bestTeamByWins),

            teamsAmount: genStats?.teamStats?.teamsCount,
            teamMembersCount: genStats?.teamStats?.teamMembersCount,
            gamesCount: genStats?.gamesStatistics?.gamesCount,
            testGamesCount: genStats?.gamesStatistics?.testGamesCount,
            humansCount: genStats?.humanStatistics?.humansCount,
            humanGamesCount: genStats?.humanStatistics?.humanGamesStat.humanGamesCount,
            humanWinsCount: genStats?.humanStatistics?.humanGamesStat.humanWinsCount,
            humanDrawsCount: genStats?.humanStatistics?.humanGamesStat.humanDrawsCount,
            humanMaxRating: genStats?.humanStatistics?.humanMaxRating,
        };
        const winner = await getHumanName([genStatsObj.bestPlayer.parentId]);
        genStatsObj.bestPlayer = `${winner.firstName} ${winner.lastName}`;
        setGeneralStatistic(genStatsObj);
    };

    const formatResults = (value) => {
        if (Array.isArray(value)) {
            if (value.length === 0) return "-";
            return value.join(", ");
        }
        return value;
    };

    const getContestWinner = async () => {
        const contest = await getContest(query.contestId);
        const winner = findWinner(contest.statistics);
        const player = contest.players.find((player) => winner.playerId === player.id);
        setWinner(player);
    };

    const findWinner = (stats) => {
        let winner = {
            ...stats[0]
        };
        for (let i = 1; i < stats.length; i++) {
            if (stats[i].contestScore > winner.contestScore) {
                winner = stats[i];
            } else if (stats[i].contestScore === winner.contestScore && stats[i].averageMoveTime < winner.averageMoveTime) {
                winner = stats[i];
            }
        }
        return winner;
    };

    useEffect(() => {
        // getting information from the API
        if (user.role === Roles.ADMIN) {
            getContestWinner()
                .catch(() => {
                    setErrorState({ text: "statistic_doesnt_exist" });
                });
        }
        getStats()
            .catch((e) => {
                if (e?.status === 403) {
                    setErrorState({ text: "wait_for_the_results_to_be_public" });
                } else if (e?.status === 404) {
                    setErrorState({ text: "statistic_doesnt_exist" });
                } else {
                    setErrorState({ text: "failed_to_get_general_statistics" });
                }
                // Handle API Error
            });
    }, []);

    const connectToLobbyWebsocket = (lobby, creating) => {
        const socket = new WebSocket(
            `${getSocketsHost()}/lobby/${lobby.lobbyHash}`
        );

        socket.onerror = () => {
            socket.close();
        };

        socket.onmessage = (messageEvent) => {
            const data = JSON.parse(messageEvent.data);

            if (
                data.status &&
                data.status.toUpperCase() === FULFILLED &&
                creating
            ) {
                createGameHandler(lobby.lobbyHash).catch((e) => {
                    toast(t(ln, "failed_to_create_game"));
                });
            }

            if (data.gameId) {
                socket.close();
                goToGame(data.gameId);
            }
        };

        socket.onopen = () => {
            socket.send(new AuthenticateEvent().stringify());
        };

        socket.onclose = () => {
            setShowWithCodePopup(false);
        };

        setSocket(socket);
    };

    const createGameHandler = async (lobbyHash) => {
        const game = await createGame(lobbyHash);
        dispatch(setGameState(game));
    };

    const goToGame = (gameId) => {
        navigate(ROUTES.GAME.TO_PAGE(gameId));
    };

    const createLobby = async () => {
        const lobbyInfo = {
            firstPlayerParentId: winner.parentId,
            firstPlayerType: PlayerTypes.AI,
            rating: false,
            showmatch: true,
        };

        const lobby = await create(lobbyInfo);
        setLobby(lobby);
        setShowWithCodePopup(true);
        connectToLobbyWebsocket(lobby, true);
    };

    const closePopup = () => {
        socket && socket.close();
        setShowWithCodePopup(false);
    };

    const customHeaderButton = user.role === Roles.ADMIN ? (
        <Button
            text={t(ln, "create_show_game")}
            onClick={() => createLobby()}
            className="start_show_match__button"
            style={buttonStyles.PRIMARY}
            paddingSize={paddingSizes.HUGE}
        />
    ) : null;

    return (
        <Fragment>
            <StatsPage
                title={t(ln, "general_statistics_of_the_hackathon")}
                generalStatistic={generalStatistic}
                error={errorState}
                customHeaderButton={customHeaderButton}
            />
            <WithCodePopup
                showTimer={false}
                show={showWithCodePopup}
                onPopupClose={closePopup}
                title={"wait_for_the_best_player_to_join"}
            />
        </Fragment>

    );
};
