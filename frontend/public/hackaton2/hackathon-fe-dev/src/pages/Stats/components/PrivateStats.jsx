import { useSelector } from "react-redux";
import "../../../assets/pages/Stats/private-stats.scss";
import t from "../../../services/translation";
import { Stat } from "./Stat";

export const PrivateStats = ({ stats }) => {
    const ln = useSelector((state) => state.language.currentLanguage);
    return (
        <div className="private-stats">
            <Stat className="private-stats__stat-item" name={t(ln, "number_of_points")} value={stats.points}/>
            <Stat className="private-stats__stat-item" name={t(ln, "number_of_games")} value={stats.games}/>
            <Stat className="private-stats__stat-item" name={t(ln, "number_of_wins")} value={stats.wins}/>
            <Stat className="private-stats__stat-item" name={t(ln, "number_of_draws")} value={stats.ties}/>
            <Stat className="private-stats__stat-item" name={t(ln, "umber_of_defeats")} value={stats.loses}/>
            { stats.averageTimeOfTurn
                ? <Stat className="private-stats__stat-item" name={t(ln, "average_move_time")} value={stats.averageTimeOfTurn}/>
                : null
            }
        </div>
    );
};
