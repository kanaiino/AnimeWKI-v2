import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './Register.scss';

function Register({isActive}) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});
    
    const errors = {};
    if (!name.trim()) errors.name = 'Имя обязательно';
    if (!email.trim()) errors.email = 'Email обязателен';
    else if (!/^[^\s@]+@([^\s@]+\.)+[^\s@]+$/.test(email)) errors.email = 'Некорректный email';
    if (!password) errors.password = 'Пароль обязателен';
    else if (!/^[A-Za-z0-9\-_]{8,}$/.test(password)) 
      errors.password = 'Минимум 8 символов (латиница, цифры, -_)';
    if (password !== confirm) errors.confirm = 'Пароли не совпадают';
    
    if (Object.keys(errors).length) {
      setFieldErrors(errors);
      return;
    }
    
    try {
      await register(name, email, password, confirm);
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className={`register ${isActive ? "aside--padding2" : "aside--padding"}`}>
      <form className="register-form" onSubmit={handleSubmit}>
        <div className='register-title'>Регистрация</div>
        
        <label className="register-label">Имя</label>
        <input
          type="text"
          placeholder="nickname"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={fieldErrors.name ? 'input error-input' : 'input'}
        />
        {fieldErrors.name && <p className="error">{fieldErrors.name}</p>}
        <label className="register-label">Почта</label>
        <input
          type="email"
          placeholder="example@gmail.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={fieldErrors.email ? 'input error-input' : 'input'}
        />
        {fieldErrors.email && <p className="error">{fieldErrors.email}</p>}
        <label className="register-label">Пароль</label>
        <input
          type="password"
          placeholder="qwerty123"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={fieldErrors.password ? 'input error-input' : 'input'}
        />
        {fieldErrors.password && <p className="error">{fieldErrors.password}</p>}
        
          <label className="register-label">Подтвердите пароль</label>
        <input
          type="password"
          placeholder="qwerty123"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className={fieldErrors.confirm ? 'input error-input' : 'input'}
        />
        {fieldErrors.confirm && <p className="error">{fieldErrors.confirm}</p>}
        
        {error && <p className="error">{error}</p>}
        
        <button type="submit" className='btn btn-green'>Зарегистрироваться</button>
        <p className='login-link'>
          Уже есть аккаунт? <Link to="/login">Войти</Link>
        </p>
      </form>
    </div>
  );
}

export default Register;