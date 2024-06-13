import "../assets/components/input.scss";
import classNames from "classnames";

export const Input = ({ className, label, value, type, placeholder, onChange, successful }) => {
    const classes = classNames(
        "input__container",
        { "input__container--successful": successful },
        className
    );
    return (
        <label className={classes}>
            <span className="input__label">{ label }</span>
            <input type={type} value={value} onChange={onChange} placeholder={placeholder} className="input"/>
        </label>

    );
};
