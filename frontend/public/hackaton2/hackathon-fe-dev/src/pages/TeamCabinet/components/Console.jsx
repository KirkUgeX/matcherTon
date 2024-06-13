import "../../../assets/pages/TeamCabinet/console.scss";
import classNames from "classnames";
import { ConsoleItem, ConsoleItemTypes } from "./ConsoleItem";

export const Console = ({ className, items }) => {
    const classes = classNames("console", className);

    const renderItems = () => {
        return items.map((item, i) => {
            return <ConsoleItem key={`${i}${item.content}`} {...item} />;
        });
    };

    return <div className={classes}>{renderItems()}</div>;
};
