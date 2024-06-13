import { useSelector } from "react-redux";
import "../../../assets/pages/Stats/general-statistics.scss";
import t from "../../../services/translation";
import { Stat } from "./Stat";

export const GeneralStatistics = ({ stats }) => {
    const ln = useSelector((state) => state.language.currentLanguage);

    const firstColumnStats = [
        { name: t(ln, "first_place"), value: stats.firstPlace },
        { name: t(ln, "second_place"), value: stats.secondPlace },
        { name: t(ln, "third_place"), value: stats.thirdPlace },
        { name: t(ln, "the_winner_among_the_spectators"), value: stats.bestPlayer },
        { name: t(ln, "the_team_with_the_best_running_time"), value: stats.bestMoveTimeTeam },
        { name: t(ln, "the_team_with_the_most_draws"), value: stats.bestTeamByDraws },
        { name: t(ln, "the_team_with_the_best_winning_ratio"), value: stats.bestTeamByWins }
    ];

    const secondColumnStats = [
        { name: t(ln, "total_number_of_teams"), value: stats.teamsAmount },
        { name: t(ln, "the_total_number_of_participants_in_the_game"), value: stats.teamMembersCount },
        { name: t(ln, "total_number_of_games"), value: stats.gamesCount },
        { name: t(ln, "the_number_of_games_at_the_testing_stage"), value: stats.testGamesCount },
        { name: t(ln, "number_of_spectators"), value: 225 },
        { name: t(ln, "number_of_games_among_the_spectators"), value: 1617 },
        { name: t(ln, "number_of_spectators_wins"), value: 1595 },
        { name: t(ln, "number_of_draws_among_the_spectators"), value: 22 },
        { name: t(ln, "the_maximum_score_among_the_spectators"), value: stats.humanMaxRating },
    ];

    const renderStats = (stats) => {
        return stats.map((stat) => {
            return <Stat key={stat.name} value={stat.value} name={stat.name}/>;
        });
    };

    return (
        <div className="general-statistics">
            <div className="general-statistics__column">
                { renderStats(firstColumnStats) }
            </div>
            <div className="general-statistics__column">
                { renderStats(secondColumnStats) }
            </div>
        </div>
    );
};
