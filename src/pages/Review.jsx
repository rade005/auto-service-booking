import {useAuth} from "../context/AuthContext";
import {useState, useEffect} from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, collection, addDoc, serverTimestamp, updateDoc} from "firebase/firestore";
import { db } from "../firebase/config";

export const Review = () => {
    const { currentUser } = useAuth();
    const { bookingId } = useParams();

    const [booking, setBooking] = useState(null);
    const [rating, setRating] = useState("");
    const [comment, setComment] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const navigate = useNavigate();

    useEffect(() => {
        if(!bookingId || !currentUser) {
        setError("Neispravan pristup");
        setLoading(false);
        return;
    }
    const fetchBooking = async () => {
        try {
            const bookingRef = doc(db, "bookings", bookingId);
            const snap = await getDoc(bookingRef);

            if (!snap.exists()) {
                setError("Rezervacija ne postoji")
                return;
            }
            const data = snap.data();

            if (data.userId !== currentUser.uid) {
                setError("Nemate pravo da ocenite ovu rezervaciju")
                return;
            }

            if (data.status !== "COMPLETED") {
                setError("Recenzija je dozvoljena za završene servise")
                return;
            }
            setBooking({id: snap.id, ...data});

        } catch (error) {
            setError("Greška pri učitavanju recenzije")
            console.error(error)
        } finally {
            setLoading(false);
        }
    }
    fetchBooking();
}, [bookingId, currentUser]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        if (!booking) {
        setError("Rezervacija još nije učitana")
        return;
        }

        if(!rating) {
            setError("Morate izabrati ocenu");
            return;
        }


    try {

            const numericRating = Number(rating);

        await addDoc(collection(db, "reviews"), {
            bookingId: bookingId,
            serviceId: booking.serviceId,
            serviceName: booking.serviceName,
            userId: currentUser.uid,
            rating: numericRating,
            comment: comment.trim(),
            createdAt: serverTimestamp(),
        });

        const serviceRef = doc(db, "services", booking.serviceId);
        const serviceSnap = await getDoc(serviceRef);

        if(serviceSnap.exists()) {
            const serviceData = await serviceSnap.data();

            const oldAverage = serviceData.averageRating || 0;
            const oldCount = serviceData.reviewsCount || 0;

            const newCount = oldCount + 1;

            const newAverage = ((oldAverage * oldCount) + numericRating) / newCount;

            await updateDoc(serviceRef, {
                averageRating: newAverage,
                reviewsCount: newCount,
            })
        }

        setSuccess ("Hvala! Recenzija je sačuvana.");
            setTimeout(() => navigate("/dashboard"), 1500);
    } catch (error) {
        console.error(error);
        setError("Greška pri čuvanju recenzije");
        }
    }

    if (loading) return <p>Loading...</p>;
    if (error) return <p>{error}</p>;
    if(success) return <p>{success}</p>;

    return (
        <>
            <h2>Ostavite recenziju za servis: {booking.serviceName}</h2>

        <form onSubmit={handleSubmit}>
            <label>Ocena (1-5, obavezno)</label>
            <select
                value = {rating} onChange={(e) =>setRating(e.target.value)} required>
                <option value="">Izaberite ocenu</option>
                <option value="1">1 - Loše</option>
                <option value="2">2</option>
                <option value="3">3 - Dobro</option>
                <option value="4">4</option>
                <option value="5">5 - Odlično</option>
            </select>

           <label>Komentar:</label>
            <textarea value={comment} onChange={(e) => setComment(e.target.value)}
            placeholder="Vaš utisak"/>

            <button type="submit">Sačuvaj recenziju</button>
        </form>
            </>
    )
}