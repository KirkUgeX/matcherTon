import "../../assets/pages/NotFound/not-found.page.scss";
import { Page } from "../../components/Page";
import { Button } from "../../components";
import { buttonStyles, paddingSizes } from "../../components/Button";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../constants/routes";
import t from "../../services/translation";
import { useSelector } from "react-redux";

export const NotFound = () => {
    const navigate = useNavigate();

    const ln = useSelector((state) => state.language.currentLanguage);

    return (
        <Page className="not-found-page">
            <div className="not-found-page__container">
                <img className="not-found-page__image" src="/images/404.png" alt="UFO" />
                <p className="not-found-page__text">{t(ln, "something_went_wrong")}</p>
                <Button
                    text={t(ln, "to_main")}
                    className="not-found-page__button"
                    onClick={() => navigate(ROUTES.MAIN_PAGE)}
                    paddingSize={paddingSizes.BIG}
                    style={buttonStyles.PRIMARY}
                />
            </div>
        </Page>
    );
};
