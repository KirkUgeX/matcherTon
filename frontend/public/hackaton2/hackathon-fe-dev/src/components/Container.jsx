import "../assets/components/container.scss";

export const Container = ({ children }) => {
    return (
        <div className="container">
            { children }
        </div>
    );
};
