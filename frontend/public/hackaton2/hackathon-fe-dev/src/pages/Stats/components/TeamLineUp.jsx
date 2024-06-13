import { useSelector } from "react-redux";
import "../../../assets/pages/Stats/team-line-up.scss";
import t from "../../../services/translation";

export const TeamLineUp = ({ members = ["first", "second", "third"] }) => {
    const ln = useSelector((state) => state.language.currentLanguage);

    const renderMembers = () => {
        return members.map(member => <div key={member} className="team-line-up__member">{member}</div>);
    };

    return (
        <div className="team-line-up">
            <div className="team-line-up__title">{t(ln, "team_structure")}</div>
            {renderMembers()}
        </div>
    );
};
