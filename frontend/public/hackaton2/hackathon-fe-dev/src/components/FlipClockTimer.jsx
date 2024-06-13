import { useEffect } from "react";
import { useSelector } from "react-redux";
import "../assets/components/flip-clock-timer.scss";
import t from "../services/translation";

const clockTimerSize = {
    small: 0.2,
    medium: 0.4,
    big: 0.6,
};

export const FlipClockTimer = ({
    targetDate,
    size = "medium",
}) => {
    if (!targetDate) return null;
    const ln = useSelector((state) => state.language.currentLanguage);

    useEffect(() => {
        const countdownTimer = setInterval(() => {
            const isComplete = updateAllSegments();

            if (isComplete) {
                clearInterval(countdownTimer);
            }
        }, 1000);

        updateAllSegments();

        return () => {
            clearInterval(countdownTimer);
        };
    }, []);

    const getTimeSegmentElements = (segmentElement) => {
        const segmentDisplay = segmentElement.querySelector(".segment-display");
        const segmentDisplayTop = segmentDisplay.querySelector(
            ".segment-display__top"
        );
        const segmentDisplayBottom = segmentDisplay.querySelector(
            ".segment-display__bottom"
        );

        const segmentOverlay = segmentDisplay.querySelector(".segment-overlay");
        const segmentOverlayTop = segmentOverlay.querySelector(
            ".segment-overlay__top"
        );
        const segmentOverlayBottom = segmentOverlay.querySelector(
            ".segment-overlay__bottom"
        );

        return {
            segmentDisplayTop,
            segmentDisplayBottom,
            segmentOverlay,
            segmentOverlayTop,
            segmentOverlayBottom,
        };
    };

    const updateSegmentValues = (displayElement, overlayElement, value) => {
        displayElement.textContent = value;
        overlayElement.textContent = value;
    };

    const updateTimeSegment = (segmentElement, timeValue) => {
        const segmentElements = getTimeSegmentElements(segmentElement);

        if (
            parseInt(segmentElements.segmentDisplayTop.textContent, 10) ===
            timeValue
        ) {
            return;
        }

        segmentElements.segmentOverlay.classList.add("flip");

        updateSegmentValues(
            segmentElements.segmentDisplayTop,
            segmentElements.segmentOverlayBottom,
            timeValue
        );

        function finishAnimation() {
            segmentElements.segmentOverlay.classList.remove("flip");
            updateSegmentValues(
                segmentElements.segmentDisplayBottom,
                segmentElements.segmentOverlayTop,
                timeValue
            );

            this.removeEventListener("animationend", finishAnimation);
        }

        segmentElements.segmentOverlay.addEventListener(
            "animationend",
            finishAnimation
        );
    };

    const updateTimeSection = (sectionID, timeValue) => {
        const firstNumber = Math.floor(timeValue / 10) || 0;
        const secondNumber = timeValue % 10 || 0;
        const sectionElement = document.getElementById(sectionID);
        const timeSegments = sectionElement?.querySelectorAll(".time-segment");

        updateTimeSegment(timeSegments[0], firstNumber);
        updateTimeSegment(timeSegments[1], secondNumber);
    };

    const getTimeRemaining = (targetDateTime) => {
        const nowTime = Date.now();
        const complete = nowTime >= targetDateTime;

        if (complete) {
            return {
                complete,
                seconds: 0,
                minutes: 0,
                hours: 0,
                days: 0,
            };
        }

        const secondsRemaining = Math.floor((targetDateTime - nowTime) / 1000);
        const days = Math.floor(secondsRemaining / 60 / 60 / 24);
        const hours = Math.floor(secondsRemaining / 60 / 60) - days * 24;
        const minutes =
            Math.floor(secondsRemaining / 60) - days * 24 * 60 - hours * 60;
        const seconds = secondsRemaining % 60;

        return {
            complete,
            seconds,
            minutes,
            hours,
            days,
        };
    };

    const updateAllSegments = () => {
        const timeRemainingBits = getTimeRemaining(
            new Date(targetDate).getTime()
        );

        updateTimeSection("seconds", timeRemainingBits.seconds);
        updateTimeSection("minutes", timeRemainingBits.minutes);
        updateTimeSection("hours", timeRemainingBits.hours);
        updateTimeSection("days", timeRemainingBits.days);

        return timeRemainingBits.complete;
    };

    const styles = {
        zoom: `${clockTimerSize[size]}`,
        MozTransform: `scale(${clockTimerSize[size]})`,
    };

    return (
        <div className="flip-clock-timer" style={styles}>
            <div className="time-section" id="days">
                <div className="time-group">
                    <div className="time-segment">
                        <div className="segment-display">
                            <div className="segment-display__top"></div>
                            <div className="segment-display__bottom"></div>
                            <div className="segment-overlay">
                                <div className="segment-overlay__top"></div>
                                <div className="segment-overlay__bottom"> </div>
                            </div>
                        </div>
                    </div>
                    <div className="time-segment">
                        <div className="segment-display">
                            <div className="segment-display__top"></div>
                            <div className="segment-display__bottom"></div>
                            <div className="segment-overlay">
                                <div className="segment-overlay__top"></div>
                                <div className="segment-overlay__bottom"></div>
                            </div>
                        </div>
                    </div>
                </div>
                <p className="time-section__label">{t(ln, "days")}</p>
            </div>
            <div className="time-section" id="hours">
                <div className="time-group">
                    <div className="time-segment">
                        <div className="segment-display">
                            <div className="segment-display__top"></div>
                            <div className="segment-display__bottom"></div>
                            <div className="segment-overlay">
                                <div className="segment-overlay__top"></div>
                                <div className="segment-overlay__bottom"> </div>
                            </div>
                        </div>
                    </div>
                    <div className="time-segment">
                        <div className="segment-display">
                            <div className="segment-display__top"></div>
                            <div className="segment-display__bottom"></div>
                            <div className="segment-overlay">
                                <div className="segment-overlay__top"></div>
                                <div className="segment-overlay__bottom"></div>
                            </div>
                        </div>
                    </div>
                </div>
                <p className="time-section__label">{t(ln, "hours")}</p>
            </div>
            <div className="time-separator">:</div>
            <div className="time-section" id="minutes">
                <div className="time-group">
                    <div className="time-segment">
                        <div className="segment-display">
                            <div className="segment-display__top"></div>
                            <div className="segment-display__bottom"></div>
                            <div className="segment-overlay">
                                <div className="segment-overlay__top"></div>
                                <div className="segment-overlay__bottom"></div>
                            </div>
                        </div>
                    </div>
                    <div className="time-segment">
                        <div className="segment-display">
                            <div className="segment-display__top"></div>
                            <div className="segment-display__bottom"></div>
                            <div className="segment-overlay">
                                <div className="segment-overlay__top"></div>
                                <div className="segment-overlay__bottom"></div>
                            </div>
                        </div>
                    </div>
                </div>
                <p className="time-section__label">{t(ln, "minutes")}</p>
            </div>
            <div className="time-separator">:</div>
            <div className="time-section" id="seconds">
                <div className="time-group">
                    <div className="time-segment">
                        <div className="segment-display">
                            <div className="segment-display__top"></div>
                            <div className="segment-display__bottom"></div>
                            <div className="segment-overlay">
                                <div className="segment-overlay__top"></div>
                                <div className="segment-overlay__bottom"></div>
                            </div>
                        </div>
                    </div>
                    <div className="time-segment">
                        <div className="segment-display">
                            <div className="segment-display__top"></div>
                            <div className="segment-display__bottom"></div>
                            <div className="segment-overlay">
                                <div className="segment-overlay__top"></div>
                                <div className="segment-overlay__bottom"></div>
                            </div>
                        </div>
                    </div>
                </div>
                <p className="time-section__label">{t(ln, "seconds")}</p>
            </div>
        </div>
    );
};
