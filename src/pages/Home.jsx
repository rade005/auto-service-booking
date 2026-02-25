import { Link } from "react-router-dom";

export const Home = () => {
    return (
        <div style={{ padding: "40px", textAlign: "center"}}>
            <h1>Auto Service Booking Platform</h1>
            <p>Online zakazivanje termina u auto-servisima</p>

            <div style={{marginTop: "20px"}}>
                <Link to="/login">
                    <button>Login</button>
                </Link>

                    <Link to="/register" style={{marginLeft: "10px"}}>
                        <button>Register</button>
                    </Link>

                <Link to="/services" style={{marginLeft: "10px"}}>
                    <button>Services</button>
                </Link>
            </div>
        </div>
    )
}