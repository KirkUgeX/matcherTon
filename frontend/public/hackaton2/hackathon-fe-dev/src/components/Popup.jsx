import "../assets/components/popup.scss";
import { useRef } from "react";
import classNames from "classnames";

export const Popup = ({ children, show, onPopupClose, className, showCloseButton, onCloseButtonClick }) => {
    if (!show) return;

    const contentRef = useRef(null);

    const onPopupClick = (e) => {
        if (!contentRef.current.contains(e.target)) {
            onPopupClose();
        }
    };

    const classes = classNames(
        "popup",
        className
    );

    return (
        <div className={classes} onClick={onPopupClick}>
            <div className="popup__content" ref={contentRef}>
                { children }
                { showCloseButton ? <div className="close-button" onClick={onCloseButtonClick}>
                    <img src="/images/cross.svg" alt="close"/>
                </div> : null }
            </div>
        </div>
    );
};
