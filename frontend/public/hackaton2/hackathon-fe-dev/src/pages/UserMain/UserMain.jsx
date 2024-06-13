import "../../assets/pages/UserMain/user-main.scss";
import { Header, Table, Tooltip } from "../../components";
import { CommonRules } from "../../components/CommonRules";
import { Page } from "../../components/Page";
import { useEffect, useState } from "react";
import { mainTeamsInfo } from "../../services/teams";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import t from "../../services/translation";

export const UserMain = () => {
    const event = useSelector(state => state.event.event);
    const [tableData, setTableData] = useState(null);
    const [showTooltip, setShowTooltip] = useState(false);
    const ln = useSelector((state) => state.language.currentLanguage);

    useEffect(() => {
        if (event.id) {
            getTableData()
                .catch(() => {
                    toast(t(ln, "failed_load_table_data"));
                    // TODO Handle Errors
                });
        }
    }, [event.id]);

    const getTableData = async () => {
        const teams = await mainTeamsInfo(event.id);
        const tableDate = teams.map((item) => {
            const members = item.members.map(member => `${member.firstName} ${member.lastName}`);
            const team = [item.name, members, item.testsPassed];
            return team;
        });
        setTableData(tableDate);
    };

    const tableHeads = [
        t(ln, "place"),
        t(ln, "team_name"),
        t(ln, "team_structure"),
        <span className="user-main-table__ai-state" key="ai_state">
            { t(ln, "ai_state") }
            <img
                onMouseOver={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
                className="user-main-table__ai-state-image"
                src="/images/information.svg"
                alt="information"/>
            <Tooltip className="user-main-table__ai-state-tooltip" bottomBadge={true} isShow={showTooltip}>{t(ln, "can_team_ai_participate")}</Tooltip>
        </span>,
    ];

    return (
        <Page className="user-main">
            <Header withCountdown={true}/>
            <div className="user-main__content">
                <div className="user-main__rules-part rules-part user-main__column">
                    <h3 className="user-main__column-title">{t(ln, "rules_of_the_game")}</h3>
                    <CommonRules className="user-main__common-rules"/>
                </div>
                <div className="user-main__teams-table user-main__column">
                    <h3 className="user-main__column-title">{t(ln, "teams_table")}</h3>
                    <Table rows={tableData} names={tableHeads} className="user-main__table"/>
                </div>
            </div>
        </Page>
    );
};
