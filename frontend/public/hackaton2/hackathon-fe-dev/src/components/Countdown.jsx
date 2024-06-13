import { useTimeLeft } from "../hooks/useTimeLeft";

export const Countdown = ({ finalDate = "2023-01-12T10:00:00Z" }) => {
    const countdown = useTimeLeft(finalDate);

    return (
        <span className="countdown">{ countdown }</span>
    );
};
