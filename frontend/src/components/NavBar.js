function NavBar({ currentView, onChangeView }) {
    return (
        <div className="nav-buttons-container">
            <div className="nav-buttons">
                <button
                    onClick={() => onChangeView("cars")}
                    disabled={currentView === "cars"}
                >
                    Машины
                </button>
                <button
                    onClick={() => onChangeView("bookings")}
                    disabled={currentView === "bookings"}
                >
                    Брони
                </button>
                <button
                    onClick={() => onChangeView("payments")}
                    disabled={currentView === "payments"}
                >
                    Платежи
                </button>
            </div>
        </div>
    );
}

export default NavBar;
