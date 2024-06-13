import "../assets/components/protected-route.scss";
import { Loader } from "./Loader";
import { Navigate } from "react-router-dom";
import { ROUTES } from "../constants/routes";

export const ProtectedRoute = ({ children, user, redirectPath, allowedRoles }) => {
    if (user.id === 0 && !redirectPath) {
        return <div className="protected-route"><Loader isBig={true}/></div>;
    } else if (user.id === 0 && redirectPath) {
        return <Navigate to={redirectPath}/>;
    }
    if (!allowedRoles.some((role) => user.role.toUpperCase() === role.toUpperCase())) return <Navigate to={ROUTES.LOGIN}/>;

    return children;
};
