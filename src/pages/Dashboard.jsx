import {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import { useAuth} from "../context/AuthContext";
import { getUserBookings, cancelBooking, completeBooking} from "../firebase/bookings";
import { collection, query, where, getDocs} from "firebase/firestore";
import { db } from "../firebase/config";

export default function Dashboard() {
    const {currentUser, logOut} = useAuth();
    const [bookings, setBookings] = useState([]);
    const [filteredBookings, setFilteredBookings] = useState([]);
    const [filterStatus, setFilterStatus] = useState("ALL")
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [userReviews, setUserReviews] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        if(!currentUser) {
            navigate("/login");
            return;
        }

    const fetchBookings = async () => {

        setLoading(true);
        setError(null);

        try {
            const bookingsData = await getUserBookings(currentUser.uid);
            setBookings(bookingsData);

            const reviewQuery = query(collection(db, "reviews"),
                where("userId", "==", currentUser.uid))

            const reviewSnap = await getDocs(reviewQuery);
            const reviewsData = reviewSnap.docs.map(doc => ({
                id: doc.id, ...doc.data()}))

            setUserReviews(reviewsData);

        } catch (error) {
            setError("Greška pri učitavanju rezervacija");
            console.error(error);
        } finally {
            setLoading(false);
        }
    }
        fetchBookings()
    }, [currentUser, navigate]);

    useEffect(() => {
        if (filterStatus === "ALL") {
            setFilteredBookings(bookings)
        } else {
            setFilteredBookings(bookings.filter((b) => b.status === filterStatus))
        }

    }, [bookings, filterStatus]);

    const handleLogout = async () => {
        try {
            await logOut();
        navigate("/login");
    } catch(error) {
        console.error(error);
        setError("Greška pri logout-u");}
    }

    const handleCancel = async (bookingId) => {
        try {
            await cancelBooking(bookingId);
            setBookings(prev => prev.map(b => b.id === bookingId ? {...b, status: "CANCELLED"} : b));
            setSuccess("Rezervacija je otkazana");
        } catch(error) {
            console.error(error);
            setError("Greška pri otkazivanju rezervacije");
        }
    }

    const handleComplete = async (bookingId) => {
      try {
          await completeBooking(bookingId);
          setBookings(prev => prev.map(b => b.id === bookingId ? {...b, status: "COMPLETED"} : b));
          setSuccess("Rezervacija je završena");
      } catch(error) {
      console.error(error);
      setError("Greška pri završavanje rezervacije");
      }
    }


    return (
        <>
            <header>
                <h2>Dobrodošao, {currentUser?.email}</h2>
                <button onClick={handleLogout}>Logout</button>
                <button onClick={() => navigate("/services")}>Zakažite servis</button>
            </header>

            <div>
                <label>Filter:</label>
                <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                    <option value="ALL">Svi</option>
                    <option value="PENDING">Na čekanju</option>
                    <option value="CONFIRMED">Potvrđeni</option>
                    <option value="COMPLETED">Završeni</option>
                    <option value="CANCELLED">Otkazani</option>
                </select>
            </div>

            {loading && <p>Loading...</p>}
            {error && <p>{error}</p>}
            {success && <p>{success}</p>}

            {!loading && bookings.length === 0 && (
                <p>Nemate zakazanih servisa</p>
            )}

            {!loading && bookings.length > 0 && (
                <ul>
                    {filteredBookings.map((booking) => {
                        const review = userReviews.find(r => r.bookingId === booking.id);

                        return (
                    <li key={booking.id}>
                        <p>Ime servisa: {booking.serviceName}</p>
                        <p>Usluga: {booking.service || "Nije izabrana"}</p>
                        <p>Datum: {booking.date}</p>
                        <p>Vreme: {booking.time}</p>
                        <p>Status: {booking.status}</p>




            {(booking.status === "PENDING" || booking.status === "CONFIRMED") && (
                <button onClick={() => handleCancel(booking.id)}>Otkaži</button>
                )}

                        {booking.status === "CONFIRMED" && (
                            <button onClick={() => handleComplete(booking.id)}>Završi termin</button>
                        )}

            {booking.status === "COMPLETED" && (
                review ? (
                    <div>
                        <p><b>Vaša ocena:</b>
                            {" "}
                            {[...Array(review.rating)].map((_, i) => (
                                <span key={i}> ⭐</span>
                            ))}
                            {" "}({review.rating}/5)</p>

                        {review.comment && (
                        <p><b>Komentar:</b> {review.comment}</p>
                        )}
                    </div>
                    ) : (
                <button onClick={() => navigate(`/review/${booking.id}`)}>Ostavi recenziju</button>
                )
                )}
                    </li>
            );
            })}
                </ul>
                )}

            <button onClick={() => navigate("/create-service")}>Registruj svoj servis</button>

        </>
    )
}