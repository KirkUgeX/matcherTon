import classNames from "classnames";
import { useRef } from "react";
import { useSelector } from "react-redux";
import "../assets/components/refresh.scss";
import t from "../services/translation";

export const Refresh = ({ onRefresh, className }) => {
    const classes = classNames("refresh", className);
    const refreshIcon = useRef(null);
    const ln = useSelector((state) => state.language.currentLanguage);

    const onClick = () => {
        refreshIcon.current.classList.add("rotate");
        setTimeout(() => {
            refreshIcon.current.classList.remove("rotate");
        }, 1000);
        onRefresh();
    };

    return (
        <div className={classes} onClick={onClick}>
            <img src="/images/refresh.svg" alt="o" ref={refreshIcon} />
            <span>{t(ln, "refresh")}</span>
        </div>
    );
};
