import "../../assets/pages/leaders.scss";
import { Page } from "../../components/Page";
import { Button, Header, Table } from "../../components";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import t from "../../services/translation";
import { useSelector } from "react-redux";
import { getContest } from "../../services/contest";
import { mainTeamsInfo } from "../../services/teams";
import { useNavigate, useParams } from "react-router-dom";
import { Roles } from "../../constants/roles";
import { buttonStyles, paddingSizes } from "../../components/Button";
import { ROUTES } from "../../constants/routes";

export const Leaders = () => {
    const navigate = useNavigate();
    const [tableData, setTableData] = useState(null);
    const [teamsStorage, setTeamsStorage] = useState(null);
    const [contestError, setContestError] = useState({
        error: false,
        text: "",
    });
    const ln = useSelector((state) => state.language.currentLanguage);
    const event = useSelector((state) => state.event.event);
    const user = useSelector((state) => state.user);
    const query = useParams();

    useEffect(() => {
        getTableData().catch((e) => {
            toast(t(ln, "failed_load_table_data"));
            // TODO Handle Errors
        });
    }, [query.id]);

    const getTableData = async () => {
        let contestData;
        try {
            contestData = await getContest(query.id);
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

        const players = contestData.players;
        let teams = teamsStorage;
        if (!teams) {
            teams = await mainTeamsInfo(event.id);
            setTeamsStorage(teams);
        }

        teams.forEach((team) => {
            const player = players.find(
                (player) => team.id === player.parentId
            );
            if (player) {
                player.team = team;
            }
        });

        contestData.statistics.forEach((item) => {
            const player = players.find(
                (player) => item.playerId === player.id
            );
            if (player) {
                player.averageMoveTime = item.averageMoveTime;
                player.contestScore = item.contestScore;
                player.wins = 0;
                player.ties = 0;
                player.losses = 0;
            }
        });

        const playersHashTable = {};

        players.forEach((player) => {
            playersHashTable[player.id] = player;
        });

        contestData.matches.forEach((match) => {
            const firstMatchGame = match?.rounds[0]?.games[0];
            const firstPlayerId = firstMatchGame?.firstPlayerId;
            const secondPlayerId = firstMatchGame?.secondPlayerId;

            if (!match.winnerId) {
                playersHashTable[firstPlayerId].ties++;
                playersHashTable[secondPlayerId].ties++;
            } else if (match.winnerId === firstPlayerId) {
                playersHashTable[firstPlayerId].wins++;
                playersHashTable[secondPlayerId].losses++;
            } else {
                playersHashTable[firstPlayerId].losses++;
                playersHashTable[secondPlayerId].wins++;
            }
        });

        const sortedPlayers = players
            .sort((first, second) => second.contestScore - first.contestScore)
            .sort((first, second) => {
                if (first.contestScore === second.contestScore) {
                    return first.averageMoveTime - second.averageMoveTime;
                }
            });

        const createAllGamesLink = (player) => {
            return (
                <a
                    className="leaders-page__table-link"
                    onClick={() =>
                        navigate(
                            ROUTES.CONTEST_HISTORY.TO_PAGE(
                                query.id,
                                player?.team.id
                            )
                        )
                    }
                >
                    {player.wins + player.ties + player.losses}
                </a>
            );
        };

        const createWinsGamesLink = (player) => {
            return (
                <a
                    className="leaders-page__table-link leaders-page__table-link--win"
                    onClick={() =>
                        navigate(
                            ROUTES.CONTEST_HISTORY.TO_PAGE(
                                query.id,
                                player?.team.id,
                                "result=win"
                            )
                        )
                    }
                >
                    {player.wins}
                </a>
            );
        };

        const createDrawsGamesLink = (player) => {
            return (
                <a
                    className="leaders-page__table-link leaders-page__table-link--draw"
                    onClick={() =>
                        navigate(
                            ROUTES.CONTEST_HISTORY.TO_PAGE(
                                query.id,
                                player?.team.id,
                                "result=draw"
                            )
                        )
                    }
                >
                    {player.ties}
                </a>
            );
        };

        const createDefeatGamesLink = (player) => {
            return (
                <a
                    className="leaders-page__table-link leaders-page__table-link--defeat"
                    onClick={() =>
                        navigate(
                            ROUTES.CONTEST_HISTORY.TO_PAGE(
                                query.id,
                                player?.team.id,
                                "result=defeat"
                            )
                        )
                    }
                >
                    {player.losses}
                </a>
            );
        };

        const formattedTableData = sortedPlayers.map((player) => {
            return [
                player.team?.name || t(ln, "Team not found"),
                player.team?.members.map(
                    (member) => `${member.firstName} ${member.lastName}`
                ) || ["-", "-", "-", "-"],
                createAllGamesLink(player),
                {
                    wins: createWinsGamesLink(player),
                    ties: createDrawsGamesLink(player),
                    losses: createDefeatGamesLink(player),
                },
                player.averageMoveTime,
                player.contestScore,
            ];
        });
        setTableData(formattedTableData);
    };

    const formatAverageMoveTime = (time) => {
        const seconds = time / 1000;
        const int = Math.floor(seconds);
        const float = seconds.toString().split(".")[1].slice(0, 2);
        return `${int}${t(ln, "short_seconds")} ${float}${t(
            ln,
            "short_milliseconds"
        )}`;
    };

    let tableDataWithNormalMoveTime = null;
    if (tableData) {
        tableDataWithNormalMoveTime = tableData.map((data) => {
            if (typeof data[4] === "number") {
                const formattedTime = formatAverageMoveTime(data[4]);
                return [...data.slice(0, 4), formattedTime, ...data.slice(5)];
            } else {
                return [...data.slice(0, 4), " - ", ...data.slice(5)];
            }
        });
    }

    const tableHeads = [
        t(ln, "place"),
        t(ln, "team_name"),
        t(ln, "team_structure"),
        t(ln, "num_of_matches"),
        t(ln, "match_results"),
        t(ln, "average_move_time"),
        t(ln, "number_of_points"),
    ];
    const goToStatisticsPage = () => {
        navigate(ROUTES.TO_GENERAL_STATISTICS(query.id));
    };

    return (
        <Page className="leaders-page">
            <Header
                showDiscordButton={false}
                withButtons={true}
                customButton={
                    <Button
                        text={t(ln, "statistics_of_the_hackaton")}
                        paddingSize={paddingSizes.NORMAL}
                        style={buttonStyles.OUTLINE}
                        onClick={goToStatisticsPage}
                        className="leaders-page__to-stat-button"
                    />
                }
            />
            <div className="leaders-page__content">
                <h2>{t(ln, "leaderboard")}</h2>
                <div className="leaders-page__table-wrapper">
                    {!contestError.error ? (
                        <Table
                            accentAmount={3}
                            names={tableHeads}
                            rows={tableDataWithNormalMoveTime}
                            className="leaders-page__table"
                        />
                    ) : (
                        <div className="leaders-page__not-found-text">
                            {t(ln, contestError.text)}
                        </div>
                    )}
                </div>
            </div>
        </Page>
    );
};
