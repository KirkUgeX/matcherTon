import { Popup, Button } from "../../../components";
import classNames from "classnames";
import { Fragment } from "react";
import { QUERY_PARAMS_VALUES } from "../../../constants/game";
import { Transition } from "react-transition-group";
import { useDispatch, useSelector } from "react-redux";
import t from "../../../services/translation";
import { ROUTES } from "../../../constants/routes";
import { useNavigate } from "react-router-dom";
import { TEAM_QUERY_PARAMS_VALUES } from "../../../constants/team";
import { setGameState } from "../../../redux/reducers/game";

export const WinnerGamePopup = ({
    show,
    winner,
    onMainPageButtonClick,
    onNewGameButtonClick,
    onPopupClose,
    isTie,
    className,
    from,
}) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const classes = classNames( className);
    const ln = useSelector((state) => state.language.currentLanguage);

    if (!show) return null;

    const goToTeamCabinetPage = () => {
        dispatch(setGameState(null));
        navigate(ROUTES.TO_TEAM_PAGE({ tab: TEAM_QUERY_PARAMS_VALUES.TESTING }));
    };
    const renderWinnerInfo = () => {
        const title = isTie
            ? <div className="winner-popup__winner-title winner-popup__winner-title--tie">{t(ln, "Draw")}</div>
            : <div className="winner-popup__winner-title">{t(ln, "Won")}</div>;

        return (
            <Fragment>
                { title }
                { !isTie ? <div className="winner-popup__winner-name">{ winner?.name }</div> : null }
            </Fragment>
        );
    };

    const renderButtons = () => {
        if (from === QUERY_PARAMS_VALUES.FROM_TEAM_CABINET) {
            return (
                <div className="winner-popup__buttons">
                    <Button
                        className="winner-popup__main-page-button"
                        text={t(ln, "to_the_team_room")}
                        paddingSize={"big"}
                        onClick={goToTeamCabinetPage}
                    />
                </div>
            );
        }

        return (
            <div className="winner-popup__buttons">
                <Button
                    className="winner-popup__main-page-button"
                    text={t(ln, "to_main")}
                    paddingSize={"big"}
                    onClick={onMainPageButtonClick}
                />
                <Button
                    className="winner-popup__new-game-button"
                    text={t(ln, "create_a_lobby")}
                    paddingSize={"big"}
                    onClick={onNewGameButtonClick}
                />
            </div>
        );
    };

    return (
        <Transition
            in={show}
            timeout={270}
            mountOnEnter
            unmountOnExit
        >
            {(state) => (
                <Popup show={show} onPopupClose={onPopupClose} className={classes + ` ${state}`}>
                    <div className="winner-popup">
                        <div className="winner-popup__image">
                            <img src="/images/stars.png" alt="" />
                        </div>
                        {renderWinnerInfo()}
                        { renderButtons() }
                        <div className="winner-popup__red-arrows">
                            <img src="/images/popup-red_arrows.png" alt="" />
                        </div>
                        <div className="winner-popup__blue-arrows">
                            <img src="/images/popup-blue_arrows.png" alt="" />
                        </div>
                    </div>
                </Popup>

            )}
        </Transition>
    );
};
