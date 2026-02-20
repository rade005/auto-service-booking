import { useEffect, useState } from "react";
import { db } from "../firebase/config";
import { collection, getDocs, updateDoc, doc, arrayUnion, getDoc } from "firebase/firestore";

export const AdminServices = () => {
    const [servicesList, setServicesList] = useState([]);
    const [newServiceName, setNewServiceName] = useState("");
    const [selectedServiceId, setSelectedServiceId] = useState("");
    const [price, setPrice] = useState("");
    const [duration, setDuration] = useState("");

    useEffect(() => {
        const fetchServices = async () => {
            const servicesCol = collection(db, "services");
            const snapshot = await getDocs(servicesCol);
            setServicesList(snapshot.docs.map(d => ({id: d.id, ...d.data()})));

        }
        fetchServices();

    }, []);

    const handleAddService = async () => {
       if (!newServiceName || !price || !duration || !selectedServiceId) return;

       const serviceRef = doc(db, "services", selectedServiceId);

       const newServiceObject = {
           name: newServiceName,
           price: Number(price),
           duration: Number(duration),
       };

        try {
            // Proveravamo da li polje services postoji
            const serviceSnap = await getDoc(serviceRef);

            if (!serviceSnap.exists()) {
                console.error("Servis ne postoji u Firestore-u!");
                return;
            }

            const serviceData = serviceSnap.data();

            if (!serviceData.services) {
                // Ako ne postoji, kreiramo ga kao array sa novim objektom
                await updateDoc(serviceRef, {
                    services: [newServiceObject]
                });
            } else {
                // Ako postoji, dodajemo novi objekat u array
                await updateDoc(serviceRef, {
                    services: arrayUnion(newServiceObject)
                });
            }

            // Update lokalnog state-a da se odmah vidi u UI
            setServicesList(prev =>
                prev.map(s =>
                    s.id === selectedServiceId
                        ? { ...s, services: [...(s.services || []), newServiceObject] }
                        : s
                )
            );

            // Reset input-a
            setNewServiceName("");
            setPrice("");
            setDuration("");

        } catch (error) {
            console.error("Greška pri dodavanju usluge:", error);
        }
    };

    return (
        <>
        <h3>Upravljanje uslugama servisa</h3>

            <div>
                <label>Izaberite servis</label>
                <select
                    value={selectedServiceId}
                    onChange={(e) => {
                        setSelectedServiceId(e.target.value);
                        console.log("Selected service ID:", e.target.value);
                    }}
                >
                    <option value="">--Izaberite servis--</option>
                    {servicesList.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                </select>
            </div>

            <div>
                <input type="text" placeholder="Nova usluga" value={newServiceName}
                onChange={(e) => setNewServiceName(e.target.value)} />
                <button onClick={handleAddService}>Dodaj uslugu</button>
            </div>

            <div>
                <input type="number" placeholder="Cena (RSD)" value={price}
                       onChange={(e) => setPrice(e.target.value)} />

                <input type="number" value={duration} placeholder="Trajanje (min)"
                       onChange={(e) => setDuration(e.target.value)} />
            </div>

            <ul>
                {servicesList.map(s => (
                    <li key={s.id}>
                        <b>{s.name}</b>:
                        <ul>
                            {s.services && s.services.length > 0 ? (
                                s.services.map((service, index) => (
                                    <li key={index}>
                                        {service.name} - {service.price} RSD - {service.duration} min
                                    </li>
                                ))
                            ) : (
                                <li>Nema usluga</li>
                            )}
                        </ul>
                    </li>
                ))}
            </ul>

        </>
    )
}
