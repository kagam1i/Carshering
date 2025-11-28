function BookingsView({
    bookings,
    cars,
    onLoadBookings,
    onCreatePayment,
    onDeleteBooking,
}) {
    return (
        <div>
            <h2>Мои брони</h2>
            <button onClick={onLoadBookings}>Загрузить брони</button>

            {bookings.length === 0 && <p>У вас пока нет броней.</p>}

            <ul>
                {bookings.map((b) => {
                    const car = cars.find((c) => c.car_id === b.car_id);

                    return (
                        <li key={b.booking_id} className="booking-item">
                            <div>Бронь #{b.booking_id}</div>
                            {car ? (
                                <div>
                                    Машина: <b>{car.model}</b> ({car.number})
                                </div>
                            ) : (
                                <div>Машина: неизвестно</div>
                            )}

                            <div>С: {b.from_time}</div>
                            <div>По: {b.to_time}</div>

                            <div className="booking-buttons">
                                <button onClick={() => onCreatePayment(b)}>Оплатить</button>
                                <button onClick={() => onDeleteBooking(b.booking_id)}>Удалить</button>
                            </div>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}

export default BookingsView;
