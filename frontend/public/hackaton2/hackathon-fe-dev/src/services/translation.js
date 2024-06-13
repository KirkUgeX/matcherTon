import en from "./translation/en.json";
import ua from "./translation/ua.json";

const t = (language, phrase) => {
    const translationFile = {
        en : en,
        ua : ua
    };
    switch (language) {
    case "ua":
        return translationFile.ua[phrase] || phrase;
    case "en":
        return translationFile.en[phrase] || phrase;
    default:
        return translationFile.ua[phrase] || phrase;
    }
};

export default t;
