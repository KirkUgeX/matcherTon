import classNames from "classnames";
import { StrokeTypes } from "../constrants";
import { calculationWinningStrokePosition } from "../calculationWinningStrokePosition";

export const StrokeBlock = ({ type, cells }) => {
    const classes = classNames(
        { "stroke-block__straight": type === StrokeTypes.COLUMN || type === StrokeTypes.ROW },
        { "stroke-block__diagonal": type === StrokeTypes.DIAGONAL_RIGHT || type === StrokeTypes.DIAGONAL_LEFT },
        { "stroke-block__straight--horizontal": type === StrokeTypes.ROW },
        { "stroke-block__straight--vertical": type === StrokeTypes.COLUMN },
        { "stroke-block__diagonal--left": type === StrokeTypes.DIAGONAL_LEFT },
        { "stroke-block__diagonal--right": type === StrokeTypes.DIAGONAL_RIGHT },
    );

    const margins = calculationWinningStrokePosition(cells, type);

    return (
        <div className={classes} style={{ left: `${margins.columnMargin}px`, top: `${margins.rowMargin}px` }}></div>
    );
    /*<div className="stroke-block__straight stroke-block__straight--horizontal"></div>*/
    /*<div className="stroke-block__straight stroke-block__straight--vertical"></div>*/
    /*<div className="stroke-block__diagonal stroke-block__diagonal--right"></div>*/
    /*<div className="stroke-block__diagonal stroke-block__diagonal--left"></div>*/
};
