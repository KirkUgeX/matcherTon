// import "../../assets/pages/game.scss";
import classNames from "classnames";
import { useSelector } from "react-redux";
import t from "../../../services/translation";
import { GamePlayerCardPlayerNameLabel } from "./GamePlayerCardPlayerNameLabel";

export const GamePlayerCard = ({
    playerNumber,
    position,
    isActive,
    player,
    isWinner
}) => {
    if (!player) return null;
    const classes = classNames(
        "player-card",
        `player-card--${position}`,
        { "player-card--active": isActive }
    );
    const ln = useSelector((state) => state.language.currentLanguage);

    const createGameTeamCard = () => {
        return (
            <div className={classes}>
                <div className="player-card__team-name">
                    <GamePlayerCardPlayerNameLabel playerNumber={playerNumber} isTeam={true} isWinner={isWinner}/>
                    <span>
                        <strong>{player?.name}</strong>
                    </span>
                </div>
                <div className="player-card__team-players">
                    <span>{t(ln, "team_structure")}</span>
                    <span>
                        {player?.members.map((player) => (
                            <strong key={player?.id}>{ player.firstName } { player.lastName }</strong>
                        ))}
                    </span>
                </div>
            </div>
        );
    };


    const createGamePlayerCard = () => {
        return (
            <div className={classes}>
                <div className="player-card__player-name">
                    <GamePlayerCardPlayerNameLabel playerNumber={playerNumber} isTeam={false} isWinner={isWinner}/>
                    <span>
                        <strong>{player.name}</strong>
                    </span>
                </div>
                { player.points ?
                    <div className="player-card__points">
                        <span>{t(ln, "number_of_points")}</span>
                        <span>
                            <strong>{ player.points }</strong>
                        </span>
                    </div>
                    : null
                }
            </div>
        );
    };
    const isTeam = Boolean(player && player.members);
    return isTeam ? createGameTeamCard() : createGamePlayerCard();
};
