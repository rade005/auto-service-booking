import {useAuth} from "../context/AuthContext";
import { createBooking} from "../firebase/bookings";
import {useState} from "react";
import {useNavigate} from "react-router-dom";

export default function Services() {

    const { currentUser} = useAuth()

    const [selectedService, setSelectedService] = useState("");
    const [selectedDate, setSelectedDate] = useState("");
    const [selectedTime, setSelectedTime] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const navigate = useNavigate();

    const handleBooking = async (e) => {
        e.preventDefault();
        setSuccess(null);
        setLoading(true);
        setError(null);

        if (!selectedService || !selectedDate || !selectedTime) {
            setError("Molimo popunite podatke");
            setLoading(false);
            return;
        }
        try {
            await createBooking({
                userId: currentUser.uid,
                service: selectedService,
                date: selectedDate,
                time: selectedTime,
            })

            setSuccess("Uspešno zakazano");
            navigate("/dashboard");

        } catch (error) {
            setError(error);
            console.error(error);
        } finally {
            setLoading(false);
        }

    }
    return (
        <>
        <h2>Zakazivanje servisa</h2>

            {error && <p>{error}</p>}
            {success && <p>{success}</p>}
            {loading && <p>Loading...</p>}

            <form onSubmit={handleBooking}>
            <select value={selectedService} onChange={(e) => setSelectedService(e.target.value)}>
                <option value="">Izaberite servis</option>
                <option value="Zamena ulja">Zamena ulja</option>
                <option value="Popravka kočnica">Popravka kočnica</option>
                <option value="Dijagnostika">Dijagnostika</option>
            </select>

            <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
            <input type="time" value={selectedTime} onChange={(e) => setSelectedTime(e.target.value)} />
            <button type="submit" disabled={loading}>Zakaži servis</button>
                </form>
        </>
    )
}