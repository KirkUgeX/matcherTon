import "../../../assets/components/with-code-popup.scss";
import { useEffect, useState } from "react";
import { Popup, Loader } from "../../../components";
import classNames from "classnames";
import CopyTooltip from "./CopyTooltip";
import { Transition } from "react-transition-group";
import { toast } from "react-toastify";
import t from "../../../services/translation";
import { useSelector } from "react-redux";

export const WithCodePopup = ({
    show,
    code,
    onPopupClose,
    className,
    title = "send_the_invitation_code_to_the_player"
}) => {
    const [isTooltipShow, setIsTooltipShow] = useState(false);
    const [isTooltipCopied, setIsTooltipCopied] = useState(false);
    const [countdown, setCountdown] = useState(45);
    const ln = useSelector((state) => state.language.currentLanguage);

    useEffect(() => {
        if (show) {
            const interval = setInterval(() => {
                setCountdown((current) => current - 1);
            }, 1000);
            return () => {
                clearInterval(interval);
                setCountdown(45);
            };
        }
    }, [show]);

    useEffect(() => {
        if (countdown <= 0) {
            toast(t(ln, "the_lobby_has_expired"));
            onPopupClose();
        }
    }, [countdown]);

    const classes = classNames("with-code-popup", className);

    const onImageClickHandler = () => {
        navigator.clipboard.writeText(code);
        setIsTooltipCopied(true);
    };

    const onMouseOverTooltip = () => {
        setIsTooltipShow(true);
    };

    const onMouseLeaveTooltip = () => {
        setIsTooltipShow(false);
        setIsTooltipCopied(false);
    };

    const renderCountdown = () => {
        if (countdown < 10) {
            return `0:0${countdown}`;
        }
        return `0:${countdown}`;
    };

    return (
        <Transition in={show} timeout={270} mountOnEnter unmountOnExit>
            {(state) => (
                <Popup
                    onCloseButtonClick={onPopupClose}
                    className={`${classes} ${state}`}
                    show={true}
                    onPopupClose={onPopupClose}
                    showCloseButton={true}
                >
                    <h3 className="popup__title">
                        {t(ln, title)}
                    </h3>
                    {code ? (
                        <div className="popup__code">
                            {code}{" "}
                            <img
                                className="with-code-popup__image"
                                onClick={onImageClickHandler}
                                src="/images/union.svg"
                                alt="copy"
                                onMouseOver={onMouseOverTooltip}
                                onMouseLeave={onMouseLeaveTooltip}
                            />
                            <CopyTooltip
                                isShow={isTooltipShow}
                                copied={isTooltipCopied}
                                className={"with-code-popup__tooltip"}
                            ></CopyTooltip>
                        </div>
                    ) : null}
                    <div className="popup__countdown">
                        <div className="with-code-popup__countdown">
                            {renderCountdown()}
                        </div>
                    </div>
                    <div className="popup__note">
                        {t(ln, "the_game_will_start_after_connecting_the_second_participant_to_the_lobby")}
                    </div>
                </Popup>
            )}
        </Transition>
    );
};
