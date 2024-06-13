import { useSelector } from "react-redux";
import t from "../../../../services/translation";
import { HistoryTableHead } from "./HistoryTableHead";
import { useState } from "react";
import { HistoryTableRound } from "./HistoryTableRound";
import { useParams } from "react-router-dom";
import { useEffect } from "react";
import { getTeamsIdNameHashTable } from "../../../../services/teams";

export const HistoryTableMatch = ({ match, players, teamsHash }) => {
    const ln = useSelector((state) => state.language.currentLanguage);
    const [showRounds, setShowRounds] = useState(false);
    const query = useParams();

    const renderRounds = (match) => {
        const names = [t(ln, "round_numner"), t(ln, "the_result_of_the_round")];
        return (
            <div className="table-body rounds">
                <HistoryTableHead names={names} />
                {match?.rounds?.map((round, i) => {
                    return (
                        <HistoryTableRound
                            round={round}
                            index={i}
                            key={i}
                            players={players}
                        />
                    );
                })}
            </div>
        );
    };

    const getOpponentName = () => {
        if (!teamsHash) return t(ln, "opponent_not_found");
        const firstPlayer = players.find((player) => {
            return player.id === match.rounds[0].games[0].firstPlayerId;
        });
        const secondPlayer = players.find((player) => {
            return player.id === match.rounds[0].games[0].secondPlayerId;
        });

        if (
            query.teamId !== firstPlayer.parentId &&
            query.teamId === secondPlayer.parentId
        ) {
            return (
                teamsHash[firstPlayer.parentId] || t(ln, "opponent_not_found")
            );
        } else if (
            query.teamId !== secondPlayer.parentId &&
            query.teamId === firstPlayer.parentId
        ) {
            return (
                teamsHash[secondPlayer.parentId] || t(ln, "opponent_not_found")
            );
        }
        return null;
    };

    const getMatchResult = () => {
        if (match.winnerId === null) {
            return (
                <span className="history-page__game-result--draw">
                    {t(ln, "Draw")}
                </span>
            );
        }
        const player = players?.find(
            (player) => player.parentId === query.teamId
        );

        return player.id == match.winnerId ? (
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
                    showRounds
                        ? "table-row table-row--opend match"
                        : "table-row match"
                }
                onClick={() => setShowRounds(!showRounds)}
            >
                <div className="table-cell">{match.id}</div>
                <div className="table-cell">{getOpponentName()}</div>
                <div className="table-cell">{getMatchResult()}</div>
            </div>
            {showRounds ? renderRounds(match) : ""}
        </>
    );
};
