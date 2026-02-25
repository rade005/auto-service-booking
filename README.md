# 🚗 Auto Service Booking Platform

Web aplikacija za online zakazivanje termina u auto-servisima.

Platforma omogućava klijentima da pronađu servis po gradu i usluzi, rezervišu termin i ostave recenziju.  
Vlasnici servisa upravljaju rezervacijama, dok administrator verifikuje servise i nadgleda sistem.

---

## 🛠 Tehnologije

- React
- Firebase Authentication
- Firebase Firestore
- React Router
- Context API

---

## 👤 Korisničke role

### 👨‍🔧 Klijent
- Registracija i login
- Pretraga servisa po gradu, usluzi i oceni
- Zakazivanje termina
- Otkazivanje rezervacije
- Ostavlja recenziju nakon završene usluge
- Pregled istorije rezervacija

### 🏢 Vlasnik servisa
- Kreiranje servisa
- Definisanje usluga (naziv, cena, trajanje)
- Upravljanje rezervacijama (potvrda, otkazivanje, završavanje)
- Pregled recenzija za sopstveni servis

### 🛡 Administrator
- Verifikacija novih servisa (APPROVED / REJECTED)
- Pregled svih rezervacija
- Pregled svih korisnika
- Moderacija sistema

---

## 📅 Booking sistem

Statusi rezervacija:
- PENDING
- CONFIRMED
- COMPLETED
- CANCELLED

Funkcionalnosti:
- Upravljanje statusima rezervacija
- Filtriranje i pregled rezervacija po roli

---

## ⭐ Recenzije

- Klijenti mogu ostaviti ocenu i komentar nakon završene rezervacije
- Ocena utiče na prosečnu ocenu servisa
- Vlasnici mogu pregledati recenzije svojih servisa

---

## 🗄 Struktura baze podataka (Firestore)

### services
- name
- city
- description
- type
- ownerId
- status (PENDING / APPROVED / REJECTED)
- services[] (niz usluga: naziv, cena, trajanje)
- averageRating
- reviewsCount

### bookings
- userId
- ownerId
- serviceId
- serviceName
- service (naziv usluge)
- date
- time
- status

### users
- email
- role (client / owner / admin)

### reviews
- userId
- serviceId
- serviceName
- rating
- comment
- createdAt

---

## 🚀 Pokretanje projekta lokalno

1. Kloniraj repozitorijum

git clone https://github.com/rade005/auto-service-booking.git

2. Uđi u folder projekta
3. Instaliraj depedencije
4. Pokreni aplikaciju

---

## 📌 Cilj projekta

Cilj projekta je demonstracija:
- rada sa Firebase bazom podataka
- role-based autentikacije
- CRUD operacija
- izrade funkcionalne web aplikacije sa više korisničkih rola

---

## 📄 Autor

Rade Dobraš

Belgrade, Serbia  
