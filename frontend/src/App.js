import "./App.css";
import { useState, useEffect } from "react";

import AuthBoard from "./components/AuthBoard.js";
import NavBar from "./components/NavBar.js";
import CarsView from "./components/CarsView.js";
import BookingsView from "./components/BookingsView.js";
import PaymentsView from "./components/PaymentsView.js";

const API_URL = "http://localhost:4000";

function App() {
  const [user, setUser] = useState(null);

  const [view, setView] = useState("cars");

  const [cars, setCars] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [payments, setPayments] = useState([]);

  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");

  const [loading, setLoading] = useState(false);

  const [durationHours, setDurationHours] = useState(2);

  // ----------------------------------------------------------------
  // при загрузке страницы пробуем достать пользователя из localStorage
  // ----------------------------------------------------------------
  useEffect(() => {
    const savedUserID = localStorage.getItem("user_id");
    const savedLogun = localStorage.getItem("login");

    if (savedUserID && savedLogun) {
      setUser({
        user_id: Number(savedUserID),
        login: savedLogun,
      });
    }
  }, []);

  // ----------------------------------------------------------------
  // сохранить пользователя в state и в localStorage
  // ----------------------------------------------------------------
  function savedUserToStateAndStorage(user_id, login) {
    setUser({ user_id, login });

    localStorage.setItem("user_id", String(user_id));
    localStorage.setItem("login", login);
  }

  // ----------------------------------------------------------------
  // регистрация
  // ----------------------------------------------------------------
  async function handlerRegister(e) {
    e.preventDefault();
    setError("");

    if (!login) {
      setError("Введите логин");
      return;
    }

    if (!password) {
      setError("Введите пароль");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(`${API_URL}/api/registration`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ login, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Ошибка регистрации");
      }

      savedUserToStateAndStorage(data.user_id, data.login);
      setView("cars");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // ----------------------------------------------------------------
  // авторизация
  // ----------------------------------------------------------------
  async function handlerLogin(e) {
    e.preventDefault();
    setError("");

    if (!login) {
      setError("Введите логин");
      return;
    }

    if (!password) {
      setError("Введите пароль");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(`${API_URL}/api/authorization`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ login, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Ошибка авторизации");
      }

      savedUserToStateAndStorage(data.user_id, data.login);
      setView("cars");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // ----------------------------------------------------------------
  // выход
  // ----------------------------------------------------------------
  function handleLogout() {
    setUser(null);

    localStorage.removeItem("user_id");
    localStorage.removeItem("login");

    setCars([]);
    setBookings([]);
    setPayments([]);
  }

  // ----------------------------------------------------------------
  // загрузить машины
  // ----------------------------------------------------------------
  async function loadCars() {
    if (!user) return;

    try {
      setLoading(true);
      setError("");

      const res = await fetch(`${API_URL}/api/cars`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Ошибка загрузки машин");
      }

      setCars(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // ----------------------------------------------------------------
  // загрузить брони
  // ----------------------------------------------------------------
  async function loadBookings() {
    if (!user) return;

    try {
      setLoading(true);
      setError("");

      const res = await fetch(
        `${API_URL}/api/bookings/user/${user.user_id}`
      );
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Ошибка загрузки броней");
      }

      setBookings(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // ----------------------------------------------------------------
  // загрузить платежи
  // ----------------------------------------------------------------
  async function loadPayments() {
    if (!user) return;

    try {
      setLoading(true);
      setError("");

      const res = await fetch(
        `${API_URL}/api/payments/user/${user.user_id}`
      );
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Ошибка загрузки платежей");
      }

      setPayments(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // ----------------------------------------------------------------
  // создать бронь
  // ----------------------------------------------------------------
  async function createBooking(car_id) {
    if (!user) return;

    try {
      setLoading(true);
      setError("");

      const from_time = new Date().toISOString();
      const to_time = new Date(
        Date.now() + durationHours * 60 * 60 * 1000
      ).toISOString();

      const res = await fetch(`${API_URL}/api/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.user_id,
          car_id,
          from_time,
          to_time,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Ошибка создания брони");
      }

      await loadBookings();
      setView("bookings");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // ----------------------------------------------------------------
  // создать платеж 
  // ----------------------------------------------------------------
  async function createPayment(booking) {
    if (!user) return;

    if (cars.length === 0) {
      alert(
        "Сначала загрузите список машин на вкладке «Машины», чтобы можно было посчитать стоимость."
      );
      return;
    }

    const car = cars.find((c) => c.car_id === booking.car_id);
    if (!car || car.price_per_hour == null) {
      setError("Не удалось найти стоимость за час для выбранной машины");
      return;
    }

    const amount = durationHours * car.price_per_hour;

    try {
      setLoading(true);
      setError("");

      const res = await fetch(`${API_URL}/api/payments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ booking_id: booking.booking_id, amount }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Ошибка создания платежа");
      }

      await loadPayments();
      setView("payments");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // ----------------------------------------------------------------
  // удалить бронь
  // ----------------------------------------------------------------
  async function deleteBooking(booking_id) {
    if (!user) return;

    const ok = window.confirm("Вы точно хотите удалить эту бронь?");
    if (!ok) return;

    try {
      setLoading(true);
      setError("");

      const res = await fetch(`${API_URL}/api/bookings/${booking_id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Ошибка удаления брони");
      }

      await loadBookings();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }


  return (
    <div className="App">
      <div className="top-bar">
        {user && <NavBar currentView={view} onChangeView={setView} />}

        <AuthBoard
          user={user}
          login={login}
          password={password}
          loading={loading}
          onLoginChange={setLogin}
          onPasswordChange={setPassword}
          onLogin={handlerLogin}
          onRegister={handlerRegister}
          onLogout={handleLogout}
        />

        {error && <div className="error">Ошибка: {error}</div>}
        {loading && <div className="loading">Загрузка...</div>}

      </div>

      <div className="main-content">

        {user && view === "cars" && (
          <CarsView
            cars={cars}
            durationHours={durationHours}
            onDurationChange={setDurationHours}
            onLoadCars={loadCars}
            onCreateBooking={createBooking}
          />
        )}

        {user && view === "bookings" && (
          <BookingsView
            bookings={bookings}
            cars={cars}
            onLoadBookings={loadBookings}
            onCreatePayment={createPayment}
            onDeleteBooking={deleteBooking}
          />
        )}

        {user && view === "payments" && (
          <PaymentsView payments={payments} onLoadPayments={loadPayments} />
        )}
      </div>

    </div>
  );
}

export default App;
