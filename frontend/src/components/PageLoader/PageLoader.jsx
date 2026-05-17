import './PageLoader.scss';

function PageLoader({ isActive, hasRightPanel, error, onRetry }) {
  if (error) {
    return (
      <div className={`page-loader ${isActive ? 'aside--padding2' : 'aside--padding'} ${hasRightPanel ? 'right--padding' : ''}`}>
        <div className="error-icon">⚠️</div>
        <p className="error-message">Не удалось загрузить данные</p>
        <button className="btn-retry" onClick={onRetry}>
          Повторить
        </button>
      </div>
    );
  }

  return (
    <div className={`page-loader ${isActive ? 'aside--padding2' : 'aside--padding'} ${hasRightPanel ? 'right--padding' : ''}`}>
      <div className="spinner"></div>
      <p>Загрузка...</p>
    </div>
  );
}

export default PageLoader;