import { Fragment, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import t from "../../services/translation";
import { StatsPage } from "./Stats";
import { Button } from "../../components";
import { buttonStyles, paddingSizes } from "../../components/Button";
import { useNavigate, useParams } from "react-router-dom";
import { ROUTES } from "../../constants/routes";
import { getContest, getContests } from "../../services/contest";
import { mainTeamsInfo } from "../../services/teams";
import { getPlayerStats } from "../../services/stats";

export const ThirdPlace = () => {
    const navigate = useNavigate();
    const [shortStats, setShortStats] = useState(null);
    const [teamInfo, setTeamInfo] = useState({ name: "", members: [] });
    const ln = useSelector((state) => state.language.currentLanguage);
    const event = useSelector((state) => state.event.event);
    const query = useParams();
    const [errorState, setErrorState] = useState(null);

    useEffect(() => {
        getTableData();
    }, []);

    const getTableData = async () => {
        let player;
        try {
            player = await getPlayerStats(3, query.id, event.id);
        } catch (e) {
            if (e?.status === 403) {
                setErrorState({ text: "wait_for_the_results" });
            } else if (e?.status === 404) {
                setErrorState({ text: "statistic_doesnt_exist" });
            } else {
                setErrorState({ text: "failed_to_load_team_data" });
            }
            return;
        }

        setTeamInfo({
            name: player.team.name,
            members: player.team.members.map((member) => `${member.firstName} ${member.lastName}`),
        });
        setShortStats({
            points: player.contestScore,
            games: player.wins + player.ties + player.losses,
            wins: player.wins,
            ties: player.ties,
            loses: player.losses,
            averageTimeOfTurn: player.averageMoveTime
        });

    };

    const goToSecondPlace = () => {
        navigate(ROUTES.TO_SECOND_PLACE(query.id));
    };

    const formatAverageMoveTime = (time) => {
        if (typeof time !== "number") return "-";
        const seconds = time / 1000;
        const int = Math.floor(seconds);
        const float = seconds.toString().split(".")[1].slice(0, 2);
        return `${int}${t(ln, "short_seconds")} ${float}${t(ln, "short_milliseconds")}`;
    };
    let stats = null;
    if (shortStats) {
        stats = {
            ...shortStats,
            averageTimeOfTurn: formatAverageMoveTime(shortStats.averageTimeOfTurn)
        };
    }

    return (
        <Fragment>
            <StatsPage
                title={t(ln, "third_place") + "!"}
                name={teamInfo.name}
                team={teamInfo.members}
                shortStatistic={stats}
                error={errorState}
                adminButton={
                    <Button
                        text={<span>{t(ln, "second_place")} <img src="/images/dropdown-arrow.svg" className="next-step__image"/></span>}
                        onClick={goToSecondPlace}
                        className="next-step__button"
                        style={buttonStyles.SECONDARY}
                        paddingSize={paddingSizes.NORMAL}
                    />
                }
            />
        </Fragment>
    );
};
