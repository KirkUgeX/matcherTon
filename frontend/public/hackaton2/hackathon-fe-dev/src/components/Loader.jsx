import "../assets/components/loader.scss";
import classNames from "classnames";

export const Loader = ({ className }) => {
    const classes = classNames(
        "loader",
        className
    );

    return (
        <div className={ classes }></div>
    );
};
