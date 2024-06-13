import { Popup, Button } from "../../../components";
import classNames from "classnames";
import { Transition } from "react-transition-group";
import { useSelector } from "react-redux";
import t from "../../../services/translation";

export const EndGamePopup = ({
    show,
    onEndGameButtonClick,
    onContinueGameButtonClick,
    onPopupClose,
    className,
}) => {
    const classes = classNames(className);
    const ln = useSelector((state) => state.language.currentLanguage);
    return (
        <Transition in={show} timeout={270} mountOnEnter unmountOnExit>
            {(state) => (
                <Popup
                    show={show}
                    onPopupClose={onPopupClose}
                    className={classes + ` ${state}`}
                >
                    <div className="end-game-popup">
                        <h3 className="end-game-popup__title">
                            {t(ln, "are_you_sure_you_want_quit_the_game")}
                        </h3>
                        <span className="end-game-popup__text">
                            {t(ln, "in_this_case_you_will_be_credited")}
                            <strong>&nbsp;{t(ln, "technical_defeat")}</strong>
                        </span>
                        <div className="end-game-popup__buttons">
                            <Button
                                className="end-game-popup__end-game-button"
                                text={t(ln, "finish_the_game")}
                                style={"secondary"}
                                paddingSize={"big"}
                                onClick={onEndGameButtonClick}
                            />
                            <Button
                                className="end-game-popup__continue-game-button"
                                text={t(ln, "continue_the_game")}
                                paddingSize={"big"}
                                onClick={onContinueGameButtonClick}
                            />
                        </div>
                        <div className="end-game-popup__red-arrows">
                            <img src="images/popup-red_arrows.png" alt="" />
                        </div>
                        <div className="end-game-popup__blue-arrows">
                            <img src="images/popup-blue_arrows.png" alt="" />
                        </div>
                    </div>
                </Popup>
            )}
        </Transition>
    );
};
