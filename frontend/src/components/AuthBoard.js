function AuthBoard({
    user,
    login,
    password,
    loading,
    onLoginChange,
    onPasswordChange,
    onLogin,
    onRegister,
    onLogout,
}) {
    if (!user) {
        return (
            <div className="auth-container">
                <div className="auth-block">
                    <h2>Вход / Регистрация</h2>

                    <form className="auth-form">
                        <input
                            type="text"
                            placeholder="Логин"
                            value={login}
                            onChange={(e) => onLoginChange(e.target.value)}
                        />
                        <input
                            type="password"
                            placeholder="Пароль"
                            value={password}
                            onChange={(e) => onPasswordChange(e.target.value)}
                        />

                        <div className="auth-buttons">
                            <button type="button" onClick={onLogin} disabled={loading}>
                                Войти
                            </button>
                            <button type="button" onClick={onRegister} disabled={loading}>
                                Зарегистрироваться
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="auth-block_exit">
            <p>
                Вы вошли как <b>{user.login}</b>
            </p>
            <button className="exit-button" onClick={onLogout}>Выйти</button>
        </div>
    );
}

export default AuthBoard;
