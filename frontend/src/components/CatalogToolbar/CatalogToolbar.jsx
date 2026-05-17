import { SORT_OPTIONS } from '../../constants/filters';
import './CatalogToolbar.scss';

function CatalogToolbar({ sort, onSortChange }) {
  const getCurrentLabel = () => {
    const selected = SORT_OPTIONS.find(opt => opt.value === sort);
    return selected ? selected.label : 'Сортировка';
  };

  return (
    <div className="toolbar">
      <details className="toolbar__filter">
        <summary>
          Сортировка: <span className="toolbar__current-value">{getCurrentLabel()}</span>
        </summary>
        <div className="toolbar__options">
          {SORT_OPTIONS.map(opt => (
            <label key={opt.value} className="toolbar__radio">
              <input
                type="radio"
                name="sort"
                value={opt.value}
                checked={sort === opt.value}
                onChange={() => onSortChange(opt.value)}
              />
              {opt.label}
            </label>
          ))}
        </div>
      </details>
    </div>
  );
}

export default CatalogToolbar;