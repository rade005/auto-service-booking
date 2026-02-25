import React from "react";
import { Navigate} from "react-router-dom";
import { useAuth} from "../context/AuthContext";

export default function ProtectedRoute ({children})  {
    const {currentUser, loading} = useAuth();

    if (loading) {
        return <p>Loading...</p>
    }

    if(!currentUser) {
        return <Navigate to="/login" />;
    }

    return children;
}