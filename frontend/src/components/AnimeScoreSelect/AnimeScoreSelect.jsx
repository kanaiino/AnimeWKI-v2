import { useState, useEffect } from 'react';
import './AnimeScoreSelect.scss';

function AnimeScoreSelect({ userId, animeId, initialScore, onScoreChange }) {
  const [score, setScore] = useState(initialScore || '');

  useEffect(() => {
    setScore(initialScore || '');
  }, [initialScore]);

  const handleChange = (e) => {
    const val = e.target.value;
    const newScore = val === '' ? null : Number(val);
    setScore(newScore);
    if (onScoreChange) onScoreChange(newScore);
  };

  const options = [];
  for (let i = 1; i <= 10; i++) {
    options.push(<option key={i} value={i}>{i}</option>);
  }

  return (
    <div className="anime-score-select">
      <label>Оценка:</label>
      <select value={score === null ? '' : score} onChange={handleChange}>
        <option value="">Не оценено</option>
        {options}
      </select>
    </div>
  );
}

export default AnimeScoreSelect;