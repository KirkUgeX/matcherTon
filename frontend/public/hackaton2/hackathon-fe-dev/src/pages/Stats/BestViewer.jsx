import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import t from "../../services/translation";
import { StatsPage } from "./Stats";
import { Button } from "../../components";
import { buttonStyles, paddingSizes } from "../../components/Button";
import { useNavigate, useParams } from "react-router-dom";
import { ROUTES } from "../../constants/routes";
import { getHumansNames } from "../../services/humans";
import { humansStats } from "../../services/stats";

export const BestViewer = () => {
    const navigate = useNavigate();
    const [shortStats, setShortStats] = useState(null);
    const [playerInfo, setPlayerInfo] = useState({ name: "" });
    const ln = useSelector((state) => state.language.currentLanguage);
    const query = useParams();
    const [errorState, setErrorState] = useState(null);

    useEffect(() => {
        // getting information from the API
        getBestPlayerInfo()
            .catch(() => {
                toast(t(ln, "failed_to_load_team_data"));
                // Handle API Error
            });
    }, []);

    const getBestPlayerInfo = async () => {
        const sorting = "rating,desc";
        try {
            const humans = await humansStats({ pageNumber: 0, size: 1, sorting });
            const winner = humans.results[0];
            const humansNames = await getHumansNames([winner.parentId]);
            setPlayerInfo({ name: `${humansNames[0].firstName} ${humansNames[0].lastName}` });
            setShortStats({
                points: winner.rating || 0,
                games: winner.stats.totalGames,
                wins: winner.stats.wins,
                ties: winner.stats.ties,
                loses: winner.stats.loses,
            });
        } catch (e) {
            if (e?.status === 403) {
                setErrorState({ text: "wait_for_the_results" });
            } else if (e?.status === 404) {
                setErrorState({ text: "statistic_doesnt_exist" });
            } else {
                setErrorState({ text: "failed_to_retrieve_player_information" });
            }
        }
    };

    const goToGeneralStats = () => {
        navigate(ROUTES.TO_GENERAL_STATISTICS(query.id));
    };

    return (
        <StatsPage
            title={t(ln, "the_winner_among_the_spectators")}
            name={playerInfo.name}
            team={null}
            shortStatistic={shortStats}
            error={errorState}
            adminButton={
                <Button
                    text={<span>{t(ln, "general_statistics_of_the_hackathon")} <img src="/images/dropdown-arrow.svg" className="next-step__image"/></span>}
                    onClick={goToGeneralStats}
                    className="next-step__button"
                    style={buttonStyles.SECONDARY}
                    paddingSize={paddingSizes.NORMAL}
                />
            }
        />
    );
};
