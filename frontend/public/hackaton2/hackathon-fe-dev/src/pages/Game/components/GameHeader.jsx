import { Button, Header } from "../../../components";
import { QUERY_PARAMS, QUERY_PARAMS_VALUES } from "../../../constants/game";
import { ROUTES } from "../../../constants/routes";
import { buttonStyles, paddingSizes } from "../../../components/Button";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
    TEAM_QUERY_PARAMS,
    TEAM_QUERY_PARAMS_VALUES,
} from "../../../constants/team";
import t from "../../../services/translation";
import { setGameState } from "../../../redux/reducers/game";

export const GameHeader = ({ isReplay }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const ln = useSelector((state) => state.language.currentLanguage);

    const onCustomButtonClick = () => {
        dispatch(setGameState(null));
        const from = searchParams.get(QUERY_PARAMS.FROM);
        const teamQueryParams = `${TEAM_QUERY_PARAMS.TAB}=${TEAM_QUERY_PARAMS_VALUES.HISTORY}`;

        if (from === QUERY_PARAMS_VALUES.FROM_GAME_HISTORY) {
            return navigate(ROUTES.TO_TEAM_PAGE(teamQueryParams));
        }
        if (from === QUERY_PARAMS_VALUES.FROM_CONTEST_HISTORY) {
            return navigate(ROUTES.CONTEST_HISTORY.TO_PAGE(searchParams.get("id"), searchParams.get("teamId")));
        }
        return navigate(ROUTES.USERS);
    };

    const renderCustomHeaderButton = () => {
        if (!isReplay) return null;

        const from = searchParams.get(QUERY_PARAMS.FROM);
        const text =
            from === QUERY_PARAMS_VALUES.FROM_GAME_HISTORY || QUERY_PARAMS_VALUES.FROM_CONTEST_HISTORY
                ? t(ln, "return_to_the_history_of_games")
                : t(ln, "go_back_to_creating_a_lobby");
        return (
            <Button
                onClick={onCustomButtonClick}
                style={buttonStyles.PRIMARY}
                paddingSize={paddingSizes.BIG}
                text={text}
            />
        );
    };

    return (
        <Header
            withCountdown={true}
            showDiscordButton={false}
            customButton={renderCustomHeaderButton()}
        />
    );
};
