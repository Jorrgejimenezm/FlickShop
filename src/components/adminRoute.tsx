import React, { type ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

interface TokenPayload {
    "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"?: string | string[];
}

interface AdminRouteProps {
    children: ReactNode;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
    const token = localStorage.getItem("token");
    if (!token) {
        return <Navigate to="/login" replace />;
    }

    try {
        const decoded = jwtDecode<TokenPayload>(token);

        const roles = decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
        const isAdmin =
            (typeof roles === "string" && roles === "Admin") ||
            (Array.isArray(roles) && roles.includes("Admin"));

        if (!isAdmin) {
            return <Navigate to="/" replace />;
        }

        return <>{children}</>;
    } catch (error) {
        return <Navigate to="/login" replace />;
    }
};

export default AdminRoute;
