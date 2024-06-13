import "../assets/components/common-rules.scss";
import { Button, buttonStyles, paddingSizes } from "./Button";
import { ROUTES } from "../constants/routes";
import { useNavigate } from "react-router-dom";
import classNames from "classnames";
import { useSelector } from "react-redux";
import t from "../services/translation";

export const CommonRules = ({ mode = "spectator", className }) => {
    const navigate = useNavigate();
    const ln = useSelector((state) => state.language.currentLanguage);

    const renderSubtext = () => {
        if (mode === "team") {
            return t(ln, "before_creating_your_own_ai");
        }
        return t(ln, "try_it_and_you_will_quickly_understand");
    };

    const classes = classNames("common-rules", className);

    return (
        <div className={classes}>
            <h3 className="common-rules__header">{t(ln, "general_rules")}</h3>
            <p className="common-rules__text">
                {t(ln, "classic_4_in_row_game_with_two_improvements")}
            </p>
            <p className="common-rules__text">
                <span>1.</span>{" "}
                {t(
                    ln,
                    "turn-based_game_for_two_move_limited_15_seconds"
                )}
            </p>
            <p className="common-rules__text">
                <span>2.</span> {t(ln, "board_has_9_columns_and_6_rows")}
            </p>
            <p className="common-rules__text">
                <span>3.</span> {t(ln, "each_move_the_player_chooses")}{" "}
                <span>{t(ln, "column")}</span>, {t(ln, "to_place_your_chip...")}
            </p>
            <p className="common-rules__text">
                <span>4.</span> {t(ln, "the_goal_is_to_place...")}
            </p>
            <p className="common-rules__text">
                <span>5.</span> {t(ln, "at_the_beginning_of")}{" "}
                <span>{t(ln, "each")}</span> {t(ln, "game")}{" "}
                <span>{t(ln, "random")}</span> {t(ln, "brick_blocks_1")}{" "}
                <span>{t(ln, "random1")}</span> {t(ln, "slot")}{" "}
                <span>{t(ln, "and_all_slots_below_it")}</span>.{" "}
                {t(ln, "brick_position_is_fixed_for_this_game")}.
            </p>
            <div className="common-rules__image-container">
                <img className="common-rules__image" src="/images/step_1.png" />
                <img className="common-rules__image" src="/images/step_2.png" />
                <img className="common-rules__image" src="/images/step_3.png" />
            </div>
            <p className="common-rules__text">{renderSubtext()}</p>
            <Button
                className="common-rules__button"
                text={t(ln, "play")}
                style={buttonStyles.PRIMARY}
                paddingSize={paddingSizes.BIG}
                onClick={() => navigate(ROUTES.USERS)}
            />
        </div>
    );
};
