import { useState, useEffect } from 'react';
import './AnimeStatusSelect.scss';

const STATUS_OPTIONS = [
  { value: 'watching', label: 'Смотрю' },
  { value: 'planned', label: 'В планах' },
  { value: 'completed', label: 'Просмотрено' },
  { value: 'on_hold', label: 'Отложено' },
  { value: 'dropped', label: 'Брошено' },
  { value: 'favorite', label: 'Избранное' }
];

function AnimeStatusSelect({ userId, animeId, initialStatus, onStatusChange }) {
  const [status, setStatus] = useState(initialStatus || '');

  useEffect(() => {
    setStatus(initialStatus || '');
  }, [initialStatus]);

  const handleChange = (e) => {
    const newStatus = e.target.value;
    setStatus(newStatus);
    if (onStatusChange) onStatusChange(newStatus);
  };

  return (
    <div className="anime-status-select">
      <label>В список:</label>
      <select value={status} onChange={handleChange}>
        <option value="">Не выбрано</option>
        {STATUS_OPTIONS.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}

export default AnimeStatusSelect;