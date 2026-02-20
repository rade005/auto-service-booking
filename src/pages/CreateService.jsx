import {useState, useEffect} from 'react';
import { addDoc, collection, updateDoc, doc} from 'firebase/firestore';
import { db } from "../firebase/config";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export const CreateService = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [city, setCity] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleCreateService = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (!name || !city) {
            setError("Popunite sva polja");
            return;
        }
        try {
            const newServiceRef = await addDoc(collection(db, "services"), {
                name,
                city,
                ownerId: currentUser.uid,
                status: "PENDING",
                services: [],
                workingHours: {},
                rating: 0,
                createdAt: new Date()
            })

            const userRef = doc(db, "users", currentUser.uid);
            await updateDoc(userRef, {
                role: "owner",
                serviceId: newServiceRef.id
            });
            alert ("Servis je poslat na odobrenje")
            navigate("/owner");
        } catch (error) {
            console.error(error);
            setError("Greška pri kreiranju servisa")
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
        <h2>Kreiraj novi servis</h2>

            <form onSubmit={handleCreateService}>
                <input type="text" placeholder="Naziv servisa" value={name}
                       onChange={(e) => setName(e.target.value)} required/>

                <input type="text" placeholder="Grad" value={city}
                       onChange={(e) => setCity(e.target.value)} required/>

                <button type="submit" disabled={loading}>
                    {loading ? "Kreiranje..." : "Kreiraj servis"}
                </button>
            </form>

            {error && <p>{error}</p>}
        </>
    )
}