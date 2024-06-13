import React from "react";
import { Tooltip } from "../../../components";
import "../../../assets/pages/Users/copy-tooltip.scss";
import t from "../../../services/translation";
import { useSelector } from "react-redux";

function CopyTooltip({ isShow, copied = true, className }) {
    const ln = useSelector((state) => state.language.currentLanguage);

    const noCopiedTooltipContent = () => {
        return <div>{t(ln, "copy")}</div>;
    };

    const copiedTooltipContent = () => {
        return <div>{t(ln, "copied")}</div>;
    };

    return (
        <Tooltip isShow={isShow} className={copied ? " copy-tooltip copy-tooltip--copied" : "copy-tooltip" }>
            {copied ? copiedTooltipContent() : noCopiedTooltipContent()}
        </Tooltip>
    );
}

export default CopyTooltip;
