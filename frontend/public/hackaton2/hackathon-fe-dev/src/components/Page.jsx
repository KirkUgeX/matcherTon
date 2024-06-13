import "../assets/components/page.scss";
import classNames from "classnames";
import { Container } from "./Container";

export const Page = ({ children, className }) => {
    const classes = classNames(
        "page",
        className
    );

    return (
        <div className={classes}>
            <Container>
                { children }
            </Container>
        </div>
    );
};
