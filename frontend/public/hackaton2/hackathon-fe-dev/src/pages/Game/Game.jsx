// import "../../assets/pages/game.scss";
import { Page } from "../../components/Page";
import { Button, Header, Loader } from "../../components";
import { GameBoard } from "./components/GameBoard";
import { GamePlayerCard } from "./components/GamePlayerCard";
import { ROUTES } from "../../constants/routes";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Fragment, useEffect, useState } from "react";
import { EndGamePopup } from "./components/EndGamePopup";
import { WinnerGamePopup } from "./components/WinnerGamePopup";
import { checkIfAnyoneWon } from "../../utils/checkIfAnyoneWon";
import { getGameInfo, getPlayerGameInfo, whoseTurn } from "../../services/game";
import {
    EMPTY_CELL, END_REASONS,
    FIRST_PLAYER_CELL,
    QUERY_PARAMS_VALUES,
    SECOND_PLAYER_CELL,
} from "../../constants/game";
import { getSocketsHost } from "../../services/env";
import { useDispatch, useSelector } from "react-redux";
import { AuthenticateEvent, MoveEvent } from "../../sockets/events";
import { currentTimeInSeconds } from "../../utils/currentTimeInSeconds";
import { toast } from "react-toastify";
import { ReplayControllers } from "./components/ReplayControllers";
import { GameHeader } from "./components/GameHeader";
import t from "../../services/translation";
import { setGameState } from "../../redux/reducers/game";

export const Game = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const user = useSelector((state) => state.user);
    const { moveTimeLimit } = useSelector((state) => state.app);
    const eventInfo = useSelector((state) => state.event.event);
    const globalGame = useSelector((state) => state.game.game);

    // Game Info
    const [game, setGame] = useState(null);
    const [fieldState, setFieldState] = useState(null);
    const [moves, setMoves] = useState([]);
    const [winner, setWinner] = useState(null);
    const [isTie, setIsTie] = useState(false);
    const [winningLine, setWinningLine] = useState(null);
    const [showWinningLine, setShowWinningLine] = useState(true);
    const [timer, setTimer] = useState(null);
    const [timeRemaining, setTimeRemaining] = useState(moveTimeLimit);
    const [isReplay, setIsReplay] = useState(false);

    // For replay
    const [currentField, setCurrentField] = useState(null);
    const [currentMoves, setCurrentMoves] = useState(null);

    // Sockets info
    const [gameSocket, setGameSocket] = useState(null);
    const [lastMessage, setLastMessage] = useState(null);

    // Players info
    const [firstPlayer, setFirstPlayer] = useState(null);
    const [secondPlayer, setSecondPlayer] = useState(null);

    // Popups
    const [isEndGamePopupShow, setIsEndGamePopupShow] = useState(false);
    const [isWinnerGamePopupShow, setIsWinnerGamePopupShow] = useState(false);

    const { gameId } = useParams();
    const ln = useSelector((state) => state.language.currentLanguage);

    useEffect(() => {
        const getGameState = async () => {
            await getGameMainInfo();
        };

        getGameState();
        return () => {
            dispatch(setGameState(null));
        };
    }, []);

    useEffect(() => {
        if (lastMessage) {
            if (lastMessage.timestamp) {
                setTimer(lastMessage.timestamp + moveTimeLimit);
                setTimeRemaining(moveTimeLimit);
            }
            if (lastMessage.expired) {
                toast(t(ln, "move_time_has_expired"));
                return processWin({
                    winnerId: lastMessage.winnerId,
                    forOutsideReasons: true,
                });
            }
            if (lastMessage.error && lastMessage.winnerId) {
                toast(t(ln, "the_move_was_not_correct_game_is_over"));
                return processWin({
                    winnerId: lastMessage.winnerId,
                    forOutsideReasons: true,
                });
            }
            if (lastMessage.error === "It is not a current user's turn") {
                toast(t(ln, "its_not_your_turn"));
                return;
            }
            checkReceivedMove(lastMessage);
        }
    }, [lastMessage]);

    useEffect(() => {
        if (lastMessage || timer) {
            const interval = setInterval(() => {
                if (currentTimeInSeconds() < timer + 1) {
                    const remaining = timer - currentTimeInSeconds();
                    setTimeRemaining(remaining);
                    // Handle lose of one side
                }
            }, 1000);
            return () => {
                clearInterval(interval);
            };
        }
    }, [timer]);

    const getGameMainInfo = async () => {
        let game;
        try {
            if (globalGame) {
                game = globalGame;
            } else {
                game = await getGameInfo(gameId);
            }
        } catch (e) {
            if (e.status === 404) {
                toast(t(ln, "game_doesnt_exist"));
                goToUsersPage();
                return;
            }
        }
        try {
            await getPlayerGameInfo(game.firstPlayer, setFirstPlayer, eventInfo.id);
            await getPlayerGameInfo(
                game.secondPlayer,
                setSecondPlayer,
                eventInfo.id
            );
        } catch (e) {
            toast(t(ln, "failed_to_retrieve_player_information"));
        }
        setFieldState(game.field);
        setMoves(game.moves);
        setGame(game);
        if (game.isFinished) {
            setIsReplay(true);
            setCurrentMoves(game.moves);
            setCurrentField(game.field);
            setLastMessage({
                gameId: game.gameId,
                isFinished: true,
                winnerId: game.winnerId,
            });
            setWinnerById(game.winnerId, game);
        } else {
            if (game.moves.length) {
                setInitTimer(game.lastMoveTimestamp);
            } else {
                setInitTimer(game.lastMoveTimestamp, true);
            }
            subscribeToGame();
        }
    };
    const setInitTimer = (timestamp, isFirstMove) => {
        const moveTime = isFirstMove ? 30 : moveTimeLimit;
        const nextTimer = timestamp + moveTime;
        setTimer(nextTimer);
        setTimeRemaining(nextTimer - currentTimeInSeconds());
    };

    const subscribeToGame = () => {
        const socket = new WebSocket(`${getSocketsHost()}/game/${gameId}`);

        socket.onerror = () => {
            socket.close();
        };

        socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            setLastMessage(data);
        };

        socket.onopen = () => {
            socket.send(new AuthenticateEvent().stringify());
        };

        socket.onclose = () => {};

        setGameSocket(socket);
    };

    const checkReceivedMove = (data) => {
        if (data.column >= 0) {
            const columnNumber = data.column;
            const rowNumber = findFreeCellInTheColumn(columnNumber);

            if (rowNumber === -1 && game && !game.isFinished) {
                return toast(
                    t(
                        ln,
                        "the_new_received_move_cannot_be_played_because_its_column_is_already_filled"
                    )
                );
            }
            const newFieldState = [
                ...fieldState.slice(0, rowNumber),
                [
                    ...fieldState[rowNumber].slice(0, columnNumber),
                    whoseTurn(moves),
                    ...fieldState[rowNumber].slice(columnNumber + 1),
                ],
                ...fieldState.slice(rowNumber + 1),
            ];
            setFieldState(newFieldState);
            setMoves((current) => [...current, data.column]);
            if (data.isFinished) {
                return processWin({ winnerId: data.winnerId, newFieldState });
            }
        }
        if (data.isFinished) {
            processWin({ winnerId: data.winnerId });
        }
    };

    const processWin = ({ winnerId, newFieldState, forOutsideReasons }) => {
        gameSocket && gameSocket.close();
        setTimeRemaining(0);
        setTimer(currentTimeInSeconds());
        if (!winnerId) {
            setIsTie(true);
        } else if (forOutsideReasons) {
            setWinnerById(winnerId, game);
        } else {
            checkIfWinByFourInARow(newFieldState || fieldState);
            setWinnerById(winnerId, game);
        }
        if (!isReplay) {
            setIsWinnerGamePopupShow(true);
        }
    };

    const checkIfWinByFourInARow = (fieldState) => {
        const win = JSON.parse(
            checkIfAnyoneWon(fieldState)
        );
        if (win) {
            setWinningLine({ cells: win.cells, type: win.type });
        }
    };

    const setWinnerById = (winnerId, game) => {
        if (winnerId === game?.firstPlayer?.id) {
            setWinner(firstPlayer);
        } else {
            setWinner(secondPlayer);
        }
    };

    const makeMove = (column) => {
        gameSocket && gameSocket.send(new MoveEvent(column).stringify());
    };

    const onEndGameButtonClick = () => {
        gameSocket && gameSocket.close();
        dispatch(setGameState(null));
        if (
            searchParams.get("from") === QUERY_PARAMS_VALUES.FROM_TEAM_CABINET
        ) {
            return navigate(ROUTES.TEAM);
        }
        return navigate(ROUTES.USERS);
    };

    const onContinueGameButtonClick = () => {
        setIsEndGamePopupShow(false);
    };

    const goToMainPage = () => {
        dispatch(setGameState(null));
        navigate(ROUTES.MAIN_PAGE);
    };

    const goToUsersPage = () => {
        dispatch(setGameState(null));
        navigate(ROUTES.USERS);
    };

    const isSpectator = () => {
        if (user.id !== firstPlayer?.parentId && user.id !== secondPlayer?.parentId) {
            return true;
        }
        return false;
    };

    const onColumnClick = (columnNumber) => {
        const rowNumber = findFreeCellInTheColumn(columnNumber);

        if (game.isFinished || winner || isTie) {
            return;
        }

        const turn = whoseTurn(moves);
        if (isSpectator()) {
            return toast(t(ln, "can_only_spectate"));
        }
        if (firstPlayer?.parentId !== secondPlayer?.parentId) {
            if (user.id === firstPlayer?.parentId && turn !== FIRST_PLAYER_CELL) {
                return toast(t(ln, "its_not_your_turn"));
            } else if (user.id === secondPlayer?.parentId && turn !== SECOND_PLAYER_CELL) {
                return toast(t(ln, "its_not_your_turn"));
            }
        }

        if (rowNumber === -1 && game && !game.isFinished) {
            return toast(t(ln, "this_column_is_alread_filled"));
        }
        makeMove(columnNumber);
    };

    const findFreeCellInTheColumn = (columnNumber) => {
        let freeCell = -1;

        for (let i = 0; i <= fieldState.length - 1; i++) {
            if (fieldState[i][columnNumber] === EMPTY_CELL) {
                freeCell = i;
            }
        }

        return freeCell;
    };

    const onReplayButtonClick = (newFieldState, newMovesState) => {
        setCurrentField(newFieldState);
        setCurrentMoves(newMovesState);
        if (newMovesState.length === moves.length)
            setShowWinningLine(true);
        else
            setShowWinningLine(false);
    };

    const fieldForUse = isReplay ? currentField : fieldState;
    const movesForUser = isReplay ? currentMoves : moves;

    const getEndReason = () => {
        if (!game.endReason) return null;
        let text;

        if (game.endReason === END_REASONS.AI_ERROR) {
            text = t(ln, "AI_wrong_move");
        } else if (game.endReason === END_REASONS.EXPIRED) {
            text = t(ln, "move_time_has_expired");
        } else {
            return null;
        }
        return (
            <div className="game-page__end-reason">
                <img src="/images/attention-icon.svg" alt="attention"/> {t(ln, "reason_ending_game")} { text }
            </div>
        );
    };

    const onFinishGameButtonClick = () => {
        if (isSpectator()) {
            return goToUsersPage();
        }

        if (winner || isTie) {
            return setIsWinnerGamePopupShow(true);
        }
        setIsEndGamePopupShow(true);
    };

    const renderPageContentOrLoader = () => {
        if (!fieldForUse)
            return (
                <div className="game-page__loader-container">
                    <Loader className="game-page__loader" />
                </div>
            );
        return (
            <Fragment>
                <div className="game-page__content">
                    <GamePlayerCard
                        player={firstPlayer}
                        playerNumber={1}
                        position={"left"}
                        isActive={Boolean(
                            whoseTurn(movesForUser) === FIRST_PLAYER_CELL
                        )}
                        isWinner={winner?.id === firstPlayer?.id}
                    />

                    <GameBoard
                        isReplay={isReplay}
                        timeRemaining={timeRemaining}
                        winningLine={winningLine}
                        userTurn={whoseTurn(movesForUser)}
                        fieldState={fieldForUse}
                        onColumnClick={onColumnClick}
                        showWinningLine={showWinningLine}
                    />
                    <GamePlayerCard
                        player={secondPlayer}
                        playerNumber={2}
                        position={"right"}
                        isActive={Boolean(
                            whoseTurn(movesForUser) === SECOND_PLAYER_CELL
                        )}
                        isWinner={winner?.id === secondPlayer?.id}
                        // teamName={""}
                        // playersNames={playersNamesArray}
                    />
                </div>
                { getEndReason() }
                <div className="game-page__close">
                    {isReplay ? (
                        <ReplayControllers
                            moves={game.moves}
                            currentMoves={currentMoves}
                            currentField={currentField}
                            finalField={fieldState}
                            onButtonClick={onReplayButtonClick}
                        />
                    ) : (
                        <span
                            onClick={onFinishGameButtonClick}
                            className="end-game-button"
                        >
                            {
                                isSpectator()
                                    ? t(ln, "exit_the_game")
                                    : t(ln, "finish_the_game")
                            }
                        </span>
                    )}
                </div>
            </Fragment>
        );
    };

    return (
        <Page className="game-page">
            <GameHeader isReplay={isReplay} />
            {renderPageContentOrLoader()}
            <EndGamePopup
                show={isEndGamePopupShow}
                onEndGameButtonClick={() => onEndGameButtonClick()}
                onContinueGameButtonClick={() => onContinueGameButtonClick()}
                onPopupClose={() => setIsEndGamePopupShow(false)}
            />
            <WinnerGamePopup
                show={isWinnerGamePopupShow}
                winner={winner}
                onMainPageButtonClick={() => goToMainPage()}
                onNewGameButtonClick={() => goToUsersPage()}
                onPopupClose={() => setIsWinnerGamePopupShow(false)}
                isTie={isTie}
                from={searchParams.get("from")}
            />
        </Page>
    );
};
