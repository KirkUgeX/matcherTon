import { Logo } from "../../components";
import "../../assets/pages/Login/login.scss";
import { useEffect } from "react";
import { getGoogleClientId } from "../../services/env";
import { Navigate, useNavigate } from "react-router-dom";
import { ROUTES } from "../../constants/routes";
import { Page } from "../../components/Page";
import { isAdmin, isTeamMember, isUser, login } from "../../services/auth";
import { useDispatch, useSelector } from "react-redux";
import { setUser } from "../../redux/reducers/user";
import { getGameConfig } from "../../services/game";
import { setMoveTimeLimit } from "../../redux/reducers/app";
import { FlipClockTimer } from "../../components/FlipClockTimer";
import { EventInfo } from "../../components/EventInfo";
import { LanguageSwitcher } from "../../components/LanguageSwitcher";
import t from "../../services/translation";

export const Login = () => {
    const { id, role } = useSelector((state) => state.user);
    const dispatch = useDispatch();
    const ln = useSelector((state) => state.language.currentLanguage);
    const { startsAt } = useSelector((state) => state.event.event);

    /* global google */

    useEffect(() => {
        google.accounts.id.initialize({
            client_id: getGoogleClientId(),
            callback: handleCallbackResponse,
        });

        google.accounts.id.renderButton(
            document.getElementById("googleSignIn"),
            {
                theme: "filled_blue",
                size: "large",
                text: "signin",
                logo_alignment: "left",
                locale: "uk_UA",
            }
        );

        // google.accounts.id.prompt();
    }, []);

    const handleCallbackResponse = async (response) => {
        const googleToken = response.credential;
        const user = await login(googleToken); //id, role, teamId
        const initData = await getGameConfig();
        dispatch(setMoveTimeLimit(initData.moveTimeLimit / 1000));
        if (user) {
            dispatch(setUser(user));
        }
    };
    if (id !== 0 && isUser(role)) {
        return <Navigate to={ROUTES.MAIN_PAGE} />;
    } else if (id !== 0 && isTeamMember(role)) {
        return <Navigate to={ROUTES.TEAM} />;
    } else if (id !== 0 && isAdmin(role)) {
        return <Navigate to={ROUTES.MAIN_PAGE} />;
    }

    return (
        <Page className="login-page">
            <img
                className="login-page__blue-arrows"
                src="/images/wide_blue_arrows.png"
                alt="Blue arrows"
            />
            <img
                className="login-page__orange-arrows"
                src="/images/wide_orange_arrows.png"
                alt="Orange arrows"
            />

            <main className="login-page__content">
                <div className="login-page__main-content">
                    <h1 className="login-page__title">
                        {t(ln, "welcome_to_epic_competition")}
                    </h1>
                    <div id="googleSignIn"></div>
                    <LanguageSwitcher />
                </div>

                <EventInfo />
            </main>
        </Page>
    );
};
