import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './Login.scss';

function Login({ isActive }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});

    const errors = {};
    if (!email.trim()) errors.email = 'Введите email';
    else if (!/^[^\s@]+@([^\s@]+\.)+[^\s@]+$/.test(email)) errors.email = 'Некорректный email';
    if (!password.trim()) errors.password = 'Введите пароль';

    if (Object.keys(errors).length) {
      setFieldErrors(errors);
      return;
    }

    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className={`login ${isActive ? 'aside--padding2' : 'aside--padding'}`}>
      <form className="login-form" onSubmit={handleSubmit}>
        <div className="login-title">Вход</div>

        <label className="login-label">Почта</label>
        <input
          type="email"
          placeholder="example@gmail.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={fieldErrors.email ? 'input error-input' : 'input'}
        />
        {fieldErrors.email && <p className="error">{fieldErrors.email}</p>}

        <label className="login-label">Пароль</label>
        <input
          type="password"
          placeholder="qwerty123"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={fieldErrors.password ? 'input error-input' : 'input'}
        />
        {fieldErrors.password && <p className="error">{fieldErrors.password}</p>}

        {error && <p className="error">{error}</p>}

        <button type="submit" className="btn btn-green">Войти</button>
        <p className="register-link">
          Нет аккаунта? <Link to="/register">Зарегистрироваться</Link>
        </p>
      </form>
    </div>
  );
}

export default Login;