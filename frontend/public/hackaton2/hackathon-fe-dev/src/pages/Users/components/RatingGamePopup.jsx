import "../../../assets/pages/Users/rating-game-popup.scss";
import { Button, Loader, Popup } from "../../../components";
import { Transition } from "react-transition-group";
import { buttonStyles, paddingSizes } from "../../../components/Button";
import { useSelector } from "react-redux";
import t from "../../../services/translation";

export const RatingGamePopup = ({ show, onPopupClose }) => {
    const ln = useSelector((state) => state.language.currentLanguage);
    return (
        <Transition
            in={show}
            timeout={270}
            mountOnEnter
            unmountOnExit
        >
            {(state) => (
                <Popup
                    className={`rating-game-popup ${state}`}
                    show={true}
                    onPopupClose={onPopupClose}
                    onCloseButtonClick={onPopupClose}
                    showCloseButton={true}>

                    <h3 className="rating-game-popup__title">{t(ln, "searching_for_an_opponent_in_rating_game")}</h3>
                    <Loader className="rating-game-popup__loader"/>
                    <p className="rating-game-popup__text">{t(ln, "the_game_will_start_after_connecting_the_second_participant_to_the_lobby")}</p>
                    <Button
                        text={t(ln, "stop_searching")}
                        className="rating-game-popup__button"
                        style={buttonStyles.SECONDARY}
                        onClick={onPopupClose}
                        paddingSize={paddingSizes.BIG}
                    />

                </Popup>
            )}
        </Transition>
    );
};
