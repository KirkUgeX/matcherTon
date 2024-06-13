import "../../assets/pages/Stats/stats.scss";
import { Header, Loader } from "../../components";
import { TeamLineUp } from "./components/TeamLineUp";
import { PrivateStats } from "./components/PrivateStats";
import { GeneralStatistics } from "./components/GeneralStatistics";
import { Fragment } from "react";
import { Page } from "../../components/Page";
import { useSelector } from "react-redux";
import { Roles } from "../../constants/roles";
import t from "../../services/translation";

export const StatsPage = ({ title, name, team, shortStatistic, generalStatistic, adminButton, error, customHeaderButton }) => {
    const user = useSelector(state => state.user);
    const ln = useSelector(state => state.language.currentLanguage);

    const renderLoaderOrContent = () => {
        if (error) {
            return <div className="statistic-error">{ t(ln, error.text) }</div>;
        }

        if (!shortStatistic && !generalStatistic) return (
            <div className="stats-page__loader-container">
                <Loader/>
            </div>
        );

        return (
            <Fragment>
                { name ? <h2 className="stats-page__name">
                    { name }
                </h2> : null }

                {team && team.length ?
                    <TeamLineUp members={team}/>
                    : null }

                { generalStatistic ? <GeneralStatistics stats={generalStatistic}/> : <PrivateStats stats={shortStatistic}/> }
            </Fragment>
        );
    };

    return (
        <Page className="stats-page">
            <img className="stats-page__blue-arrows" src="/images/wide_blue_arrows.png" alt="Blue arrows"/>
            <img className="stats-page__orange-arrows" src="/images/wide_orange_arrows.png" alt="Orange arrows"/>
            <Header showDiscordButton={false} showDropdown={false} withCountdown={false} isStatsPage={true} customButton={customHeaderButton}/>
            <div className="stats-page__content">
                <h1 className="stats-page__title">{title}</h1>

                { renderLoaderOrContent() }
            </div>
            { user.role === Roles.ADMIN && adminButton ? adminButton : null }
        </Page>
    );
};
