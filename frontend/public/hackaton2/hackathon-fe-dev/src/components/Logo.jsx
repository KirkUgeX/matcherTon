import { useNavigate } from "react-router-dom";
import "../assets/components/logo.scss";
import { ROUTES } from "../constants/routes";
import { useSelector } from "react-redux";
import { Roles } from "../constants/roles";

export const Logo = () => {
    const navigate = useNavigate();
    const user = useSelector(state => state.user);
    const isTeamAdmin = () => {
        return Boolean(user.teamId && user.role === Roles.ADMIN);
    };

    const goToHomePage = () => {
        if (user.role === Roles.TEAM_MEMBER || isTeamAdmin()) {
            return navigate(ROUTES.TEAM);
        }
        return navigate(ROUTES.MAIN_PAGE);
    };

    return (
        <div className="logo" onClick={() => goToHomePage()}>
            <img src="/images/logo.png" />
        </div>
    );
};
