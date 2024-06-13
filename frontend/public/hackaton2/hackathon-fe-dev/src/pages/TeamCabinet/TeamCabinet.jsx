import { useEffect, useState } from "react";
import "../../assets/pages/TeamCabinet/team-cabinet.scss";
import { RulesTab } from "./tabs/Rules";
import { TestingTab } from "./tabs/Testing";
import { Header } from "../../components";
import { Tabs } from "./components/Tabs";
import { Page } from "../../components/Page";
import { useSelector } from "react-redux";
import { getAI } from "../../services/team";
import { toast } from "react-toastify";
import { AIGameHistory } from "./tabs/AIGamesHistory";
import { useSearchParams } from "react-router-dom";
import { TEAM_QUERY_PARAMS_VALUES } from "../../constants/team";
import t from "../../services/translation";

export const TeamCabinet = () => {
    const { teamId } = useSelector((state) => state.user);
    const ln = useSelector((state) => state.language.currentLanguage);
    const tabs = [
        {
            text: t(ln, "rules_of_the_game"),
            name: TEAM_QUERY_PARAMS_VALUES.RULES,
        },
        { text: t(ln, "AI_testing"), name: TEAM_QUERY_PARAMS_VALUES.TESTING },
        {
            text: t(ln, "AI_games_history"),
            name: TEAM_QUERY_PARAMS_VALUES.HISTORY,
        },
    ];
    const [ai, setAi] = useState("");
    const consoleOptions = useState([]);
    const [searchParams, setSearchParams] = useSearchParams();
    const [tab, setTab] = useState(searchParams.get("tab") || tabs[0].name);

    const getAi = async () => {
        const ai = await getAI();
        setAi(ai.url);
    };

    useEffect(() => {
        if (teamId !== 0) {
            getAi().catch((e) => {
                if (e.status === 404) {
                    toast(t(ln, "team_page_info"));
                    return;
                }
                toast(t(ln, "failed_to_load_AI_data"));
                // TODO Handle errors
            });
        }
    }, [teamId]);

    const setActiveTab = (tabName) => {
        setTab(tabName);
        setSearchParams({ tab: tabName });
    };

    return (
        <Page className="team-cabinet">
            <Header withCountdown={true} />
            <div className="main">
                <h1 className="team-cabinet__title">
                    {t(ln, "team_page_title")}
                </h1>

                <div className="tabs-container">
                    <Tabs
                        className="team-cabinet__tabs"
                        currentTab={tab}
                        tabs={tabs}
                        onTabClick={setActiveTab}
                    />
                </div>
                <div className="tabs-content">
                    {tab === TEAM_QUERY_PARAMS_VALUES.RULES ? (
                        <RulesTab />
                    ) : null}
                    {tab === TEAM_QUERY_PARAMS_VALUES.TESTING ? (
                        <TestingTab
                            console={consoleOptions}
                            ai={ai}
                            setAi={setAi}
                        />
                    ) : null}
                    {tab === TEAM_QUERY_PARAMS_VALUES.HISTORY ? (
                        <AIGameHistory />
                    ) : null}
                </div>
            </div>
        </Page>
    );
};
