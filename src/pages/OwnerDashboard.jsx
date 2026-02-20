import { useState, useEffect} from "react";
import { collection, query, where, doc, getDocs, getDoc, updateDoc} from "firebase/firestore";
import { db } from "../firebase/config";
import { useAuth} from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { confirmBooking, cancelBooking, completeBooking} from "../firebase/bookings";

export const OwnerDashboard = () => {
    const { currentUser, logOut } = useAuth();
    const navigate = useNavigate();

    const [services, setServices] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [reviews, setReviews] = useState([]);
    const [loadingReviews, setLoadingReviews] = useState(true);


    useEffect(() => {
        if(!currentUser) {
            navigate("/login");
            return;
        }

        const fetchOwnerData = async () => {
            try {
                const userRef = doc(db, "users", currentUser.uid);
                const userSnap = await getDoc(userRef);

                if (!userSnap.exists()) {
                    navigate("/dashboard");
                    return;
                }
                const userData = userSnap.data();

                if (userData.role !== "owner") {
                    navigate("/dashboard");
                    return;
                }
                const servicesSnap = await getDocs(collection(db, "services"));
                const allServices = servicesSnap.docs.map(doc => ({
                    id: doc.id, ...doc.data()
                }));

                const ownerServices = allServices.filter(service => service.ownerId === currentUser.uid);

                setServices(ownerServices);

                const bookingSnap = await getDocs(collection(db, "bookings"));
                const allBookings = bookingSnap.docs.map(doc => ({
                    id: doc.id, ...doc.data()
                }));

                const ownerBookings = allBookings.filter(booking => ownerServices.some(service =>
                    service.id === booking.serviceId))

                setBookings(ownerBookings)
            } catch {
                console.error("error");
            }finally {
            setLoading(false);}
        }

        fetchOwnerData();

    }, [currentUser]);

    const handleConfirm = async (id) => {
        await confirmBooking(id);
        setBookings(prev => prev.map(b => b.id === id ? {...b, status: "CONFIRMED"} : b))
    }
    const handleCancel = async (id) => {
        await cancelBooking(id);
        setBookings(prev => prev.map(b => b.id === id ? {...b, status: "CANCELLED"} : b))
    }
    const handleComplete = async (id) => {
        await completeBooking(id);
        setBookings(prev => prev.map(b => b.id === id ? {...b, status: "COMPLETED"} : b))
    }
    const handleLogout = async () => {
        await logOut();
        navigate("/login");
    }

    useEffect(() => {
        if(!currentUser) return;

        const fetchReviews = async () => {
            try {
                setLoadingReviews(true);
                const reviewSnap = await getDocs(collection(db, "reviews"));
                const allReviews = reviewSnap.docs.map(doc => ({
                    id: doc.id,...doc.data()}))

                const ownerReviews = allReviews.filter(r => services.some(
                    s => s.id === r.serviceId
                ));
                setReviews(ownerReviews);
            } catch (error) {
                console.error("Greška pri učitavanju recenzija:", error)
            }finally {
                setLoadingReviews(false);
            }
        }
        fetchReviews();
    }, [currentUser, services]);

    const renderStars = (average = 0) => {
        const fullStars = Math.floor(average);
        const emptyStars = 5 - fullStars;

        return "★".repeat(fullStars) + "☆".repeat(emptyStars)}


    if(loading) return <p>Loading...</p>

    return (
        <>




        <h2>Owner Dashboard</h2>
            <button onClick={handleLogout}>Logout</button>

            <h3>Moji servisi</h3>

            {services.length === 0 && <p>Nema servisa</p>}

            <ul>
                {services.map(service => (
                    <li key={service.id}>
                        {service.name} - {service.city}
                    <br/>
                        <span style={{color: "gold", fontSize: "18px"}}>
                            {renderStars(service.averageRating || 0)}
                        </span>
                        {" "}
                        {service.averageRating?.toFixed(1) || 0}
                        ({service.reviewsCount || 0} recenzija)
                    </li>
                ))}
            </ul>

            <h3>Rezervacije za moje servise</h3>
            {bookings.length === 0 && <p>Nema rezervacija</p>}

            <ul>
                {bookings.map(booking => (
                    <li key={booking.id}>
                        <p>Usluga: {booking.service}</p>
                        <p>Datum: {booking.date}</p>
                        <p>Vreme: {booking.time}</p>
                        <p>Status: {booking.status}</p>

                        {booking.status === "PENDING" && (
                            <>
                            <button onClick={() => handleConfirm(booking.id)}>Potvrdi</button>
                                <button onClick={() => handleCancel(booking.id)}>Otkaži</button>
                            </>
                        )}
                        {booking.status === "CONFIRMED" && (
                            <>
                            <button onClick={() => handleComplete(booking.id)}>Završi</button>
                                <button onClick={() => handleCancel(booking.id)}>Otkaži</button>
                            </>
                        )}
                    </li>
                ))}
            </ul>

            <h3>Recenzije za moj servis</h3>
            {loadingReviews ? (
                <p>Učitavanje recenzija...</p>
            ) : reviews.length === 0 ? (
                <p>Nema recenzija za vaš servis</p>
            ) : (
                <ul>
                    {reviews.map(review => (
                        <li key={review.id}>
                            <p><b>Servis:</b> {review.serviceName}</p>
                            <p><b>Ocena:</b> {review.rating} / 5</p>
                            {review.comment && <p><b>Komentar</b> {review.comment}</p>}
                            <p><small>{review.createdAt?.toDate()?.toLocaleString()}</small></p>
                        </li>
                    ))}
                </ul>


            )}
        </>
    )
}