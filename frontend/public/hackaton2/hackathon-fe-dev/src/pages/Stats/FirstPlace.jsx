import { useEffect, useState } from "react";
import { StatsPage } from "./Stats";
import t from "../../services/translation";
import { useSelector } from "react-redux";
import { Button } from "../../components";
import { buttonStyles, paddingSizes } from "../../components/Button";
import { useNavigate, useParams } from "react-router-dom";
import { ROUTES } from "../../constants/routes";
import { getPlayerStats } from "../../services/stats";
import { toast } from "react-toastify";

export const FirstPlace = () => {
    const navigate = useNavigate();
    const [shortStats, setShortStats] = useState(null);
    const [teamInfo, setTeamInfo] = useState({ name: "", members: [] });
    const ln = useSelector((state) => state.language.currentLanguage);
    const query = useParams();
    const event = useSelector((state) => state.event.event);
    const [errorState, setErrorState] = useState(null);

    useEffect(() => {
        getTableData();
    }, []);

    const getTableData = async () => {
        let player;
        try {
            player = await getPlayerStats(1, query.id, event.id);
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

    const goToThirdBestPlayer = () => {
        navigate(ROUTES.TO_THIRD_BEST_PLAYER(query.id));
    };

    return (
        <StatsPage
            title={t(ln, "congratulations_to_the_winner")}
            name={teamInfo.name}
            team={teamInfo.members}
            shortStatistic={stats}
            error={errorState}
            adminButton={
                <Button
                    text={<span>{t(ln, "third_place_among_the_spectators")} <img src="/images/dropdown-arrow.svg" className="next-step__image"/></span>}
                    onClick={goToThirdBestPlayer}
                    className="next-step__button"
                    style={buttonStyles.SECONDARY}
                    paddingSize={paddingSizes.NORMAL}
                />
            }
        />
    );
};
