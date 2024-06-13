import "../../../assets/pages/TeamCabinet/tabs.scss";
import classNames from "classnames";

export const Tab = ({ text, name, onClick, isActive }) => {
    return (
        <div className={classNames("tab", "tabs__tab", { "tab--active": isActive })} onClick={() => onClick(name)}>
            { text }
        </div>
    );
};

export const Tabs = ({ currentTab, onTabClick, tabs, className }) => {

    const renderTabs = () => {
        return tabs.map(tab => {
            const isActive = Boolean(currentTab === tab.name);
            return <Tab isActive={isActive} key={tab.name} text={tab.text} name={tab.name} onClick={onTabClick}/>;
        });
    };

    const classes = classNames(
        "tabs",
        className
    );

    return (
        <div className={classes}>
            { renderTabs() }
        </div>
    );
};
