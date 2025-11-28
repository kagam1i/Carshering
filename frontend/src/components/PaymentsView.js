function PaymentsView({ payments, onLoadPayments }) {
    return (
        <div>
            <h2>Мои платежи</h2>
            <button onClick={onLoadPayments}>Загрузить платежи</button>

            {payments.length === 0 && <p>У вас ещё нет платежей.</p>}

            <ul>
                {payments.map((p) => (
                    <li key={p.payment_id} className="payment-item">
                        <div>Платёж #{p.payment_id}</div>
                        <div>Бронь: {p.booking_id}</div>
                        <div>Сумма: {p.amount} ₽</div>
                        <div>Дата оплаты: {p.paid_at}</div>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default PaymentsView;
