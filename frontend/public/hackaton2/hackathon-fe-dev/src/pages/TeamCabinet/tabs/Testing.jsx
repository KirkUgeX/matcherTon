import "../../../assets/pages/TeamCabinet/testing-tab.scss";
import { Input } from "../../../components/Input";
import { Button, Loader } from "../../../components";
import { buttonStyles, paddingSizes } from "../../../components/Button";
import { Console } from "../components/Console";
import { ConsoleItemTypes } from "../components/ConsoleItem";
import { AITestingConsoleItem } from "../components/AITestingConsoleItem";
import dayjs from "dayjs";
import { addAI, testAI } from "../../../services/team";
import { create } from "../../../services/lobby";
import { PlayerTypes } from "../../../constants/player-types";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getSocketsHost } from "../../../services/env";
import { AUTHENTICATED, FULFILLED } from "../../../sockets/constants";
import { ROUTES } from "../../../constants/routes";
import { AuthenticateEvent } from "../../../sockets/events";
import { createGame } from "../../../services/game";
import { useNavigate } from "react-router-dom";
import { QUERY_PARAMS_VALUES } from "../../../constants/game";
import { WithCodePopup } from "../../Users/components/WithCodePopup";
import { toast } from "react-toastify";
import t from "../../../services/translation";
import { setGameState } from "../../../redux/reducers/game";

const urlPattern =
    /(?:https?):\/\/(\w+:?\w*)?(\S+)(:\d+)?(\/|\/([\w#!:.?+=&%!\-/]))?/;

export const TestingTab = ({ ai, setAi, console }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const ln = useSelector((state) => state.language.currentLanguage);
    const { id, teamId } = useSelector((state) => state.user);
    const game = useSelector(state => state.game.game);

    const [consoleItems, setItems] = console;
    const [lobby, setLobby] = useState(null);
    const [showWithCodePopup, setShowWithCodePopup] = useState(false);
    const [aiInput, setAiInput] = useState(ai);
    const [socket, setSocket] = useState(null);
    const [isTesting, setIsTesting] = useState(false);
    const [joiningToLobby, setJoiningToLobby] = useState(false);

    const isInputValid = urlPattern.test(aiInput);

    useEffect(() => {
        setAiInput(ai);
    }, [ai]);

    useEffect(() => {
        window.addEventListener("beforeunload", closeSocket);
        return () => {
            closeSocket();
            window.removeEventListener("beforeunload", closeSocket);
        };
    }, []);

    useEffect(() => {
        if (game?.gameId) {
            goToGame(game.gameId);
        }
    }, [game?.gameId]);

    useEffect(() => {
        clearLoaderItems();
    }, [consoleItems]);

    const clearLoaderItems = () => {
        if (consoleItems.length) {
            const resultItems = consoleItems.filter((item) => {
                return item.type !== ConsoleItemTypes.LOADER;
            });

            const loaderItems = consoleItems.filter((item) => {
                return item.type === ConsoleItemTypes.LOADER;
            });

            if (
                loaderItems.length > 0 &&
                consoleItems[consoleItems.length - 1].type !==
                    ConsoleItemTypes.LOADER
            ) {
                setItems(resultItems);
            }
        }
    };

    const closeSocket = () => {
        socket && socket.close();
    };

    const onTestButtonClickHandler = async (e) => {
        setIsTesting(true);
        e && e.preventDefault();
        await sendAIUrl();
    };

    const sendAIUrl = async () => {
        try {
            await addAI(aiInput);
            const time = dayjs().format("HH:mm");
            const type = ConsoleItemTypes.SUCCESS;
            const content = "URL was successfully attached to your team.";
            setItems((currentValue) => [
                ...currentValue,
                { time, type, content },
            ]);
            setAi(aiInput);
            await testingAI();
        } catch (e) {
            setIsTesting(false);
            const time = dayjs().format("HH:mm");
            const type = ConsoleItemTypes.ERROR;
            const content = e?.data?.error || "Unknown error";
            setItems((currentValue) => [
                ...currentValue,
                { time, type, content },
            ]);
        }
    };

    const renderAITestingConsoleItem = (data) => {
        return <AITestingConsoleItem data={data} />;
    };

    const createLoaderItemContent = () => {
        return (
            <div className="console-item__loader">
                <Loader />
                <span>Data is being processed...</span>
            </div>
        );
    };

    const addLoaderItem = () => {
        const time = dayjs().format("HH:mm");
        const type = ConsoleItemTypes.LOADER;
        const content = createLoaderItemContent();
        setItems((currentValue) => [...currentValue, { time, type, content }]);
    };

    const testingAI = async () => {
        addLoaderItem();
        try {
            await testAI().then((res) => {
                if (res.isSuccessful) {
                    const time = dayjs().format("HH:mm");
                    const type = ConsoleItemTypes.SUCCESS;
                    const content = `AI testing was successful: ${res.testsCount} tests passed!`;
                    setItems((currentValue) => [
                        ...currentValue,
                        { time, type, content },
                    ]);
                } else {
                    const time = dayjs().format("HH:mm");
                    const type = ConsoleItemTypes.ERROR;
                    const content = renderAITestingConsoleItem(res);
                    setItems((currentValue) => [
                        ...currentValue,
                        { time, type, content },
                    ]);
                }
                setIsTesting(false);
            });
        } catch (e) {
            setIsTesting(false);
            const time = dayjs().format("HH:mm");
            const type = ConsoleItemTypes.ERROR;
            const content = e?.data?.error || "Unknown error";
            setItems((currentValue) => [
                ...currentValue,
                { time, type, content },
            ]);
        }
    };

    // HUMAN-AI game
    const createLobbyWithMyself = async () => {
        setJoiningToLobby(true);
        const firstPlayer = {
            firstPlayerParentId: id,
            firstPlayerType: PlayerTypes.HUMAN,
        };
        const secondPlayer = {
            secondPlayerParentId: teamId,
            secondPlayerType: PlayerTypes.AI,
        };
        let lobby;
        try {
            setJoiningToLobby(true);
            lobby = await createLobby(firstPlayer, secondPlayer);
        } catch (e) {
            setJoiningToLobby(false);
            toast(t(ln, "failed_to_create_a_lobby"));
        }

        createGameHandler(lobby.lobbyHash).catch((e) => {
            setJoiningToLobby(false);
            toast(t(ln, "failed_to_create_game"));
        });
    };

    const createLobbyToConnect = async () => {

        const firstPlayer = {
            firstPlayerParentId: teamId,
            firstPlayerType: PlayerTypes.AI,
        };
        try {
            setJoiningToLobby(true);
            const lobby = await createLobby(firstPlayer);
            setLobby(lobby);
            setShowWithCodePopup(true);
            setJoiningToLobby(false);
            connectToLobbyWebsocket(lobby, true);
        } catch (e) {
            setJoiningToLobby(false);
            toast(t(ln, "failed_to_create_game"));
        }
    };

    const createLobby = async (firstPlayer, secondPlayer) => {
        let createLobbyInfo = { ...firstPlayer };
        if (secondPlayer) {
            createLobbyInfo = { ...createLobbyInfo, ...secondPlayer };
        }
        return create(createLobbyInfo);
    };

    const createGameHandler = async (lobbyHash) => {
        const game = await createGame(lobbyHash);
        setJoiningToLobby(false);
        dispatch(setGameState(game));
    };

    const goToGame = (gameId) => {
        const queryOptions = { from: QUERY_PARAMS_VALUES.FROM_TEAM_CABINET };
        navigate(ROUTES.GAME.TO_PAGE(gameId, queryOptions));
    };

    const connectToLobbyWebsocket = (lobby, creating) => {
        const socket = new WebSocket(
            `${getSocketsHost()}/lobby/${lobby.lobbyHash}`
        );

        socket.onerror = (err) => {
            socket.close();
        };

        socket.onmessage = (messageEvent) => {
            const data = JSON.parse(messageEvent.data);

            if (
                data.status &&
                data.status.toUpperCase() === FULFILLED &&
                creating
            ) {
                createGameHandler(lobby.lobbyHash).catch((e) => {
                    toast(t(ln, "failed_to_create_game"));
                });
            }

            if (data.gameId) {
                socket.close();
                goToGame(data.gameId);
            }
        };

        socket.onopen = () => {
            socket.send(new AuthenticateEvent().stringify());
        };

        socket.onclose = () => {
            setShowWithCodePopup(false);
        };

        setSocket(socket);
    };

    return (
        <div className="team-cabinet__tab testing-tab">
            <div className="testing-tab__column">
                <form
                    className="testing-tab__form"
                    onSubmit={onTestButtonClickHandler}
                >
                    <Input
                        value={aiInput}
                        onChange={(e) => setAiInput(e.target.value)}
                        placeholder="https://localhost:5000"
                        label={t(ln, "enter_the_URL_with_the_algorithm_code")}
                        className="testing-tab__input"
                        type="text"
                        successful={isInputValid}
                    />

                    <div className="testing-tab__form-submit-row">
                        <Button
                            paddingSize={paddingSizes.NORMAL}
                            text={t(ln, "API_testing")}
                            type="submit"
                            style={buttonStyles.PRIMARY}
                            className="testing-tab__test-button"
                            disabled={!isInputValid || isTesting}
                            onClick={onTestButtonClickHandler}
                        />
                        <span>
                            {t(
                                ln,
                                "by_checking_code_it_automatically_becomes_current_version_teams_algorithm"
                            )}
                        </span>
                    </div>
                </form>

                <div className="testing-tab__buttons-group">
                    <Button
                        style={buttonStyles.PRIMARY}
                        paddingSize={paddingSizes.BIG}
                        text={t(ln, "test_game")}
                        onClick={createLobbyWithMyself}
                        disabled={!ai || joiningToLobby}
                    />
                    <Button
                        style={buttonStyles.PRIMARY}
                        paddingSize={paddingSizes.BIG}
                        text={t(ln, "create_lobby")}
                        onClick={createLobbyToConnect}
                        disabled={!ai || joiningToLobby}
                    />
                </div>
            </div>
            <div className="testing-tab__column">
                <Console
                    items={consoleItems}
                    className="testing-tab__console"
                />
            </div>
            <WithCodePopup
                show={showWithCodePopup}
                code={lobby && lobby.lobbyHash}
                onPopupClose={() => {
                    setJoiningToLobby(false);
                    setShowWithCodePopup(false);
                }}
                showTimer={true}
            />
        </div>
    );
};
