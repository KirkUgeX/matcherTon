import { useSelector } from "react-redux";
import t from "../../../services/translation";

export const GamePlayerCardPlayerNameLabel = ({ isTeam, playerNumber, isWinner }) => {
    const ln = useSelector((state) => state.language.currentLanguage);

    const getCrown = () => {
        if (isWinner) return <img className="crown" src="/images/crown.svg" alt="winner"/>;
        return null;
    };

    const getTeamLabel = () => {
        if (playerNumber === 1) {
            return <span className="player-name__label">{t(ln, "team")} { getCrown() }</span>;
        } else {
            return <span className="player-name__label">{ getCrown() } {t(ln, "team")}</span>;
        }
    };

    const getUserLabel = () => {
        if (playerNumber === 1) {
            return <span className="player-name__label">{t(ln, "player")} {playerNumber} { getCrown() }</span>;
        } else {
            return <span className="player-name__label">{ getCrown() } {t(ln, "player")} {playerNumber}</span>;
        }
    };


    return isTeam ? getTeamLabel() : getUserLabel();
};
