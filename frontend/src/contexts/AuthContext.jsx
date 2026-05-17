import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);
const API_URL = 'http://localhost:5002';

const validateEmail = (email) => {
  const re = /^[^\s@]+@([^\s@]+\.)+[^\s@]+$/;
  return re.test(email);
};

const validatePassword = (password) => {
  const re = /^[A-Za-z0-9\-_]{8,}$/;
  return re.test(password);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const register = async (name, email, password, confirmPassword) => {
    if (password !== confirmPassword) throw new Error('Пароли не совпадают');
    if (!validatePassword(password)) throw new Error('Пароль должен содержать минимум 8 символов (латиница, цифры, символы -_)');
    if (!validateEmail(email)) throw new Error('Введите корректный email');
    if (!name || name.trim().length === 0) throw new Error('Введите имя');

    const checkRes = await fetch(`${API_URL}/users?email=${email}`);
    const existing = await checkRes.json();
    if (existing.length) throw new Error('Пользователь с таким email уже существует');

    const newUser = { id: Date.now(), name: name.trim(), email, password };
    const res = await fetch(`${API_URL}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newUser),
    });
    const created = await res.json();
    const token = btoa(JSON.stringify({ id: created.id, exp: Date.now() + 86400000 }));
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify({ id: created.id, name: created.name, email: created.email }));
    setUser({ id: created.id, name: created.name, email: created.email });
  };

  const login = async (email, password) => {
    if (!validateEmail(email)) throw new Error('Введите корректный email');
    if (!password || password.length === 0) throw new Error('Введите пароль');

    const res = await fetch(`${API_URL}/users?email=${email}`);
    const users = await res.json();
    const found = users.find(u => u.email === email && u.password === password);
    if (!found) throw new Error('Неверный email или пароль');

    const token = btoa(JSON.stringify({ id: found.id, exp: Date.now() + 86400000 }));
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify({ id: found.id, name: found.name, email: found.email }));
    setUser({ id: found.id, name: found.name, email: found.email });
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const updateProfile = async ({ name, email, currentPassword, newPassword, confirmNewPassword }) => {
    if (!user) throw new Error('Не авторизован');

    const res = await fetch(`${API_URL}/users/${user.id}`);
    if (!res.ok) throw new Error('Не удалось получить данные пользователя');
    const currentUser = await res.json();

    if (!currentPassword) throw new Error('Введите текущий пароль');
    if (currentUser.password !== currentPassword) throw new Error('Неверный текущий пароль');

    const updatedData = { ...currentUser };

    if (name && name.trim().length === 0) throw new Error('Имя не может быть пустым');
    if (name && name.trim() !== currentUser.name) {
      updatedData.name = name.trim();
    }

    if (email && email !== currentUser.email) {
      if (!validateEmail(email)) throw new Error('Введите корректный email');
      const checkRes = await fetch(`${API_URL}/users?email=${email}`);
      const existing = await checkRes.json();
      if (existing.length) throw new Error('Этот email уже занят');
      updatedData.email = email;
    }

    if (newPassword) {
      if (!confirmNewPassword) throw new Error('Подтвердите новый пароль');
      if (newPassword !== confirmNewPassword) throw new Error('Новые пароли не совпадают');
      if (!validatePassword(newPassword)) throw new Error('Пароль должен содержать минимум 8 символов (латиница, цифры, символы -_)');
      updatedData.password = newPassword;
    }

    const updateRes = await fetch(`${API_URL}/users/${user.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedData),
    });
    if (!updateRes.ok) throw new Error('Не удалось сохранить изменения');
    const saved = await updateRes.json();

    const newUserData = { id: saved.id, name: saved.name, email: saved.email };
    localStorage.setItem('user', JSON.stringify(newUserData));
    setUser(newUserData);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);