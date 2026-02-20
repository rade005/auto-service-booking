import {useNavigate} from "react-router-dom";
import {useAuth} from "../context/AuthContext";
import {useEffect, useState} from "react";
import { doc, getDoc, collection, getDocs, updateDoc} from "firebase/firestore";
import { db } from "../firebase/config";
import {
    getAllBookings,
    confirmBooking,
    completeBooking, cancelBooking,
} from "../firebase/bookings";
import {AdminServices} from "../components/AdminServices";

export const AdminDashboard = () => {
    const {currentUser, logOut} = useAuth();
    const navigate = useNavigate();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filterStatus, setFilterStatus] = useState("ALL");
    const [activeTab, setActiveTab] = useState("BOOKINGS");
    const [pendingServices, setPendingServices] = useState([]);

    const handleApproveService = async (service) => {
        try {
            const serviceRef = doc(db, "services", service.id);
            await updateDoc(serviceRef, {status: "APPROVED"});


            setPendingServices(prev => prev.filter(s => s.id !== service.id));
            alert("Servis odobren i vlasnik dodeljen")
        } catch (error) {
            console.error(error);
            alert("Greška pri odobravanju servisa")
        }
    }

    const handleRejectService = async (service) => {
        try {
            const serviceRef = doc(db, "services", service.id);
            await updateDoc(serviceRef, {status: "REJECTED"});
            setPendingServices(prev => prev.filter(s => s.id !== service.id));
            alert("Servis odbijen");
        } catch (error) {
            console.error(error);
            alert ("Greška pri odbijanju servisa")
        }
    }

    const checkAdminAndFetchData = async () => {
        try {
            const userRef = doc(db, "users", currentUser.uid);
            const userSnap = await getDoc(userRef);
            const serviceCol = collection(db, "services");
            const servicesSnapshot = await getDocs(serviceCol);
            const allServices = servicesSnapshot.docs.map(d => (
                {id: d.id, ...d.data()}));

            setPendingServices(allServices.filter(s => s.status === "PENDING"));

            if (!userSnap.exists()) {
                navigate("/dashboard");
                return;
            }
            const userData = userSnap.data();
            if (userData.role !== "admin") {
                navigate("/dashboard");
                return;
            }
            const allBookings = await getAllBookings();
            setBookings(allBookings);
        } catch (error) {
            console.log(error);
            setError("Greška pri učitavanju admin podataka")
        } finally {
            setLoading(false);
        }
    }
    useEffect(() => {
        if (!currentUser) {
            navigate("/login");
            return;
        }
        checkAdminAndFetchData();
    }, [currentUser]);

    const handleConfirm = async (bookingId) => {
        try {
            await confirmBooking(bookingId);
            setBookings(prev => prev.map(b => b.id === bookingId ? {...b, status: "CONFIRMED"} : b));
        } catch (error) {
            console.log(error);
            setError("Greška pri potvrdi rezervacije");
        }
    }

    const handleCancel = async (bookingId) => {
        try {
            await cancelBooking(bookingId);
            setBookings(prev => prev.map(b => b.id === bookingId ? {...b, status: "CANCELLED"} : b));
        } catch (error) {
            console.log(error);
            setError("Greška pri otkazivanju rezervacije");
        }
    }

    const handleCompleted = async (bookingId) => {
        try {
            await completeBooking(bookingId);
            setBookings(prev => prev.map(b => b.id === bookingId ? {...b, status: "COMPLETED"} : b));
        } catch (error) {
            console.log(error);
            setError("Greška pri završavanju rezervacije");
        }
    }
    const handleLogOut = async () => {
        await logOut();
        navigate("/login");
    }
    if (loading) return <p>Loading...</p>;
    if (error) return <p>{error}</p>;

    const filteredBookings = bookings
        .filter(booking => filterStatus === "ALL" || booking.status === filterStatus)
        .sort((a, b) => new Date(a.date + " " + a.time) - new Date(b.date + " " + b.time));

    return (
        <>
            <h2>Admin Dashboard</h2>
            <button onClick={handleLogOut}>Logout</button>

            <div>
                <button onClick={() => setActiveTab("BOOKINGS")}>
                    Rezervacije
                </button>
                <button onClick={() => setActiveTab("SERVICES")}>
                    Usluge
                </button>
                <button onClick={() => setActiveTab("PENDING_SERVICES")}>Potvrdi</button>
            </div>

            {activeTab === "PENDING_SERVICES" && (
                <>
                <h3>Servisi na odobrenju</h3>
                    {pendingServices.length === 0 ? (
                        <p>Nema servisa na čekanju</p>
                    ) : (
                        <ul>
                            {pendingServices.map(service => (
                                <li key={service.id}>
                                    <p>Servis: {service.name}</p>
                                    <p>Grad: {service.city}</p>
                                    <button onClick={() => handleApproveService(service)}>Odobri</button>
                                    <button onClick={() => handleRejectService(service)}>Odbij</button>
                                </li>
                            ))}
                        </ul>
                    )}
                </>
            )}

            {activeTab === "BOOKINGS" && (
                <>
                    {bookings.length === 0 && <p>Nema rezervacija</p>}

                    <label htmlFor="statusFilter">Filtriraj po statusu:</label>
                    <select
                        id="statusFilter"
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                    >
                        <option value="ALL">ALL</option>
                        <option value="PENDING">PENDING</option>
                        <option value="CONFIRMED">CONFIRMED</option>
                        <option value="COMPLETED">COMPLETED</option>
                        <option value="CANCELLED">CANCELLED</option>
                    </select>

                    <ul>
                        {filteredBookings.map(booking => (
                            <li key={booking.id}>
                                <p>Servis: {booking.service}</p>
                                <p>Datum: {booking.date}</p>
                                <p>Vreme: {booking.time}</p>
                                <p>Status: {booking.status}</p>

                                {booking.status === "PENDING" && (
                                    <>
                                        <button onClick={() => handleConfirm(booking.id)}>
                                            Potvrdi</button>
                                        <button onClick={() => handleCancel(booking.id)}>
                                            Otkaži</button>
                                    </>
                                )}

                                {booking.status === "CONFIRMED" && (
                                    <>
                                        <button onClick={() => handleCompleted(booking.id)}>
                                            Završi
                                        </button>
                                        <button onClick={() => handleCancel(booking.id)}>
                                            Otkaži
                                        </button>
                                    </>
                                )}
                            </li>
                        ))}
                    </ul>
                </>
            )}

            {activeTab === "SERVICES" && <AdminServices/>}
        </>
    );
}

