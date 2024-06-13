import { Button, buttonStyles, paddingSizes } from "./Button";
import { Fragment } from "react";
import t from "../services/translation";
import { useSelector } from "react-redux";
import classNames from "classnames";
import { useNavigate } from "react-router-dom";

export const DiscordButton = ({ className }) => {
    const ln = useSelector((state) => state.language.currentLanguage);
    const { platformLink } = useSelector((state) => state.event.event);
    const classes = classNames("button__discord-logo", className);

    return (
        <Button
            className={classes}
            text={
                <Fragment>
                    <img
                        className="button__discord-logo"
                        src="/images/Discord.svg"
                    />
                    {t(ln, "join_Discord")}
                </Fragment>
            }
            style={buttonStyles.DISCORD}
            paddingSize={paddingSizes.BIG}
            onClick={() => {
                window.open(platformLink, "_blank");
            }}
        />
    );
};
