import { useEffect, useState } from "react";
import dayjs from "dayjs";

export const useTimeLeft = (date = "2022-12-06T16:00:00Z") => {
    const [finalString, setFinalString] = useState("");

    useEffect(() => {
        const interval = setInterval(() => {
            const finalDate = dayjs(date);
            const currentDate = dayjs();

            const days = finalDate.diff(currentDate, "d");
            const hours = finalDate.diff(currentDate, "h");

            const finalHours = hours - days * 24;

            if (days < 1) {
                const seconds = dayjs(date).diff(dayjs(), "s");
                const oneHour = 60 * 60; //seconds
                const hours = Math.floor(seconds / oneHour);

                const minutesInSeconds = seconds - (hours * oneHour);
                const minutes = Math.floor(minutesInSeconds / 60);

                const secondsInSeconds = seconds - (hours * oneHour) - (minutes * 60);
                setFinalString(`${hours}год ${minutes}хвил ${secondsInSeconds}сек`);
            } else {
                setFinalString(`${days}днів ${finalHours}годин`);
            }
        }, 1000);
        return () => {
            clearInterval(interval);
        };
    }, []);

    return finalString;
};
