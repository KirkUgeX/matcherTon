import "../../../assets/pages/TeamCabinet/rules-tab.scss";
import { CommonRules } from "../../../components/CommonRules";
import { TeamRules } from "../components/TeamRules";

export const RulesTab = () => {
    return (
        <div className="team-cabinet__tab rules-tab">
            <div className="rules-tab__column rules-tab__rules">
                <CommonRules/>
            </div>
            <div className="rules-tab__column rules-tab__image-container">
                <TeamRules/>
            </div>
        </div>
    );
};
