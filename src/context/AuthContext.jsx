import { doc, setDoc } from "firebase/firestore";
import { db} from "../firebase/config";
import {useState, useEffect, useContext, createContext} from 'react';
import { auth } from "../firebase/config";
import { createUserWithEmailAndPassword,
         signInWithEmailAndPassword, signOut,
         onAuthStateChanged } from "firebase/auth";

const AuthContext = createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);


    const signUp = async (email, password) => {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);

        const user = userCredential.user;

        await setDoc(doc(db, "users", user.uid), {
            email: user.email,
            role: "client",
            createdAt: new Date(),
        })
        return user;
    }

    const login = (email, password) => {
        signInWithEmailAndPassword(auth, email, password)
    }

    const logOut = () => {
        return signOut(auth)
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, user => {
            setCurrentUser(user);
            setLoading(false);
        })
        return unsubscribe;
    }, [])

    const value = {currentUser, signUp, login, logOut}

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    )
}

