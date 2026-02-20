import { useAuth } from "../context/AuthContext"
import { useNavigate} from "react-router-dom";
import { updateEmail} from "firebase/auth"
import {useEffect, useState} from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase/config";

export default function Profile() {
    const { currentUser, logOut } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userData, setUserData] = useState(null);
    const [emailInput, setEmailInput] = useState("");
    const [success, setSuccess] = useState(null);

    const fetchUserData = async () => {
        if(!currentUser) return;

        try {
            const userRef = doc(db, "users", currentUser.uid);
            const userSnap = await getDoc(userRef);

            if(userSnap.exists()) {
                setUserData(userSnap.data());
                setEmailInput(userSnap.data().email);
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

    const updateUserData = async () => {

        if (emailInput.trim() === "") {
            setError("Email ne sme biti prazan");
            return;
        }
        setError(null);
        setSuccess(null);

        try {
            await updateEmail(currentUser, emailInput);
            const userRef = doc(db, "users", currentUser.uid);
            await updateDoc(userRef, {email: emailInput})

            setUserData(prev => ({...prev, email: emailInput}));
            setSuccess("Profil uspešno ažuriran")
        } catch (error) {
            console.log("AUTH ERROR:",error.code, error.message);

            if (error.code === "auth/requires-recent-login") {
                setError("Morate se ponovo ulogovati da biste promenili email")
            } else {
                setError("Greška pri ažuriranju korisnika");
            }
        }
    }

    if(loading) return <p>Loading...</p>;
    if(!userData) return <p>Učitavanje podataka korisnika</p>

    return (
        <>
            <h2>Profil korisnika</h2>

            <p>Email: {userData.email}</p>
            <p>User ID: {userData.uid}</p>
            <p>Role: {userData.role}</p>
            <p>Kreiran: {userData.createdAt ? userData.createdAt.toDate().toLocaleString() : "Nepoznat datum"}</p>

            <input type="email" value={emailInput} onChange={(e) => setEmailInput(e.target.value)}/>

            <button onClick={updateUserData}>Save</button>
            <button onClick={handleLogout}>Logout</button>
            {success && <p>{success}</p>}


        </>
    )
}