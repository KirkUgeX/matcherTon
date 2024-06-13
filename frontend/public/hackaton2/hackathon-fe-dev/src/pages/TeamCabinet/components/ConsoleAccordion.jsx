import { useState } from "react";
import "../../../assets/pages/TeamCabinet/console-accordion.scss";
import classNames from "classnames";

export const ConsoleAccordion = ({ title, children }) => {
    const [isOpen, setIsOpen] = useState(false);

    const classes = classNames("console-accordion", { consoleIsOpen: isOpen });

    const onClick = () => {
        setIsOpen(!isOpen);
    };

    return (
        <div className={classes}>
            <span
                className="console-accordion__title"
                onClick={() => onClick()}
            >
                {title}
            </span>
            {isOpen ? (
                <div className="console-accordion__content">{children}</div>
            ) : (
                ""
            )}
        </div>
    );
};
