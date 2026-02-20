import {Navigate} from "react-router-dom";
import { useAuth} from "../context/AuthContext";

const AdminRoute = ({children}) => {
    const { currentUser, role, loading } = useAuth();

    if (loading) return <p>Loading...</p>;

    if(!currentUser) return <Navigate to="/login" />;
    if(role !== "admin") return <Navigate to="/dashboard" />;

    return children;
}
export default AdminRoute;