import { useState } from 'react';
import RatingStars from '../RatingStars/RatingStars';
import './RatingModal.scss';

function RatingModal({ currentScore, onSave, onClose }) {
  const [score, setScore] = useState(currentScore || 0);

  const handleSave = () => {
    onSave(score);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h3>Оцените аниме</h3>
        <RatingStars value={score} onChange={setScore} />
        <div className="modal-buttons">
          <button onClick={handleSave} className='btn-small btn-green'>Сохранить</button>
          <button onClick={onClose} className='btn-small btn-red'>Отмена</button>
        </div>
      </div>
    </div>
  );
}

export default RatingModal;