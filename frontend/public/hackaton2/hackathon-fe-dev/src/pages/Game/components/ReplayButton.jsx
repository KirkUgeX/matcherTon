import classNames from "classnames";

export const ReplayButton = ({ imgSrc, onClick, className, disabled }) => {
    const classes = classNames(
        "replay-button",
        className
    );
    return (
        <button disabled={disabled} onClick={onClick} className={classes}>
            <img src={imgSrc} className="replay-button__img"/>
        </button>
    );
};
