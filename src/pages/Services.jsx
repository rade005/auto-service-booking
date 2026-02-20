import {useAuth} from "../context/AuthContext";
import { createBooking} from "../firebase/bookings";
import {useEffect, useState} from "react";
import { collection, query, where, doc, getDoc, getDocs } from "firebase/firestore";
import { db } from "../firebase/config";
import {useNavigate, useParams} from "react-router-dom";

export default function Services() {
    const { serviceId } = useParams();
    const { currentUser} = useAuth()

     const [selectedService, setSelectedService] = useState("");
    const [service, setService] = useState(null);
    const [selectedDate, setSelectedDate] = useState("");
    const [selectedTime, setSelectedTime] = useState("");
    const [loadingService, setLoadingService] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();


    useEffect(() => {
        const fetchService = async () => {

            try {
                const serviceRef = doc(db, "services", serviceId);
                const snap = await getDoc(serviceRef);

                if (!snap.exists()) {
                    setError("Servis ne postoji")
                } else {
                   const data = {id: snap.id, ...snap.data()}
                    setService(data);
                   console.log("SERVIS IZ FIRESTORE-A:", data);
                }
            } catch (error) {
                setError("Greška pri učitavanju servisa");
                console.error(error);
            } finally {
                setLoadingService(false);
            }
        }
        fetchService();
    }, [serviceId]);

    const handleBooking = async (e) => {
        e.preventDefault();
        setSuccess(null);
        setLoading(true);
        setError(null);

        if (!selectedDate || !selectedTime) {
            setError("Molimo izaberite datum i vreme");
            setLoading(false);
            return;
        }

        if(!selectedService) {
            setError("Molimo izaberite uslugu");
            setLoading(false);
            return;
        }

        const chosenService = service.services.find(s => s.name === selectedService);

        if (!chosenService) {
            setError("Usluga nije pronađena")
            setLoading(false);
            return;
        }
        const serviceDuration = chosenService.duration;

        const days = [
            "sunday",
            "monday",
            "tuesday",
            "wednesday",
            "thursday",
            "friday",
            "saturday",
        ];

        const userDate = new Date(selectedDate);
        const dayName = days[userDate.getDay()];

        const daySchedule = service.workingHours?.[dayName] || {
            open: "9:00", close: "17:00", breaks: []
        };

        if(!daySchedule) {
            setError("Servis ne radi tog dana")
            setLoading(false)
            return;
        }

        const [userHour, userMinute] = selectedTime.split(":").map(Number);
        const userTimeMinutes = userHour * 60 + userMinute;
        const bookingEndTimeMinutes = userTimeMinutes + serviceDuration;

        const [openHour, openMinute] = daySchedule.open.split(":").map(Number);
        const [closeHour, closeMinute] = daySchedule.close.split(":").map(Number);

        const openMinutes = openHour * 60 + openMinute;
        const closeMinutes = closeHour * 60 + closeMinute;

        if (userTimeMinutes < openMinutes || userTimeMinutes >= closeMinutes) {
            setError(`Servis radi od ${daySchedule.open} do ${daySchedule.close}`);
            setLoading(false);
            return;
        }

        if (bookingEndTimeMinutes > closeMinutes) {
            setError("Termin prelazi kraj radnog vremena");
            setLoading(false);
            return;
        }


        if(!chosenService) {
            setError("Molimo izaberite uslugu");
            setLoading(false);
            return;
        }

        if (daySchedule.breaks && daySchedule.breaks.length > 0) {
            for (let br of daySchedule.breaks) {
                const [breakStartHour, breakStartMinute] = br.starts.split(":").map(Number);
                const [breakEndHour, breakEndMinute] = br.ends.split(":").map(Number);

                const breakStartMinutes = breakStartHour * 60 + breakStartMinute;
                const breakEndMinutes = breakEndHour * 60 + breakEndMinute;

                const overlapsBreak = userTimeMinutes < breakEndMinutes &&
                    bookingEndTimeMinutes > breakStartMinutes;

                if (overlapsBreak) {
                    setError(`Termin ulazi u pauzu (${br.starts} - ${br.ends})`);
                    setLoading(false);
                    return;
                }

                if (userTimeMinutes >= breakStartMinutes && userTimeMinutes <= breakEndMinutes) {
                    setError(`Termin je u pauzi (${br.ends}).`);
                    setLoading(false);
                    return;
                }
            }
        }

        console.log("BOOKING PAYLOAD", {
            userId: currentUser?.uid,
            serviceId: service?.id,
            serviceName: service?.name,
            service: selectedService,
            date: selectedDate,
            time: selectedTime,
            status: "PENDING",
        });


        try {
        const q = query
        (collection(db, "bookings"),
          where("serviceId", "==", service.id),
        where("date", "==", selectedDate),
            where("time", "==", selectedTime),

        )
            const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
            setError("Termin je već zauzet")
            setLoading(false);
            return;
        }



            await createBooking({
                userId: currentUser.uid,
                serviceId: service.id,
                serviceName: service.name,
                service: selectedService,
                date: selectedDate,
                time: selectedTime,
                status: "PENDING"
            })

            setSuccess("Uspešno zakazano");
            navigate("/dashboard");

        } catch (error) {
            setError("Greška pri zakazivanju");
            console.error(error);
        } finally {
            setLoading(false);
        }

    }

    if (loadingService) return <p>Učitavanje servisa...</p>
    if (!service) return null;

    return (
        <>
        <h2>Zakazivanje servisa</h2>


            <p><b>Servis:</b> {service.name}</p>
            <p><b>Grad:</b> {service.city}</p>
            <p><b>Usluga:</b>{" "} {service.services?.map(s => s.name).join(", ")}</p>


            <form onSubmit={handleBooking}>

                <select
                    value={selectedService}
                    onChange={(e) => setSelectedService(e.target.value)}
                    required
                >
                    <option value="">Izaberite uslugu</option>

                    {Array.isArray(service.services) && service.services.map((s, index) => (
                        <option key={index} value={s.name}>
                            { `${s.name} - ${s.price} RSD- ${s.duration} min` }
                        </option>
                    ))}
                </select>

            <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
            <input type="time" value={selectedTime} onChange={(e) => setSelectedTime(e.target.value)} />
            <button type="submit" disabled={loading}>Zakaži servis</button>
                </form>

            {error && <p>{error}</p>}
            {success && <p>{success}</p>}

        </>
    )
}