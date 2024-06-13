import { useState, useEffect, useReducer } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Table } from "../../../components";
import { ROUTES } from "../../../constants/routes";
import { getHumansIdNameHashTable } from "../../../services/humans";
import { getTeamsIdNameHashTable } from "../../../services/teams";
import { getAIgames } from "../../../services/team";
import { QUERY_PARAMS, QUERY_PARAMS_VALUES } from "../../../constants/game";
import t from "../../../services/translation";
import "../../../assets/pages/TeamCabinet/ai-games-history.scss";

export const AIGameHistory = () => {
    const [tableData, setTableData] = useState(null);
    const [humansHash, setHumansHash] = useState(null);
    const [teamsHash, setTeamsHash] = useState(null);
    const [unformatedTableData, setUnformatedTableData] = useState(null);
    const ln = useSelector((state) => state.language.currentLanguage);
    const user = useSelector((state) => state.user);
    const eventId = useSelector((state) => state.event.event.id);
    const navigate = useNavigate();

    useEffect(() => {
        processGamesData();
    }, []);

    useEffect(() => {
        setTableData(formatTableData(unformatedTableData));
    }, [unformatedTableData, ln]);

    const processGamesData = async () => {
        const gamesList = await getAIgames(user.teamId);
        const humansList = [];
        gamesList.games?.forEach((game) => {
            humansList.push(
                game.firstPlayer.parentId,
                game.secondPlayer.parentId
            );
        });
        const uniqueHumansList = Array.from(new Set(humansList));
        const resultHumansList = await getHumansIdNameHashTable(
            uniqueHumansList
        );
        const resultTeamsList = await getTeamsIdNameHashTable(eventId);
        setHumansHash(resultHumansList);
        setTeamsHash(resultTeamsList);
        setUnformatedTableData(gamesList.games);
    };

    const getOpponentName = (firstPlayerId, secondPlayerId) => {
        if (!humansHash || !teamsHash) return t(ln, "opponent_not_found");

        if (user.teamId !== firstPlayerId && user.teamId === secondPlayerId) {
            return (
                humansHash[firstPlayerId] ||
                teamsHash[firstPlayerId] ||
                t(ln, "opponent_not_found")
            );
        } else if (
            user.teamId !== secondPlayerId &&
            user.teamId === firstPlayerId
        ) {
            return (
                humansHash[secondPlayerId] ||
                teamsHash[secondPlayerId] ||
                t(ln, "opponent_not_found")
            );
        }
        return null;
    };

    const getGameResult = (data) => {
        if (!data.winnerId) {
            return (
                <span className="ai-history-tab__game-result--draw">
                    {t(ln, "Draw")}
                </span>
            );
        }
        const winnerParentId =
            data.winnerId === data.firstPlayer.id
                ? data.firstPlayer.parentId
                : data.secondPlayer.parentId;

        return winnerParentId === user.teamId ? (
            <span className="ai-history-tab__game-result--win">
                {t(ln, "Win")}
            </span>
        ) : (
            <span className="ai-history-tab__game-result--defeat">
                {t(ln, "Defeat")}
            </span>
        );
    };

    const createWatchLink = (id) => {
        const queryParams = `${QUERY_PARAMS.FROM}=${QUERY_PARAMS_VALUES.FROM_GAME_HISTORY}`;
        return (
            <a
                onClick={() => navigate(ROUTES.GAME.TO_PAGE(id, queryParams))}
                className="ai-history-tab__watch-link"
            >
                {t(ln, "view_the_game")}
            </a>
        );
    };

    const formatTableData = (data) => {
        const sortedData = data?.sort(
            (prev, next) => next.gameId - prev.gameId
        );
        const res = sortedData?.map((item) => {
            const teamName = getOpponentName(
                item.firstPlayer.parentId,
                item.secondPlayer.parentId
            );
            const gameResult = getGameResult(item);
            const numberOfMoves = item.moves.length;
            const watchLink = createWatchLink(item.gameId);

            return [teamName, gameResult, numberOfMoves, watchLink];
        });

        return res;
    };

    const tableHeads = [
        t(ln, "#"),
        t(ln, "opponent"),
        t(ln, "game_results"),
        t(ln, "number_of_moves"),
        "",
    ];

    return (
        <div className="team-cabinet__tab ai-history-tab">
            <Table
                names={tableHeads}
                rows={tableData}
                className="ai-history-tab__table"
                indexReverse={true}
            />
        </div>
    );
};
