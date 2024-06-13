import { useSelector } from "react-redux";
import t from "../../../../services/translation";
import { HistoryTableHead } from "./HistoryTableHead";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { QUERY_PARAMS, QUERY_PARAMS_VALUES } from "../../../../constants/game";
import { ROUTES } from "../../../../constants/routes";

export const HistoryTableRound = ({ round, index, players }) => {
    const ln = useSelector((state) => state.language.currentLanguage);
    const [showGames, setShowGames] = useState(false);
    const query = useParams();
    const navigate = useNavigate();

    const getGameResult = (game) => {
        if (game.winnerId === null) {
            return (
                <span className="history-page__game-result--draw">
                    {t(ln, "Draw")}
                </span>
            );
        }
        const player = players?.find(
            (player) => player.parentId === query.teamId
        );

        return player.id == game.winnerId ? (
            <span className="history-page__game-result--win">
                {t(ln, "Win")}
            </span>
        ) : (
            <span className="history-page__game-result--defeat">
                {t(ln, "Defeat")}
            </span>
        );
    };

    const createWatchLink = (id) => {
        const queryParams = `${QUERY_PARAMS.FROM}=${QUERY_PARAMS_VALUES.FROM_CONTEST_HISTORY}&id=${query.id}&teamId=${query.teamId}`;
        return (
            <a
                onClick={() => navigate(ROUTES.GAME.TO_PAGE(id, queryParams))}
                className="ai-history-tab__watch-link"
            >
                {t(ln, "view_the_game")}
            </a>
        );
    };

    const renderGames = (round) => {
        const names = [
            t(ln, "game_number"),
            t(ln, "game_results"),
            t(ln, "number_of_moves"),
            "",
        ];

        return (
            <div className="table-body games">
                <HistoryTableHead names={names} />
                {round?.games?.map((game, i) => {
                    return (
                        <div className="table-row game" key={i}>
                            <div className="table-cell">{i + 1}</div>
                            <div className="table-cell">
                                {getGameResult(game)}
                            </div>
                            <div className="table-cell">
                                {game.moves.length}
                            </div>
                            <div className="table-cell">
                                {createWatchLink(game.gameId)}
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    const getRoundResult = () => {
        if (round.winnerId === null) {
            return (
                <span className="history-page__game-result--draw">
                    {t(ln, "Draw")}
                </span>
            );
        }
        const player = players?.find(
            (player) => player.parentId === query.teamId
        );

        return player.id == round.winnerId ? (
            <span className="history-page__game-result--win">
                {t(ln, "Win")}
            </span>
        ) : (
            <span className="history-page__game-result--defeat">
                {t(ln, "Defeat")}
            </span>
        );
    };

    return (
        <>
            <div
                className={
                    showGames
                        ? "table-row table-row--opend round"
                        : "table-row round"
                }
                onClick={() => setShowGames(!showGames)}
            >
                <div className="table-cell">{index + 1}</div>
                <div className="table-cell">{getRoundResult()}</div>
            </div>
            {showGames ? renderGames(round) : ""}
        </>
    );
};
