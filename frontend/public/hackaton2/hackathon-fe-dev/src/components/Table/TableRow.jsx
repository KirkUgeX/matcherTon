import "../../assets/components/Table/table-row.scss";
import classNames from "classnames";
import { isValidElement, useState } from "react";

export const TableRow = ({ row, index, accent }) => {
    const [showTooltip, setShowTooltip] = useState(false);

    const renderTeam = (array) => {
        return (
            <div key={`team${index}`} className="table-cell table-cell--array">
                {array.map((item, i) => (
                    <span key={item + i} className="table-cell__item">
                        {item}
                    </span>
                ))}
            </div>
        );
    };

    const renderStats = (obj) => {
        return (
            <div key={`stats${index}`} className="table-cell table-cell--stats">
                <span className="table-cell__stat table-cell__wins">
                    {obj.wins}
                </span>
                <span className="table-cell__stat table-cell__ties">
                    {obj.ties}
                </span>
                <span className="table-cell__stat table-cell__losses">
                    {obj.losses}
                </span>
            </div>
        );
    };

    const renderBoolean = (item) => {
        if (item) {
            return (
                <div
                    key={`team${index}`}
                    className="table-cell table-cell--boolean"
                >
                    <img
                        className="table-cell__boolean-image"
                        src="/images/green_checkmark.svg"
                        alt="checkmark"
                    />
                </div>
            );
        }
        return (
            <div
                key={`team${index}`}
                className="table-cell table-cell--boolean"
            >
                <img
                    className="table-cell__boolean-image"
                    src="/images/red_cross.svg"
                    alt="red cross"
                />
            </div>
        );
    };

    const renderData = () => {
        return row.map((item, i) => {
            if (Array.isArray(item)) {
                return renderTeam(item);
            } else if (item && (Number.isInteger(item.wins) || isValidElement(item.wins))) {
                return renderStats(item);
            } else if (typeof item === "boolean") {
                return renderBoolean(item);
            }
            //render a plain value

            return (
                <div key={i} className="table-cell">
                    {item}
                </div>
            );
        });
    };

    const classes = classNames("table-row", { "table-row--accent": accent });

    const renderNumberDecoration = () => {
        if (row?.numberDecoration) {
            return (
                <img
                    className="table-row__number-decoration"
                    onMouseOver={() => setShowTooltip(true)}
                    src="/images/check-mark.svg"
                    alt="Капітан"
                    onMouseLeave={() => setShowTooltip(false)}
                />
            );
        }
        return null;
    };

    return (
        <div className={classes}>
            <div className="table-cell table-cell--place">
                {index + 1} {renderNumberDecoration()}
            </div>
            {renderData()}
        </div>
    );
};
