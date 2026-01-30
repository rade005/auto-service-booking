import {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import { useAuth} from "../context/AuthContext";
import { getUserBookings } from "../firebase/bookings";
import { cancelBooking, completeBooking} from "../firebase/bookings";

export default function Dashboard() {
    const {currentUser, logOut} = useAuth();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const fetchBookings = async () => {
        if(!currentUser) return;

        setLoading(true);
        setError(null);

        try {
            const userBookings = await getUserBookings(currentUser.uid);
            setBookings(userBookings);
        }catch (error) {
            setError("Greška pri učitavanju rezervacija");
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if(!currentUser) {
            navigate("/login");
            return;
        }
        fetchBookings();
    }, [currentUser, navigate]);

    const handleLogout = async () => {
        try {
            await logOut();
        navigate("/login");
    } catch(error) {
        console.error(error);}
    }

    const handleCancel = async (bookingId) => {
        try {
            await cancelBooking(bookingId);
            setBookings(prev => prev.map(b => b.id === bookingId ? {...b, status: "CANCELED"} : b));
        } catch(error) {
            console.error(error);
            setError("Greška pri otkazivanju rezervacije");
        }
    }

    const handleComplete = async (bookingId) => {
      try {
          await completeBooking(bookingId);
          setBookings(prev => prev.map(b => b.id === bookingId ? {...b, status: "COMPLETED"} : b));
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

            {loading && <p>Loading...</p>}

            {error && <p>{error}</p>}

            {!loading && bookings.length === 0 && (
                <div>
                <p>Nemate zakazanih servisa</p>

                </div>
            )}

            {!loading && bookings.length > 0 && (
                <ul>
                    {bookings.map((booking) => (
                    <li key={booking.id}>
                        <p>Servis: {booking.service}</p>
                        <p>Datum: {booking.date}</p>
                        <p>Vreme: {booking.time}</p>
                        <p>Status: {booking.status}</p>


            {(booking.status === "PENDING" || booking.status === "CONFIRMED") && (
                <button onClick={() => handleCancel(booking.id)}>Otkaži</button>
                )}
            {booking.status === "COMPLETED" && (
                <button onClick={() => handleComplete(booking.id)}>Ostavi recenziju</button>
                )}
                    </li>
            ))}
                </ul>
                )}

        </>
    )
}