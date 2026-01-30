import {
    collection,
    addDoc,
    query,
    where,
    getDocs,
    serverTimestamp,
    updateDoc,
    doc,
} from 'firebase/firestore'
import { db } from './config'

export const createBooking = async ({userId, service, date, time}) => {
    const bookingRef = collection(db, 'bookings');

    await addDoc(bookingRef, {
        userId,
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
            id: doc.id,
            ...doc.data()

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