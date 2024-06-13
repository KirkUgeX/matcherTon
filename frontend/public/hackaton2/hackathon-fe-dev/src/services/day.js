import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

export const getKyivTime = (time, format) => {
    const date = dayjs(time);
    return date.tz("Europe/Kiev").format(format);
};
