import "../../assets/pages/History/history.scss";
import { Page } from "../../components/Page";
import { Button, Header, Table } from "../../components";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import t from "../../services/translation";
import { useSelector } from "react-redux";
import { getContest } from "../../services/contest";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { buttonStyles, paddingSizes } from "../../components/Button";
import { ROUTES } from "../../constants/routes";
import { HistoryTable } from "./components/Table/HistoryTable";
import { getTeamsIdNameHashTable } from "../../services/teams";

export const History = () => {
    const navigate = useNavigate();
    const [contestPlayers, setContestPlayers] = useState(null);
    const [matches, setMatches] = useState(null);
    const [teamsHash, setTeamsHash] = useState(null);
    const [contestError, setContestError] = useState({
        error: false,
        text: "",
    });
    const ln = useSelector((state) => state.language.currentLanguage);
    const eventId = useSelector((state) => state.event.event.id);
    const query = useParams();
    const [searchParams] = useSearchParams();

    useEffect(() => {
        getMatches().catch((e) => {
            toast(t(ln, "failed_load_table_data"));
        });
    }, [query.id]);

    useEffect(() => {
        getTeamsIdNameHashTable(eventId).then((res) => {
            setTeamsHash(res);
        });
    }, []);

    const getMatches = async () => {
        try {
            const contestData = await getContest(query.id);

            const currentPlayer = contestData.players.find((player) => {
                return player.parentId === query.teamId;
            });
            const result = searchParams.get("result");
            const player = contestData.players?.find(
                (player) => player.parentId === query.teamId
            );

            const matches = contestData.matches?.filter((match) => {
                if (
                    currentPlayer.id ===
                        match.rounds[0].games[0].firstPlayerId ||
                    currentPlayer.id === match.rounds[0].games[0].secondPlayerId
                ) {
                    switch (result) {
                    case "win":
                        return match.winnerId === player.id;
                    case "draw":
                        return match.winnerId === null;
                    case "defeat":
                        return (
                            match.winnerId && match.winnerId !== player.id
                        );
                    default:
                        return true;
                    }
                } else return false;
            });

            setContestPlayers(contestData.players);
            setMatches(matches);
        } catch (e) {
            if (e?.status === 403) {
                return setContestError({
                    error: true,
                    text: "contest_doesnt_exist",
                });
            } else if (e?.status === 404) {
                return setContestError({
                    error: true,
                    text: "wait_for_the_results",
                });
            }
            throw e;
        }
    };

    const tableHeads = [
        t(ln, "match_number"),
        t(ln, "opponent"),
        t(ln, "the_result_of_the_match"),
    ];
    const goToStatisticsPage = () => {
        navigate(ROUTES.LEADERS.TO_PAGE(query.id));
    };

    return (
        <Page className="history-page">
            <Header
                showDiscordButton={false}
                withButtons={false}
                showDropdown={false}
                customButton={
                    <Button
                        text={t(ln, "to_the_leaderboard")}
                        paddingSize={paddingSizes.NORMAL}
                        style={buttonStyles.OUTLINE}
                        onClick={goToStatisticsPage}
                        className="history-page__to-stat-button"
                    />
                }
            />
            <div className="history-page__content">
                <div className="history-page__title-wrapper">
                    <h2>{t(ln, "history_of_contest_games")}</h2>
                    {teamsHash ? <span>{teamsHash[query?.teamId]}</span> : ""}
                </div>
                <div className="history-page__table-wrapper">
                    <HistoryTable
                        names={tableHeads}
                        rows={matches}
                        className="history-page__table"
                        players={contestPlayers}
                    />
                </div>
            </div>
        </Page>
    );
};
