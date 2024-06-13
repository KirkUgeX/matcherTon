import "../../../assets/pages/TeamCabinet/console-item.scss";
import classNames from "classnames";

export const ConsoleItemTypes = {
    ERROR: "error",
    WARNING: "warning",
    SUCCESS: "success",
    INFO: "info",
    LOADER: "loader"
};

export const ConsoleItem = ({ time, type, content }) => {

    const classes = classNames(
        "console-item",
        {
            "console-item--error": Boolean(type === ConsoleItemTypes.ERROR),
            "console-item--warning": Boolean(type === ConsoleItemTypes.WARNING),
            "console-item--success": Boolean(type === ConsoleItemTypes.SUCCESS),
            "console-item--info": Boolean(type === ConsoleItemTypes.INFO),
            "console-item--loader": Boolean(type === ConsoleItemTypes.LOADER),
        }
    );

    return (
        <div className={classes}>
            <div className="console-item__time">
                { time }
            </div>
            <div className="console-item__description">
                {content}
            </div>
        </div>
    );
};
