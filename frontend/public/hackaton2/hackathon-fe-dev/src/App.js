import "react-toastify/dist/ReactToastify.css";
import "./assets/components/notification.scss";
import "./App.css";
import "./assets/fonts.css";
import { Route, Routes, useNavigate } from "react-router-dom";
import { Login } from "./pages/Login";
import { TeamCabinet } from "./pages/TeamCabinet/TeamCabinet";
import { NotFound } from "./pages/NotFound/NotFound";
import { ROUTES } from "./constants/routes";
import { UserMain } from "./pages/UserMain/UserMain";
import { Users } from "./pages/Users/Users";
import { FirstPlace } from "./pages/Stats/FirstPlace";
import { SecondPlace } from "./pages/Stats/SecondPlace";
import { ThirdPlace } from "./pages/Stats/ThirdPlace";
import { BestViewer } from "./pages/Stats/BestViewer";
import { GeneralStats } from "./pages/Stats/GeneralStats";
import { Leaders } from "./pages/Leaders/Leaders";
import { Game } from "./pages/Game/Game";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { setUser } from "./redux/reducers/user";
import { getUserInfo, initialRefresh, refresh } from "./services/auth";
import { getGameConfig } from "./services/game";
import { setMoveTimeLimit } from "./redux/reducers/app";
import { Roles } from "./constants/roles";
import { ProtectedRoute } from "./components";
import { toast } from "react-toastify";
import { getActiveEventProfile } from "./services/event";
import { setEventInfo } from "./redux/reducers/eventInfo";
import t from "./services/translation";
import { getContests } from "./services/contest";
import { setContests } from "./redux/reducers/contest";
import { SecondBestViewer } from "./pages/Stats/SecondBestViewer";
import { ThirdBestViewer } from "./pages/Stats/ThirdBestViewer";
import { History } from "./pages/History/History";

export let globalNavigate;
export let globalDispatch;

function App() {
    globalDispatch = useDispatch();
    globalNavigate = useNavigate();
    const user = useSelector((state) => state.user);
    const ln = useSelector((state) => state.language.currentLanguage);
    const [redirectPath, setRedirectPath] = useState(null);
    const getUserInitialInfo = async () => {
        await initialRefresh();
        const user = await getUserInfo();

        if (user) {
            const timeLimit = await getGameConfig();
            const contests = await getContests();
            globalDispatch(setContests(contests));

            globalDispatch(setMoveTimeLimit(timeLimit.moveTimeLimit / 1000));
            globalDispatch(setUser(user));
        } else {
            setRedirectPath(ROUTES.LOGIN);
        }
    };
    const getEventInfo = async () => {
        const eventInfo = await getActiveEventProfile();
        globalDispatch(setEventInfo(eventInfo));
    };

    useEffect(() => {
        getEventInfo().then(() => {
            getUserInitialInfo().catch(() => {
                globalNavigate(ROUTES.LOGIN);
            });
        });
    }, []);

    return (
        <div className="App">
            <Routes>
                <Route path={ROUTES.LOGIN} element={<Login />} />
                <Route
                    path={ROUTES.TEAM}
                    element={
                        <ProtectedRoute
                            allowedRoles={[Roles.TEAM_MEMBER, Roles.ADMIN]}
                            user={user}
                            redirectPath={redirectPath}
                        >
                            <TeamCabinet />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path={ROUTES.MAIN_PAGE}
                    element={
                        <ProtectedRoute
                            allowedRoles={[
                                Roles.ADMIN,
                                Roles.USER,
                                Roles.TEAM_MEMBER,
                            ]}
                            user={user}
                            redirectPath={redirectPath}
                        >
                            <UserMain />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path={ROUTES.USERS}
                    element={
                        <ProtectedRoute
                            allowedRoles={[
                                Roles.ADMIN,
                                Roles.USER,
                                Roles.TEAM_MEMBER,
                            ]}
                            user={user}
                            redirectPath={redirectPath}
                        >
                            <Users />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path={ROUTES.LEADERS.PAGE}
                    element={
                        <ProtectedRoute
                            allowedRoles={[
                                Roles.ADMIN,
                                Roles.USER,
                                Roles.TEAM_MEMBER,
                            ]}
                            user={user}
                            redirectPath={redirectPath}
                        >
                            <Leaders />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path={ROUTES.FIRST_PLACE}
                    element={
                        <ProtectedRoute
                            allowedRoles={[Roles.ADMIN]}
                            user={user}
                            redirectPath={redirectPath}
                        >
                            <FirstPlace />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path={ROUTES.SECOND_PLACE}
                    element={
                        <ProtectedRoute
                            allowedRoles={[Roles.ADMIN]}
                            user={user}
                            redirectPath={redirectPath}
                        >
                            <SecondPlace />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path={ROUTES.THIRD_PLACE}
                    element={
                        <ProtectedRoute
                            allowedRoles={[Roles.ADMIN]}
                            user={user}
                            redirectPath={redirectPath}
                        >
                            <ThirdPlace />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path={ROUTES.BEST_PLAYER}
                    element={
                        <ProtectedRoute
                            allowedRoles={[Roles.ADMIN]}
                            user={user}
                            redirectPath={redirectPath}
                        >
                            <BestViewer />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path={ROUTES.SECOND_BEST_PLAYER}
                    element={
                        <ProtectedRoute
                            allowedRoles={[Roles.ADMIN]}
                            user={user}
                            redirectPath={redirectPath}
                        >
                            <SecondBestViewer />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path={ROUTES.THIRD_BEST_PLAYER}
                    element={
                        <ProtectedRoute
                            allowedRoles={[Roles.ADMIN]}
                            user={user}
                            redirectPath={redirectPath}
                        >
                            <ThirdBestViewer />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path={ROUTES.GENERAL_STATISTICS}
                    element={
                        <ProtectedRoute
                            allowedRoles={[
                                Roles.ADMIN,
                                Roles.USER,
                                Roles.TEAM_MEMBER,
                            ]}
                            user={user}
                            redirectPath={redirectPath}
                        >
                            <GeneralStats />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path={ROUTES.GAME.PAGE}
                    element={
                        <ProtectedRoute
                            allowedRoles={[
                                Roles.ADMIN,
                                Roles.USER,
                                Roles.TEAM_MEMBER,
                            ]}
                            user={user}
                            redirectPath={redirectPath}
                        >
                            <Game />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path={ROUTES.CONTEST_HISTORY.PAGE}
                    element={
                        <ProtectedRoute
                            allowedRoles={[
                                Roles.ADMIN,
                                Roles.USER,
                                Roles.TEAM_MEMBER,
                            ]}
                            user={user}
                            redirectPath={redirectPath}
                        >
                            <History />
                        </ProtectedRoute>
                    }
                />
                <Route path="*" element={<NotFound />}></Route>
            </Routes>
        </div>
    );
}

export default App;
