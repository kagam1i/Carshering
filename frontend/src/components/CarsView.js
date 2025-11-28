function CarsView({
    cars,
    durationHours,
    onDurationChange,
    onLoadCars,
    onCreateBooking,
}) {
    return (
        <div>
            <h2>Список машин</h2>
            <button onClick={onLoadCars}>Загрузить машины</button>

            <div className="duration-input">
                <label>
                    Длительность бронирования (часы):{" "}
                    <input
                        type="number"
                        min="1"
                        value={durationHours}
                        onChange={(e) => onDurationChange(Number(e.target.value))}
                    />
                </label>
            </div>

            {cars.length === 0 && <p>Машины не загружены или их нет.</p>}

            <ul>
                {cars.map((car) => (
                    <li key={car.car_id} className="car-item">
                        <div>
                            <b>{car.model}</b> ({car.number}) — {car.price_per_hour} ₽/час
                        </div>
                        <button onClick={() => onCreateBooking(car.car_id)}>
                            Забронировать на {durationHours} час(ов)
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default CarsView;
