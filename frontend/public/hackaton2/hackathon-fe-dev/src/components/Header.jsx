import { Logo } from "./Logo";
import "../assets/components/header.scss";
import { Button, buttonStyles } from "./Button";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../constants/routes";
import { Countdown } from "./Countdown";
import { FlipClockTimer } from "./FlipClockTimer";
import { DiscordButton } from "./DiscordButton";
import { LanguageSwitcher } from "./LanguageSwitcher";
import t from "../services/translation";
import { useSelector } from "react-redux";
import { Dropdown } from "../pages/UserMain/components/Dropdown";
import dayjs from "dayjs";
import { getKyivTime } from "../services/day";

export const Header = ({
    withCountdown = false,
    withButtons = false,
    customButton = null,
    showDiscordButton = true,
    showDropdown = true,
}) => {
    const navigate = useNavigate();
    const ln = useSelector((state) => state.language.currentLanguage);
    const { contest } = useSelector((state) => state.contest);

    const goToUsersPage = () => {
        navigate(ROUTES.USERS);
    };

    const goToLeadersPage = (id) => {
        navigate(ROUTES.LEADERS.TO_PAGE(id));
    };

    const getContestOptions = () => {
        return contest.map((item) => {
            const createdAtMilliseconds = item.createdAt.toString(10) + "000";
            const date = getKyivTime(
                +createdAtMilliseconds,
                "DD.MM.YYYY HH.mm"
            );
            return {
                id: item.id,
                date: date,
                onClick: (id) => goToLeadersPage(id),
            };
        });
    };

    const renderDropdown = () => {
        return contest.length && showDropdown ? (
            <Dropdown options={getContestOptions()} />
        ) : null;
    };

    return (
        <div className="header">
            <div className="header__navigation">
                <Logo />
                <LanguageSwitcher />
            </div>
            <div className="header__widgets">
                {renderDropdown()}
                {showDiscordButton ? <DiscordButton /> : null}
                {customButton}
                {withButtons ? (
                    <Button text={t(ln, "play")} onClick={goToUsersPage} />
                ) : null}
            </div>
        </div>
    );
};
