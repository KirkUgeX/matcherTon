import "../assets/components/button.scss";
import classNames from "classnames";

export const buttonStyles = {
    PRIMARY: "primary",
    SECONDARY: "secondary",
    OUTLINE: "outline",
    DISCORD: "discord"
};

export const paddingSizes = {
    BIG: "big",
    NORMAL: "normal",
    HUGE: "huge"
};

export const Button = ({ type = "button", style = buttonStyles.PRIMARY, onClick, text, paddingSize = paddingSizes.NORMAL, className = "", disabled = false }) => {
    const classes = classNames(
        "button",
        `button--${style}`,
        `button--size-${paddingSize}`,
        disabled && "button--disabled",
        className
    );
    return (
        <button disabled={disabled} type={type} className={classes} onClick={onClick}>{text}</button>
    );
};
