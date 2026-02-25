import { useAuth } from "../context/AuthContext"
import { useNavigate} from "react-router-dom";
import {useEffect, useState} from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/config";

export default function Profile() {
    const { currentUser, logOut } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userData, setUserData] = useState(null);

    const fetchUserData = async () => {
        if(!currentUser) return;

        try {
            const userRef = doc(db, "users", currentUser.uid);
            const userSnap = await getDoc(userRef);

            if(userSnap.exists()) {
                setUserData(userSnap.data());
            } else {
                console.log("Nema podataka za ovog korisnika");
            }
        } catch (error) {
            console.error("Greška pri učitavanju korisnika", error);
            setError("Greška pri učitavanju podataka korisnika");
        } finally {
            setLoading(false);
        }
    }


    useEffect(() => {
        if(!currentUser) {
            navigate("/login");
            return;
        }

        const loadData = async () => {
            await fetchUserData()
        }
        loadData()
    }, [currentUser, navigate]);


    const handleLogout = async () => {
        try {
            await logOut();
            navigate("/login");
        } catch (error) {
            setError("Greška pri logout-u");

        }
    }

    if(loading) return <p>Loading...</p>;
    if(!userData) return <p>Učitavanje podataka korisnika</p>

    return (
        <>
            <h2>Profil korisnika</h2>

            {error && <p>{error}</p>}

            <p>Email: {userData.email}</p>
            <p>User ID: {userData.uid}</p>
            <p>Role: {userData.role}</p>
            <p>Kreiran: {userData.createdAt ? userData.createdAt.toDate().toLocaleString() : "Nepoznat datum"}</p>

            <button onClick={handleLogout}>Logout</button>



        </>
    )
}