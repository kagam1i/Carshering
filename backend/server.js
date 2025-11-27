const express = require("express");
const cors = require("cors");
const db = require("./db");

const app = express();
app.use(cors());
app.use(express.json());


app.get('/', (req, res) => {
    res.send('API is working!')
})


// регистрация
app.post('/api/registration', (req, res) => {
    const { login, password } = req.body;

    if (!login) {
        return res.status(400).json({ error: "Введите login" });
    }

    if (!password) {
        return res.status(400).json({ error: "Введите пароль" });
    }

    db.get("SELECT user_id FROM users WHERE login = ?", [login], (err, row) => {
        if (err) {
            console.error("SELECT user error:", err);
            return res.status(500).json({ error: "Ошибка сервера" });
        }

        if (row) {
            return res.status(400).json({ error: "Логин уже занят" });
        }

        db.run('insert into users (login, password) values (?, ?)', [login, password],
            function (err) {
                if (err) return res.status(500).json({ error: "Ошибка сервера" });


                res.status(201).json({
                    user_id: this.lastID,
                    login,
                })
            });
    });
});


// авторизация
app.post('/api/authorization', (req, res) => {
    const { login, password } = req.body;

    if (!login) {
        return res.status(400).json({ error: "Введите login" });
    }

    if (!password) {
        return res.status(400).json({ error: "Введите пароль" });
    }

    db.get(
        "SELECT user_id, login, password FROM users WHERE login = ?",
        [login],
        (err, user) => {
            if (err) {
                console.error("SELECT user error:", err);
                return res.status(500).json({ error: "Ошибка сервера" });
            }

            if (!user || user.password !== password) {
                return res.status(400).json({ error: "Неверный логин или пароль" });
            }

            res.json({
                user_id: user.user_id,
                login: user.login,
            });
        }
    );
});



// создать машину
app.post("/api/cars", (req, res) => {
    const { model, number, is_available = 1 } = req.body;

    if (!model) {
        return res.status(400).json({ error: "Введите марку машины" });
    }

    if (!number) {
        return res.status(400).json({ error: "Введите номер машины" });
    }

    db.run(
        "INSERT INTO cars (model, number, is_available) VALUES (?, ?, ?)",
        [model, number, is_available ? 1 : 0],
        function (err) {
            if (err) {
                console.error("INSERT cars error:", err);

                if (err.code === "SQLITE_CONSTRAINT") {

                    return res.status(400).json({ error: "Машина с таким номером уже существует" });
                }

                return res.status(500).json({ error: "Ошибка сервера" });
            }

            res.status(201).json({
                car_id: this.lastID,
                model,
                number,
                is_available: is_available ? 1 : 0,
            });
        }
    );
});


// вывод списка машин
app.get("/api/cars", (req, res) => {
    db.all("SELECT * FROM cars", [], (err, rows) => {
        if (err) {
            console.error("SELECT car error:", err);
            return res.status(500).json({ error: "Ошибка сервера" });
        }

        res.json(rows);
    });
});


// СОЗДАТЬ БРОНЬ
app.post("/api/bookings", (req, res) => {
    const { user_id, car_id, from_time, to_time } = req.body;

    if (!user_id || !car_id || !from_time || !to_time) {
        return res.status(400).json({ error: "Не хватает данных" });
    }

    db.run(
        `INSERT INTO bookings (user_id, car_id, from_time, to_time)
     VALUES (?, ?, ?, ?)`,
        [user_id, car_id, from_time, to_time],
        function (err) {
            if (err) {
                console.error("INSERT bookings error:", err);
                return res.status(500).json({ error: "Ошибка сервера" });
            }

            res.json({ booking_id: this.lastID });
        }
    );
});


// ПОЛУЧИТЬ БРОНИ ПОЛЬЗОВАТЕЛЯ
app.get("/api/bookings/user/:user_id", (req, res) => {
    const user_id = req.params.user_id;

    db.all(
        "SELECT * FROM bookings WHERE user_id = ? ORDER BY from_time DESC",
        [user_id],
        (err, rows) => {
            if (err) {
                console.error("SELECT bookings error:", err);
                return res.status(500).json({ error: "Ошибка сервера" });
            }

            res.json(rows);
        }
    );
});


// УДАЛИТЬ БРОНЬ
app.delete("/api/bookings/:booking_id", (req, res) => {
    const booking_id = req.params.booking_id;

    db.run(
        "DELETE FROM bookings WHERE booking_id = ?",
        [booking_id],
        function (err) {
            if (err) {
                console.error("DELETE booking error:", err);
                return res.status(500).json({ error: "Ошибка сервера" });
            }

            if (this.changes === 0) {
                return res.status(404).json({ error: "Бронь не найдена" });
            }

            res.json({ success: true });
        }
    );
});


// СОЗДАТЬ ОПЛАТУ
app.post("/api/payments", (req, res) => {
    const { booking_id, amount } = req.body;

    if (!booking_id || !amount) {
        return res.status(400).json({ error: "Не хватает данных" });
    }

    const paid_at = new Date().toISOString();

    db.run(
        `INSERT INTO payments (booking_id, amount, paid_at)
     VALUES (?, ?, ?)`,
        [booking_id, amount, paid_at],
        function (err) {
            if (err) {
                console.error("INSERT payments error:", err);
                return res.status(500).json({ error: "Ошибка сервера" });
            }

            res.json({ payment_id: this.lastID });
        }
    );
});


// ПОЛУЧИТЬ ОПЛАТЫ ПОЛЬЗОВАТЕЛЯ
app.get("/api/payments/user/:user_id", (req, res) => {
    const user_id = req.params.user_id;

    db.all(
        `
    SELECT p.payment_id, p.booking_id, p.amount, p.paid_at
    FROM payments p
    JOIN bookings b ON b.booking_id = p.booking_id
    WHERE b.user_id = ?
    ORDER BY p.paid_at DESC
  `,
        [user_id],
        (err, rows) => {
            if (err) {
                console.error("SELECT payments error:", err);
                return res.status(500).json({ error: "Ошибка сервера" });
            }

            res.json(rows);
        }
    );
});



db.serialize(() => {
    db.run(`
    CREATE TABLE IF NOT EXISTS users (
      user_id INTEGER PRIMARY KEY AUTOINCREMENT,
      login TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL
    )
  `);

    db.run(`
    CREATE TABLE IF NOT EXISTS cars (
      car_id INTEGER PRIMARY KEY AUTOINCREMENT,
      model TEXT NOT NULL,
      number TEXT NOT NULL UNIQUE,
      is_available INTEGER NOT NULL DEFAULT 1
    )
  `);

    db.run(`
    CREATE TABLE IF NOT EXISTS bookings (
      booking_id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      car_id INTEGER NOT NULL,
      from_time TEXT NOT NULL,
      to_time TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(user_id),
      FOREIGN KEY (car_id) REFERENCES cars(car_id)
    )
  `);

    db.run(`
    CREATE TABLE IF NOT EXISTS payments (
      payment_id INTEGER PRIMARY KEY AUTOINCREMENT,
      booking_id INTEGER NOT NULL UNIQUE,
      amount REAL NOT NULL,
      paid_at TEXT NOT NULL,
      FOREIGN KEY (booking_id) REFERENCES bookings(booking_id) ON DELETE CASCADE
    )
  `);
});


const PORT = 4000;

app.listen(PORT, () => {
    console.log(`Server started on http://localhost:${PORT}`);
});
