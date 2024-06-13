import "../../../assets/pages/Stats/stat.scss";
import classNames from "classnames";

export const Stat = ({ className, name, value }) => {
    const classes = classNames(
        "stat",
        className
    );

    return (
        <div className={classes}>
            <div className="stat__name">{name}</div>
            <div className="stat__value">{value}</div>
        </div>
    );
};
