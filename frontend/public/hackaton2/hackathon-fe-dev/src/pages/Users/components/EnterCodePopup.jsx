import { Button, Loader, Popup } from "../../../components";
import { useEffect, useState } from "react";
import { buttonStyles, paddingSizes } from "../../../components/Button";
import { Input } from "../../../components/Input";
import classNames from "classnames";
import { Transition } from "react-transition-group";
import { useSelector } from "react-redux";
import t from "../../../services/translation";

export const EnterCodePopup = ({
    show,
    onPopupClose,
    onButtonClick,
    className,
    isConnecting
}) => {
    const [code, setCode] = useState("");
    const ln = useSelector((state) => state.language.currentLanguage);

    const classes = classNames("enter-code-popup", className);

    const onSubmit = (e) => {
        e && e.preventDefault();
        onButtonClick(code);
    };

    return (
        <Transition in={show} timeout={270} mountOnEnter unmountOnExit>
            {(state) => (
                <Popup
                    onCloseButtonClick={onPopupClose}
                    className={classes + ` ${state}`}
                    show={show}
                    onPopupClose={onPopupClose}
                    showCloseButton={true}
                >
                    <form
                        className="enter-code-popup__form"
                        onSubmit={onSubmit}
                    >
                        <h3 className="popup__title">
                            {t(ln, "join_the_lobby")}
                        </h3>
                        <Input
                            label={t(ln, "enter_the_invitation_code")}
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            placeholder="7693"
                            type="text"
                            className="enter-code-popup__input"
                        />
                        <Button
                            type="submit"
                            onClick={onSubmit}
                            disabled={code.length !== 4}
                            className="enter-code-popup__button"
                            paddingSize={paddingSizes.BIG}
                            text={t(ln, "join")}
                            style={buttonStyles.PRIMARY}
                        />
                    </form>
                    { isConnecting
                        ? <div className="loader-container"><Loader className="enter-code-popup__loader"/></div>
                        : null
                    }
                </Popup>
            )}
        </Transition>
    );
};
