import dayjs from "dayjs";
import { useSelector } from "react-redux";
import t from "../services/translation";
import "../assets/components/event-info.scss";

export const EventInfo = () => {
    const ln = useSelector((state) => state.language.currentLanguage);
    // const eventInfo = useSelector((state) => state.eventInfo.event);

    const { registrationEndsAt, registrationStartsAt, startsAt } = useSelector(
        (state) => state.event.event
    );

    const renderEventStartLine = () => {
        if (!startsAt) return null;

        return (
            <span>
                {t(ln, "start_the_event") +
                    dayjs(startsAt).format(" DD.MM.YYYY ") +
                    t(ln, "at") +
                    dayjs(startsAt).format(" HH:mm ") +
                    t(ln, "Kyiv_time")}
            </span>
        );
    };

    const renderRegistrationLine = () => {
        if (!registrationStartsAt || !registrationEndsAt)
            return null;

        return (
            <span>
                {t(ln, "start_registration") +
                    dayjs(registrationStartsAt).format(
                        " DD.MM.YYYY "
                    ) +
                    t(ln, "at") +
                    dayjs(registrationStartsAt).format(" HH:mm") +
                    ", " +
                    t(ln, "end_registration") +
                    dayjs(registrationEndsAt).format(" DD.MM.YYYY ") +
                    t(ln, "at") +
                    dayjs(registrationEndsAt).format(" HH:mm ")}
            </span>
        );
    };

    return (
        <div className="event-info">
            {renderEventStartLine()}
            {renderRegistrationLine()}
        </div>
    );
};
