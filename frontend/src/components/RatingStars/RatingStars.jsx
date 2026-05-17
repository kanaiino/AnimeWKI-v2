import './RatingStars.scss';

function RatingStars({ value, onChange, disabled = false }) {
  const stars = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  return (
    <div className="rating-stars">
      {stars.map(star => (
        <span
          key={star}
          className={`star ${star <= value ? 'filled' : ''} ${disabled ? 'disabled' : ''}`}
          onClick={() => !disabled && onChange(star)}
          role="button"
          tabIndex={0}
          aria-label={`Оценка ${star}`}
        >
          ★
        </span>
      ))}
    </div>
  );
}

export default RatingStars;