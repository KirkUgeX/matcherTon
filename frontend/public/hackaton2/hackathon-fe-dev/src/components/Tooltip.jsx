import "../assets/components/tooltip.scss";
import { useRef } from "react";
import classNames from "classnames";

export const Tooltip = ({ children, className, isShow, bottomBadge = false }) => {
    if (!isShow) return;

    const classes = classNames(
        "tooltip",
        { "tooltip--bottom": bottomBadge },
        className
    );

    return (
        <div className={classes}>
            <div className="tooltip__content">{children}</div>
        </div>
    );
};
