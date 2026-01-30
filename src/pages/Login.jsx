import { useNavigate } from "react-router-dom";
import {useState} from "react";
import { useAuth } from "../context/AuthContext";

export default function Login() {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const { login }= useAuth();
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");

        try {
            await login(email, password);
            navigate("/dashboard");
        } catch (error) {
            setError(error.message);
        }
    }

    return (
        <>
            <h3>Login</h3>
            {error && <p>{error}</p>}
            <form onSubmit={handleLogin}>
            <input type="text" placeholder="Unesite vaš email"
                   onChange={(e) => setEmail(e.target.value)}/>
            <input type="password" placeholder="Unesite vašu lozinku"
                   onChange={(e) => setPassword(e.target.value)}/>
                <button type="submit">Login</button>
            </form>
            </>
)
}