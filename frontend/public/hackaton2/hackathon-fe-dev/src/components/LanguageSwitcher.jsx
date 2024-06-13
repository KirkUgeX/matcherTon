import { setLanguage } from "../redux/reducers/language";
import { useDispatch, useSelector } from "react-redux";
import "../assets/components/language-switcher.scss";

export const LanguageSwitcher = () => {
    const dispatch = useDispatch();
    const ln = useSelector((state) => state.language.currentLanguage);

    const switcherButtons = [
        {
            language: "ua",
            text: "UA",
            onClick: () => dispatch(setLanguage("ua")),
        },
        {
            language: "en",
            text: "EN",
            onClick: () => dispatch(setLanguage("en")),
        },
    ];

    const renderButtons = () => {
        return switcherButtons.map((button) => {
            const isActive = button.language === ln;
            const isActiveClass = isActive
                ? "language-switcher__button--active"
                : "";
            return (
                <button
                    key={button.language}
                    onClick={button.onClick}
                    className={"language-switcher__button " + isActiveClass}
                >
                    {button.text}
                </button>
            );
        });
    };

    return (
        <div className="language-switcher">
            {renderButtons()}
        </div>
    );
};
