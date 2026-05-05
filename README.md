<div align="center">
  <img width="100" height="100" alt="image" src="https://github.com/user-attachments/assets/dde527ca-fe93-46cb-8058-b48ab689ed09" />
</div>

# TriBus

**TriBus** to aplikacja przeglądarkowa prezentująca dane pochodzące z Zarządu Transportu Miejskiego w Gdańsku  — pozycje autobusów i tablice odjazdów w czasie rzeczywistym. Projekt integruje publiczne API ZTM z własnym backendem Node.js/Express. Projekt w trakcie rozwoju.

----------

## Technologie

**Frontend** — Vue 3, Pinia, Vue Router, Leaflet + OpenStreetMap, TailwindCSS, Vee-Validate, Vue Toast Notification

**Backend** — Node.js, Express, JWT + bcrypt, integracja z publicznym API ZTM, Swagger

**Testy** — Vitest, Cypress
 
**Hosting** — Frontend: Vercel · Backend: Render · Baza danych: MongoDB Atlas

----------

## Funkcjonalności

-   Mapa na żywo z pozycjami autobusów i przystankami (Leaflet + OpenStreetMap)
-   Rejestracja i logowanie użytkowników (JWT + bcrypt)
-   Ulubione przystanki i linie per użytkownik
-   Backend jako proxy do API ZTM i komunikacja z bazą danych
-   Dokumentacja API przez Swagger

----------

## Uruchomienie lokalnie

```bash
# Backend
cd express-backend
npm install
npm start

# Frontend
cd vue-frontend
npm install
npm run dev

```

Konfiguracja środowiska zaprezentowana w `.env.example` 

----------

## Linki

-   **Frontend (demo):** [tribus-alpha.vercel.app](https://tribus-alpha.vercel.app/)
-   **Backend API:** [tribus-backend.onrender.com](https://tribus-backend.onrender.com/)
-   **Swagger:** [tribus-backend.onrender.com/api-docs](https://tribus-backend.onrender.com/api-docs)

----------

## Uwagi

Backend działa na darmowym planie Render — po okresie bezczynności może potrzebować kilku sekund na pierwsze uruchomienie.

----------

## Projekt w trakcie rozwoju...
