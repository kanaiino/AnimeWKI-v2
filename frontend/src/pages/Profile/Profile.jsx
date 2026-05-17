import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import UserLists from '../../components/UserLists/UserLists';
import './Profile.scss';

function EditModal({ onClose }) {
  const { updateProfile } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await updateProfile({ name, email, currentPassword, newPassword, confirmNewPassword });
      setSuccess('Профиль успешно обновлён');
      setTimeout(onClose, 1200);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal__header">
          <span className="modal__title">Редактировать профиль</span>
        </div>

        <form className="modal__form" onSubmit={handleSubmit}>
          <div className="modal__section-label">Новые данные (оставьте пустым чтобы не менять)</div>

          <label className="modal__label">Имя</label>
          <input
            className="input"
            type="text"
            placeholder="Новое имя"
            value={name}
            onChange={e => setName(e.target.value)}
          />

          <label className="modal__label">Почта</label>
          <input
            className="input"
            type="email"
            placeholder="Новая почта"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />

          <label className="modal__label">Новый пароль</label>
          <input
            className="input"
            type="password"
            placeholder="Новый пароль (мин. 8 символов)"
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
          />

          <label className="modal__label">Подтвердите новый пароль</label>
          <input
            className="input"
            type="password"
            placeholder="Повторите новый пароль"
            value={confirmNewPassword}
            onChange={e => setConfirmNewPassword(e.target.value)}
          />

          <div className="modal__divider" />
          <div className="modal__section-label">Для подтверждения изменений</div>

          <label className="modal__label">Текущий пароль <span className="modal__required">*</span></label>
          <input
            className="input"
            type="password"
            placeholder="Введите текущий пароль"
            value={currentPassword}
            onChange={e => setCurrentPassword(e.target.value)}
            required
          />

          {error && <div className="error">{error}</div>}
          {success && <div className="modal__success">{success}</div>}

          <div className="modal__actions">
            <button type="button" className="btn" onClick={onClose}>Отмена</button>
            <button type="submit" className="btn btn-green" disabled={loading}>
              {loading ? 'Сохранение...' : 'Сохранить'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Profile({ isActive }) {
  const { user } = useAuth();
  const [showEdit, setShowEdit] = useState(false);

  return (
    <div className={`profile ${isActive ? 'aside--padding2' : 'aside--padding'}`}>
      <div className="profile__header">
        <div className="profile__info">
          <div className="profile-title">Профиль</div>
          <div className="profile__details">
            <div className="profile__detail">
              <span className="profile__label">Имя</span>
              <span className="profile__value">{user?.name}</span>
            </div>
            <div className="profile__detail">
              <span className="profile__label">Почта</span>
              <span className="profile__value">{user?.email}</span>
            </div>
          </div>
        </div>
        <button className="btn-small" onClick={() => setShowEdit(true)}>
          Редактировать
        </button>
      </div>

      <UserLists />

      {showEdit && <EditModal onClose={() => setShowEdit(false)} />}
    </div>
  );
}

export default Profile;