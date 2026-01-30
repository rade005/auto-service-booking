import {useState} from "react";
import {useAuth} from "../context/AuthContext";
import {useNavigate} from "react-router-dom";

export default function Register() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const { signUp } = useAuth();
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        setError("");

        if (password !== confirmPassword) {
            setError("Lozinke se ne poklapaju");
            return;
        }

            setLoading(true);

            try {
                await signUp(email, password);
                navigate("/dashboard");
            } catch (error) {
                setError(error.message);
            }
            setLoading(false);
        }
    return (
        <>
            {error && <p>{error}</p>}
        <form onSubmit={handleRegister}>
            <input type="email" placeholder="Unesite vaš email" value={email}
                   onChange={(e) => setEmail(e.target.value)}/>
            <input type="password" placeholder="Unesite vašu lozinku" value={password}
                   onChange={(e) => setPassword(e.target.value)}/>
            <input type="password" placeholder="Potvrdite vašu lozinku" value={confirmPassword}
                   onChange={(e) => setConfirmPassword(e.target.value)}/>
            <button type="submit" disabled={loading}>Submit</button>
        </form>
            <p>Već imate nalog? <a href="/login">Prijavite se</a></p>
        </>
    )

}