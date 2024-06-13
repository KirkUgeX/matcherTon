import "../../../assets/pages/UserMain/dropdown.scss";
import { useState } from "react";
import { Transition } from "react-transition-group";
import t from "../../../services/translation";
import { useSelector } from "react-redux";

export const Dropdown = ({ options }) => {
    const [open, setOpen] = useState(false);
    const ln = useSelector(state => state.language.currentLanguage);

    const renderOptions = () => {
        return options.map((item, i) => {
            return (
                <div key={i} className="option" onClick={() => item.onClick(item.id)}>
                    <span className="option__text">{ item.date }</span>
                    <span className="option__link">{t(ln, "open")}</span>
                </div>
            );
        });
    };

    const renderList = () => (
        <Transition in={open} timeout={270} mountOnEnter unmountOnExit>
            {(state) => (
                <div className={`dropdown__options options ${state}`}>
                    <div className="options__title">
                        { t(ln, "contest_end_time") }
                    </div>
                    <div className="options__list">
                        { renderOptions() }
                    </div>
                </div>
            )}
        </Transition>
    );

    return (
        <div className="dropdown">
            <div className="dropdown__title" onClick={() =>setOpen(state => !state)}>
                <img className="clock-icon" src="/images/clocks.svg" alt="clocks"/>
                { t(ln, "contents_history") }
                <img className={`arrow-icon ${!open ? "arrow-icon--down" : ""}`} src="/images/dropdown-arrow.svg" alt="arrow"/>
            </div>
            { renderList() }
        </div>
    );
};
