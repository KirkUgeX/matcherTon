import "../../assets/pages/Users/users.scss";
import { Header } from "../../components";
import { buttonStyles, paddingSizes } from "../../components/Button";
import { WithCodePopup } from "./components/WithCodePopup";
import { EnterCodePopup } from "./components/EnterCodePopup";
import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ROUTES } from "../../constants/routes";
import { Page } from "../../components/Page";
import { create, joinLobby } from "../../services/lobby";
import { useDispatch, useSelector } from "react-redux";
import { PlayerTypes } from "../../constants/player-types";
import { createGame, getRatingGamesSettings } from "../../services/game";
import { getSocketsHost } from "../../services/env";
import { AUTHENTICATED, EXPIRED, FULFILLED } from "../../sockets/constants";
import { AuthenticateEvent } from "../../sockets/events";
import { toast } from "react-toastify";
import { GameStartingSection } from "./components/GameStartingSection";
import { RatingGamePopup } from "./components/RatingGamePopup";
import t from "../../services/translation";
import { TablePart } from "./components/TablePart";
import { setGameState } from "../../redux/reducers/game";

export const Users = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { id, teamId } = useSelector((state) => state.user);
    const ln = useSelector((state) => state.language.currentLanguage);
    const game = useSelector(state => state.game.game);

    const [showWithCodePopup, setShowWithCodePopup] = useState(false);
    const [showEnterCodePopup, setShowEnterCodePopup] = useState(false);
    const [showRatingGamePopup, setShowRatingGamePopup] = useState(false);
    const [blockGameButtons, setBlockGameButtons] = useState(false);

    const [disableRatingGames, setDisableRatingGames] = useState(true);
    const [showHumanRating, setShowHumanRating] = useState(null);
    const [isConnecting, setIsConnecting] = useState(false);

    const [lobby, setLobby] = useState(null);
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        window.addEventListener("beforeunload", closeSocket);
        getRatingGamesSettings()
            .then((data) => {
                setDisableRatingGames(!data.ratingGamesEnabled);
                setShowHumanRating(data.showHumanRating);
            }).catch(() => {});

        return () => {
            closeSocket();
            window.addEventListener("beforeunload", closeSocket);
        };
    }, []);

    useEffect(() => {
        if (game?.gameId) {
            navigate(ROUTES.GAME.TO_PAGE(game.gameId));
        }
    }, [game?.gameId]);

    const closeSocket = () => {
        socket && socket.close();
    };

    const createLobby = async () => {
        try {
            setBlockGameButtons(true);
            const lobby = await create({
                firstPlayerParentId: id,
                firstPlayerType: PlayerTypes.HUMAN,
            });
            setLobby(lobby);
            setShowWithCodePopup(true);
            setBlockGameButtons(false);
            connectToLobbyWebsocket({ lobby, creating: true });
        } catch (e) {
            setBlockGameButtons(false);
            toast(t(ln, "failed_to_create_a_lobby"));
        }
    };

    const joinLobbyHandler = (lobbyHash) => {
        setIsConnecting(true);
        connectToLobbyWebsocket({ lobby: { lobbyHash }, creating: false });
    };

    const joinToLobby = async (lobbyHash) => {
        try {
            const lobby = await joinLobby({
                hash: lobbyHash,
                type: PlayerTypes.HUMAN,
            });
            setLobby(lobby);
        } catch (e) {
            setIsConnecting(false);
            toast(t(ln, "failed_to_connect_to_lobby"));
            throw e;
        }
    };

    const startRatingGame = async () => {
        try {
            setBlockGameButtons(true);
            const lobby = await create({
                firstPlayerParentId: id,
                firstPlayerType: PlayerTypes.HUMAN,
                rating: true
            });
            if (lobby.firstPlayer && lobby.secondPlayer) {
                await createGameHandler(lobby.lobbyHash);
            }
            setLobby(lobby);
            setShowRatingGamePopup(true);
            setBlockGameButtons(false);
            connectToLobbyWebsocket({ lobby, creating: true, rating: true });
        } catch (e) {
            toast(t(ln, "failed_to_create_a_lobby"));
            setShowRatingGamePopup(false);
            setBlockGameButtons(false);
        }
    };

    const connectToLobbyWebsocket = ({ lobby, creating, rating = false, reconnect = false }) => {
        const socket = new WebSocket(
            `${getSocketsHost()}/lobby/${lobby.lobbyHash}`
        );

        socket.onerror = () => {
            socket.close();
        };

        socket.onmessage = (messageEvent) => {
            const data = JSON.parse(messageEvent.data);

            if (rating) {
                handleRatingGame({ data, lobbyHash: lobby?.lobbyHash, reconnect, socket });
                return;
            }

            if (data.message === AUTHENTICATED && !creating) {
                joinToLobby(lobby.lobbyHash)
                    .catch(e => socket.close());
                return;
            }

            if (
                data.status &&
                data.status.toUpperCase() === FULFILLED &&
                creating
            ) {
                createGameHandler(lobby.lobbyHash);
            }

            if (data.gameId) {
                dispatch(setGameState(data));
                socket.close();
            }
        };

        socket.onopen = () => {
            socket.send(new AuthenticateEvent().stringify());
        };

        socket.onclose = (e) => {
            setShowRatingGamePopup(false);
            setShowWithCodePopup(false);
        };

        setSocket(socket);
    };

    const handleRatingGame = async ({ data, lobbyHash, reconnect = false, socket }) => {
        if (data.status === EXPIRED) {
            socket && socket.close();
            setShowRatingGamePopup(false);
            toast(t(ln, "no_rated_game_was_found_matching_your_rating"));
            return;
        }
        if (data.newLobbyHash) {
            socket && socket.close();
            connectToLobbyWebsocket({
                lobby: { lobbyHash: data.newLobbyHash },
                creating: false,
                rating: true,
                reconnect: true
            });
        }

        if (data.gameId) {
            socket && socket.close();
            navigate(ROUTES.GAME.TO_PAGE(data.gameId));
        }

        if (reconnect === true && data?.message === AUTHENTICATED) {
            await createGameHandler(lobbyHash);
        }
    };

    const createGameHandler = async (lobbyHash) => {
        try {
            const game = await createGame(lobbyHash);
            socket && socket.close();
            navigate(ROUTES.GAME.TO_PAGE(game.gameId));
        } catch (e) {
            toast(t(ln, "failed_to_create_game"));
        }
    };

    const closeLobbyAndAllPopups = () => {
        socket && socket.close();
        setShowEnterCodePopup(false);
        setShowWithCodePopup(false);
        setShowRatingGamePopup(false);
        setBlockGameButtons(false);
    };

    const renderGoToTeamPageButton = () => {
        if (!teamId) return null;

        return (
            <Link to={ROUTES.TEAM} className={"users-page__navigation-link"}>
                {t(ln, "to_the_team_room")}
            </Link>
        );
    };

    return (
        <Page className="users-page">
            <div className="users-page__background-arrows">
                <img src="/images/wide_blue_arrows.png" alt="" />
            </div>
            <Header withCountdown={true} />
            <div className="users-page__content">
                <div className="users-page__heading-part">
                    <h1>{t(ln, "take_part_in_an_epic_event")}</h1>

                    <GameStartingSection
                        className="users-page__game-starting-section"
                        title={t(ln, "rating_game")}
                        text={t(ln, "competition_for_cool_prizes")}
                        buttons={[{
                            text: t(ln, "play_a_ranking_game"),
                            padding: paddingSizes.BIG,
                            style: buttonStyles.PRIMARY,
                            onClick: startRatingGame,
                            disabled: disableRatingGames || blockGameButtons
                        }]}
                    />
                    <GameStartingSection
                        className="users-page__game-starting-section"
                        title={t(ln,"game_in_the_lobby")}
                        text={t(ln, "no_rating_game_with_friends")}
                        buttons={[{
                            text: t(ln, "create_lobby"),
                            padding: paddingSizes.BIG,
                            style: buttonStyles.OUTLINE,
                            onClick: createLobby,
                            disabled: blockGameButtons
                        }, {
                            text: t(ln, "join_the_lobby"),
                            padding: paddingSizes.BIG,
                            style: buttonStyles.OUTLINE,
                            onClick: () => setShowEnterCodePopup(true),
                            disabled: blockGameButtons
                        }]}
                    />
                    <div className="users-page__navigation-link-wrapper">
                        <Link
                            to={ROUTES.MAIN_PAGE}
                            className={"users-page__navigation-link"}
                        >
                            {t(ln, "to_main")}
                        </Link>
                        {renderGoToTeamPageButton()}
                    </div>
                </div>
                <TablePart showHumanRating={showHumanRating}/>
            </div>
            <WithCodePopup
                show={showWithCodePopup}
                code={lobby && lobby.lobbyHash}
                onPopupClose={() => closeLobbyAndAllPopups()}
                showTimer={true}
            />
            <EnterCodePopup
                show={showEnterCodePopup}
                onPopupClose={() => closeLobbyAndAllPopups()}
                onButtonClick={joinLobbyHandler}
                isConnecting={isConnecting}
            />
            <RatingGamePopup
                onPopupClose={() => closeLobbyAndAllPopups()}
                show={showRatingGamePopup}
            />

        </Page>
    );
};
