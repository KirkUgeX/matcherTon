import "../../../assets/pages/Users/game-starting-section.scss";
import { Button } from "../../../components";
import classNames from "classnames";

export const GameStartingSection = ({ title, text, buttons, className }) => {
    const classes = classNames(
        "game-starting-section",
        className
    );

    const renderButtons = () => {
        return buttons.map(({ text, onClick, style, padding, className, disabled = false }) => {
            const classes = classNames(
                "game-starting-section__button",
                className
            );

            return <Button
                key={text}
                className={classes}
                text={text}
                paddingSize={padding}
                onClick={onClick}
                style={style}
                disabled={disabled}
            />;
        });
    };

    return (
        <div className={classes}>
            <h3 className="game-starting-section__title">{ title }</h3>
            <p className="game-starting-section__text">{ text }</p>
            <div className="game-starting-section__buttons-group">
                { renderButtons() }
            </div>
        </div>
    );
};
