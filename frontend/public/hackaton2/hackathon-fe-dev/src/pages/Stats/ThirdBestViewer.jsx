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

export const ThirdBestViewer = () => {
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
            const humans = await humansStats({ pageNumber: 0, size: 3, sorting });
            const winner = humans.results[2];
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

    const goToSecondBestPlayer = () => {
        navigate(ROUTES.TO_SECOND_BEST_PLAYER(query.id));
    };

    return (
        <StatsPage
            title={t(ln, "third_place_among_the_spectators")}
            name={playerInfo.name}
            team={null}
            shortStatistic={shortStats}
            error={errorState}
            adminButton={
                <Button
                    text={<span>{t(ln, "second_place_among_the_spectators")} <img src="/images/dropdown-arrow.svg" className="next-step__image"/></span>}
                    onClick={goToSecondBestPlayer}
                    className="next-step__button"
                    style={buttonStyles.SECONDARY}
                    paddingSize={paddingSizes.NORMAL}
                />
            }
        />
    );
};
