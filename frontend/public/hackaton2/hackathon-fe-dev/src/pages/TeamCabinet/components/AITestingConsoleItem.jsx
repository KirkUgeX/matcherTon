import { ConsoleAccordion } from "../components/ConsoleAccordion";

export const AITestingConsoleItem = ({ data }) => {
    const title = `AI testing was not successful: ${data.failedTestsCount}/${data.testsCount} tests failed!`;

    return (
        <ConsoleAccordion title={title}>
            <div className="ai-testing__item ai-testing__tests-is-successful">
                <span>
                    <strong>isSuccessful: </strong>&quot;
                    {data.isSuccessful ? "true" : "false"}&quot;
                </span>
            </div>
            <div className="ai-testing__item ai-testing__tests-count">
                <span>
                    <strong>testsCount: </strong>&quot;{data.testsCount}
                    &quot;
                </span>
            </div>
            <div className="ai-testing__item ai-testing__failed-tests-count">
                <span>
                    <strong>failedTestsCount: </strong>&quot;
                    {data.failedTestsCount}&quot;
                </span>
            </div>
            <ConsoleAccordion title={"Failed tests"}>
                {data.details?.map((item, i) => {
                    return (
                        <ConsoleAccordion key={i} title={"Test " + i}>
                            {item.aiMove?.column ? (
                                <div className="ai-testing__item">
                                    <span>
                                        <strong>aiMove: </strong>&quot;column:
                                        {item.aiMove.column}
                                        &quot;
                                    </span>
                                </div>
                            ) : (
                                ""
                            )}
                            <div className="ai-testing__item">
                                <span>
                                    <strong>failureReason: </strong>&quot;
                                    {item.failureReason}
                                    &quot;
                                </span>
                            </div>
                            <ConsoleAccordion title={"testCase"}>
                                <div className="ai-testing__item">
                                    <span>
                                        <strong>description: </strong>
                                        &quot;
                                        {item.testCase.description}&quot;
                                    </span>
                                </div>
                                <div className="ai-testing__item">
                                    <span>
                                        <strong>obstacle: </strong>&quot;
                                        {item.testCase.obstacle}
                                        &quot;
                                    </span>
                                </div>
                                <div className="ai-testing__item">
                                    <span>
                                        <strong>side: </strong>&quot;
                                        {item.testCase.side}&quot;
                                    </span>
                                </div>
                                <div className="ai-testing__item">
                                    <span>
                                        <strong>testName: </strong>&quot;
                                        {item.testCase.testName}
                                        &quot;
                                    </span>
                                </div>
                            </ConsoleAccordion>
                            <ConsoleAccordion title={"request"}>
                                <div className="ai-testing__item">
                                    <span>
                                        <strong>gameId: </strong>&quot;
                                        {item.request.gameId}&quot;
                                    </span>
                                </div>
                                <div className="ai-testing__item">
                                    <span>
                                        <strong>player: </strong>&quot;
                                        {item.request.player}
                                        &quot;
                                    </span>
                                </div>
                                <ConsoleAccordion title={"board"}>
                                    {item.request.board.map((column, i) => {
                                        return (
                                            <div
                                                key={i + i}
                                                className="ai-testing__item"
                                            >
                                                [
                                                {column.map((cell, i) => {
                                                    return (
                                                        <span
                                                            key={cell + i}
                                                            className={
                                                                "ai-testing__board-cell"
                                                            }
                                                        >
                                                            &quot;{cell}
                                                            &quot;
                                                        </span>
                                                    );
                                                })}
                                                ]
                                            </div>
                                        );
                                    })}
                                </ConsoleAccordion>
                            </ConsoleAccordion>
                        </ConsoleAccordion>
                    );
                })}
            </ConsoleAccordion>
        </ConsoleAccordion>
    );
};
