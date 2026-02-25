import {
    collection,
    addDoc,
    query,
    where,
    getDocs,
    serverTimestamp,
    updateDoc,
    doc,
    getDoc,
} from 'firebase/firestore'
import { db } from './config'

export const createBooking = async ({userId, serviceId, serviceName, service, date, time}) => {

    const serviceRef = doc(db, 'services', serviceId);
    const serviceSnap = await getDoc(serviceRef);

    if(!serviceSnap.exists()) {
        throw new Error("Servis ne postoji");
    }

    const serviceData = serviceSnap.data();
    const ownerId = serviceData.ownerId;

    const bookingRef = collection(db, 'bookings');

    await addDoc(bookingRef, {
        userId,
        ownerId,
        serviceId,
        serviceName,
        service,
        date,
        time,

        status: "PENDING",
        createdAt: serverTimestamp()
    })
}
    export const getUserBookings = async (userId) => {
        const bookingsRef = collection(db, 'bookings');

        const q = query(bookingsRef,
            where('userId', '==', userId))

        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({
            id: doc.id, ...doc.data()
        }))
    };

export const cancelBooking = async (bookingId) => {
    const bookingRef = doc(db, 'bookings', bookingId);
    await updateDoc(bookingRef, {status: "CANCELLED"});
}

export const completeBooking = async (bookingId) => {
    const bookingRef = doc(db, 'bookings', bookingId);
    await updateDoc(bookingRef, {status: "COMPLETED"});
}

export const getAllBookings = async () => {
    const bookingsRef = collection(db, 'bookings');
    const snapshot = await getDocs(bookingsRef);
    return snapshot.docs.map(doc => ({id: doc.id, ...doc.data()}));
}
export const confirmBooking = async (bookingId) => {
    const bookingRef = doc(db, 'bookings', bookingId);
    await updateDoc(bookingRef, {status: "CONFIRMED"});
}