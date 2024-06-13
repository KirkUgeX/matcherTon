import "../../../assets/pages/TeamCabinet/team-rules.scss";
import "../../../assets/components/code-container.scss";
import t from "../../../services/translation";
import { useSelector } from "react-redux";

export const TeamRules = () => {
    const ln = useSelector((state) => state.language.currentLanguage);

    const firstCodeChunk = `POST /move
{
    "gameId": "12345", --- # ${t(ln, "game_ID")}
    "board": [ --- # 6 x 9 2D-${t(ln, "array")}
    [_,_,_,_,_,_,_,_,_], --- # _ - ${t(ln, "empty_slots")}
    [_,_,_,x,_,_,_,_,_], --- # x - ${t(ln, "the_slots_are_blocked_with_bricks")}
    [_,_,_,x,_,_,_,_,_], --- # F - ${t(ln, "first_player_slots")}
    [_,_,_,x,_,_,_,_,_], --- # S - ${t(ln, "second_player_slots")}
    [S,F,_,x,_,F,_,_,_],
    [F,S,S,x,_,F,F,S,S],
    ],
    "player": "F", --- # "F" ${t(ln, "or")} "S"
}`;

    const secondCodeChunk = `{
    "column": 2 --- # 0-8
}`;
    return (
        <div className="team-rules">
            <h3 className="team-rules__header">
                {t(ln, "rules_for_the_team")}
            </h3>
            <p className="team-rules__text">
                {t(ln, "real_AI_is_service_provided_by_an_endpoint")}
                <b>&quot;{t(ln, "make_a_move")}&quot;</b>.{" "}
                {t(ln, "the_C4_engine_will_call_it_when_its_the_AIs_turn")}
            </p>
            <span className="team-rules__code-title">{t(ln, "sample_request")}:</span>
            <pre>{firstCodeChunk}</pre>
            <p className="team-rules__text">
                {t(ln,"your_task_is_to_choose_the_column_to_which_you_will_place_the_shape")}
            </p>
            <span className="team-rules__code-title">{t(ln, "sample_answer")}:</span>
            <pre>{secondCodeChunk}</pre>
            <p className="team-rules__text">
                {t(ln, "note_that_the_number_of_columns_starts_at_0")}.
            </p>
            <p className="team-rules__text team-rules__text--warning">
                { t(ln, "100_concurrent_requests") }
            </p>
        </div>
    );
};
