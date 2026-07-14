# Grain Connect Pro — Backend (Spring Boot)

REST API backend for the Grain Connect Pro frontend (React + Vite). Replaces the
frontend's `localStorage`-based data layer (`grainData.js`, `sellerUser`,
`buyerUser`) with a real database + JWT-secured REST API.

---

## 1. Tech Stack

- **Java 17**, **Spring Boot 3.3.4**
- **Spring Web** — REST controllers
- **Spring Data JPA** — repositories
- **H2** (file-based, zero config) — default database, swappable to **MySQL**
- **Spring Security + JWT** (`io.jsonwebtoken`) — stateless auth
- **Lombok** — boilerplate reduction
- **Bean Validation** (`spring-boot-starter-validation`)

---

## 2. Project Structure

```
src/main/java/com/grainconnect/backend/
├── GrainConnectBackendApplication.java
├── config/
│   ├── SecurityConfig.java       # JWT filter chain, CORS, public routes
│   └── DataSeeder.java           # seeds demo users + grain listings on first run
├── controller/
│   ├── AuthController.java       # /api/auth/register, /api/auth/login
│   ├── UserController.java       # /api/users/me  (profile get/update)
│   ├── GrainController.java      # /api/grains    (browse / post / manage stock)
│   └── ReservationController.java# /api/reservations (book / orders / cancel / collect)
├── dto/
│   ├── request/                  # validated request bodies
│   └── response/                 # API responses (never leaks password hashes)
├── entity/                        # User, Grain, Reservation, Role, ReservationStatus
├── exception/                     # ApiException + GlobalExceptionHandler (clean JSON errors)
├── repository/                    # Spring Data JPA repositories
├── scheduler/                     # auto-expires unpaid "Booked" reservations every minute
├── security/                      # JwtUtil, JwtAuthFilter, CustomUserDetailsService
└── service/                       # business logic (Auth, User, Grain, Reservation)
```

---

## 3. Running Locally

### Prerequisites
- JDK 17+
- Maven 3.8+ (or use your IDE's built-in Maven)

### Run

```bash
cd grain-connect-backend
mvn spring-boot:run
```

The API starts on **http://localhost:8080**.

On first run, `DataSeeder` populates:
- 3 demo sellers (`rajesh@example.com`, `suresh@example.com`, `mani@example.com`)
- 1 demo buyer (`vikram@example.com`)
- All passwords: `password123`
- 6 grain listings matching the original frontend mock data (Premium Wheat, Basmati
  Rice, Yellow Corn, Pearl Millet, Organic Barley, Red Sorghum)

Data persists in `./data/grainconnect.mv.db` (H2 file database). Delete that file
to reseed from scratch.

### H2 Console (optional, for inspecting data)
- URL: http://localhost:8080/h2-console
- JDBC URL: `jdbc:h2:file:./data/grainconnect`
- User: `sa`, Password: *(blank)*

### Switching to MySQL

Edit `src/main/resources/application.properties`:
1. Comment out the H2 `spring.datasource.*` lines.
2. Uncomment the MySQL block and fill in your DB name/user/password.
3. The `mysql-connector-j` driver is already on the classpath.

---

## 4. Configuration (`application.properties`)

| Property | Purpose |
|---|---|
| `app.jwt.secret` | HMAC signing key for JWTs — **change for production** |
| `app.jwt.expiration-ms` | Token lifetime (default 24h) |
| `app.cors.allowed-origins` | Comma-separated list of allowed frontend origins (default includes the Vite dev server `http://localhost:5173`) |
| `app.reservation.expiry-hours` | How long a "Booked" reservation holds stock before auto-cancelling (default 24h) |

---

## 5. API Reference

All request/response bodies are JSON. Authenticated endpoints require:
```
Authorization: Bearer <token>
```
(token returned from `/api/auth/register` or `/api/auth/login`).

### Auth — `/api/auth` (public)

| Method | Path | Body | Notes |
|---|---|---|---|
| POST | `/register` | `{ name, email, phone, password, role: "BUYER"\|"SELLER", address?, farmLocation? }` | `address` for buyers, `farmLocation` for sellers. Returns `{ token, tokenType, user }` |
| POST | `/login` | `{ email, password }` | Returns `{ token, tokenType, user }` |

### Users — `/api/users` (authenticated)

| Method | Path | Body | Notes |
|---|---|---|---|
| GET | `/me` | – | Current user's profile |
| PUT | `/me` | `{ name?, phone?, address?, farmLocation? }` | Updates profile (mirrors Buyer/SellerProfile pages) |

### Grains — `/api/grains`

| Method | Path | Auth | Body | Notes |
|---|---|---|---|---|
| GET | `` | public | – | All listings. Optional `?search=wheat` (matches name/type/farmer) — powers Browse Grain |
| GET | `/{id}` | public | – | Single listing — powers Grain Details (with farmer location for map) |
| GET | `/my-listings` | seller | – | Listings owned by the logged-in seller — powers Manage Stock |
| POST | `` | seller | `{ name, type?, pricePerKg, availableKg, image?, farmerPhone, location?, lat?, lng? }` | Post new stock |
| PUT | `/{id}` | seller (owner) | same as POST | Edit own listing |
| DELETE | `/{id}` | seller (owner) | – | Remove own listing |

### Reservations — `/api/reservations` (authenticated)

| Method | Path | Role | Body | Notes |
|---|---|---|---|---|
| POST | `` | buyer | `{ grainId, quantityKg }` | Books stock (moves `availableKg` → `reservedKg`), expires in `app.reservation.expiry-hours` |
| GET | `/my` | buyer or seller | – | Buyer → their bookings (My Orders). Seller → bookings against their stock |
| POST | `/{id}/cancel` | buyer (owner) | – | Cancels a `Booked` reservation, restores stock to `availableKg` |
| POST | `/{id}/collect` | seller (stock owner) | – | Marks `Collected`, removes stock from `reservedKg` permanently |

A background job (`ReservationExpiryScheduler`) runs every minute and auto-cancels
any `Booked` reservation past its `expiresAt`, returning stock to `availableKg` —
mirroring the frontend's old `checkExpiredReservations()` logic.

---

## 6. Mapping to the Frontend

| Frontend (localStorage) | Backend equivalent |
|---|---|
| `sellerUser` / `buyerUser` | `User` entity + `/api/users/me`, returned on login/register |
| `uzhavan-grains` (`grainData.js`) | `Grain` entity + `/api/grains*` |
| `uzhavan-reservations` | `Reservation` entity + `/api/reservations*` |
| `checkExpiredReservations()` | `ReservationExpiryScheduler` (runs every 60s) |

To wire up the React app: replace direct `localStorage` reads/writes in
`src/lib/grainData.js` and the login/register/profile pages with `fetch`/`axios`
calls to the endpoints above, storing the returned JWT (e.g. in memory or
`sessionStorage`) and attaching it as `Authorization: Bearer <token>` on
authenticated requests.

---

## 7. Notes

- Passwords are hashed with BCrypt — never stored or returned in plain text.
- `lat`/`lng` on `Grain` power the "Open in Maps" buttons (Post Stock / Grain
  Details pages) on the frontend.
- This project could not be `mvn`-built inside this sandbox because Maven Central
  is not on the network allowlist here. Build with `mvn clean package` (or run via
  your IDE) on a machine with normal internet access — all dependencies are
  standard Spring Boot 3.3.4 starters plus `jjwt` 0.12.6 and `mysql-connector-j`.
