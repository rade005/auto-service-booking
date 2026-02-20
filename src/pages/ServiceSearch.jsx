import {useState, useEffect} from "react";
import { db} from "../firebase/config";
import { collection, getDocs} from "firebase/firestore";
import {useNavigate} from "react-router-dom";

const ServiceSearch = () => {
    const [allServices, setAllServices] = useState([]);
    const [filteredServices, setFilteredServices] = useState([]);
    const [searchCity, setSearchCity] = useState("");
    const [searchType, setSearchType] = useState("");
    const [searchRating, setSearchRating] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const fetchServices = async () => {

            try {
                const serviceRef = collection(db, "services");
                const snapshot = await getDocs(serviceRef);
                const servicesData = snapshot.docs.map(doc => ({
                    id: doc.id, ...doc.data()
                }))
                setAllServices(servicesData);
                setFilteredServices(servicesData);
            } catch (error) {
                console.error("Greška pri učitavanju servisa", error)
            }
        }

        fetchServices()
    }, []);

    const filterServices = () => {
        let filtered = [...allServices];

        if (searchCity.trim() !== "") {
            filtered = filtered.filter(service => service.city.toLowerCase().includes(searchCity.toLowerCase())
            );
        }
        if (searchType.trim() !== "") {
            filtered = filtered.filter(service => service.type.toLowerCase().includes(searchType.trim().toLowerCase()))
        }

        if (searchRating !== "") {
            filtered = filtered.filter(service => Number(service.rating) >= Number(searchRating))
        }

        setFilteredServices(filtered)
    }


        return (
            <>
                <h2>Pretraga servisa</h2>

                <input type="text" value={searchCity} placeholder="Grad"
                       onChange={(e) => setSearchCity(e.target.value)}/>

                <input type="text" value={searchType} placeholder="Tip usluge"
                       onChange={(e) => setSearchType(e.target.value)}/>

                <select value={searchRating}
                        onChange={(e) => setSearchRating(e.target.value)}>

                    <option value="">Minimalna ocena</option>
                    <option value="3">3+</option>
                    <option value="4">4+</option>
                    <option value="4.5">4.5+</option>
                </select>

                <button onClick={filterServices}>Pretraži</button>

                {filteredServices.length === 0 && <p>Nema rezultata</p>}

                <ul>
                    {filteredServices.map(service => (
                        <li key={service.id}>{service.id}>
                            <p><b>{service.name}</b></p>
                            <p>Grad: {service.city}</p>
                            <p>Tip: {service.type}</p>
                            <p>Ocena: {service.rating}</p>

                            <button onClick={() => navigate(`/services/${service.id}`)}>Zakaži termin</button>
                        </li>
                    ))}
                </ul>
            </>
        )

}

export default ServiceSearch;