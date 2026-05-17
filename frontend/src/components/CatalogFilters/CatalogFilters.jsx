import { TYPE_OPTIONS, STATUS_OPTIONS, RATING_OPTIONS } from "../../constants/filters";
import "./CatalogFilters.scss";

const IconSearch = () => (
  <svg className="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
    <path d="M480 272C480 317.9 465.1 360.3 440 394.7L566.6 521.4C579.1 533.9 579.1 554.2 566.6 566.7C554.1 579.2 533.8 579.2 521.3 566.7L394.7 440C360.3 465.1 317.9 480 272 480C157.1 480 64 386.9 64 272C64 157.1 157.1 64 272 64C386.9 64 480 157.1 480 272zM272 416C351.5 416 416 351.5 416 272C416 192.5 351.5 128 272 128C192.5 128 128 192.5 128 272C128 351.5 192.5 416 272 416z" />
  </svg>
);

const toggleArrayItem = (array, item) =>
  array.includes(item) ? array.filter(i => i !== item) : [...array, item];

function CatalogFilters({
  genresList = [],
  selectedGenres,
  onGenreChange,
  selectedTypes,
  onTypeChange,
  selectedStatuses,
  onStatusChange,
  selectedRating,
  onRatingChange,
  search,
  onSearchChange,
}) {
  return (
    <div className="filters">
      <div className="filters__container">
        <div className="filters-title">Фильтры</div>

        <div className="searchBar">
          <IconSearch />
          <input
            type="text"
            placeholder="Поиск по названию"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="input"
          />
        </div>

        <details className="filter">
          <summary>Тип</summary>
          <div className="filter-options">
            {TYPE_OPTIONS.map(type => (
              <label key={type.value} className="filter-checkbox">
                <input
                  type="checkbox"
                  checked={selectedTypes.includes(type.value)}
                  onChange={() => onTypeChange(toggleArrayItem(selectedTypes, type.value))}
                />
                {type.label}
              </label>
            ))}
          </div>
        </details>

        <details className="filter">
          <summary>Жанры</summary>
          <div className="filter-options">
            {genresList.map(genre => (
              <label key={genre.id} className="filter-checkbox">
                <input
                  type="checkbox"
                  checked={selectedGenres.includes(genre.id)}
                  onChange={() => onGenreChange(toggleArrayItem(selectedGenres, genre.id))}
                />
                {genre.russian}
              </label>
            ))}
          </div>
        </details>

        <details className="filter">
          <summary>Статус</summary>
          <div className="filter-options">
            {STATUS_OPTIONS.map(status => (
              <label key={status.value} className="filter-checkbox">
                <input
                  type="checkbox"
                  checked={selectedStatuses.includes(status.value)}
                  onChange={() => onStatusChange(toggleArrayItem(selectedStatuses, status.value))}
                />
                {status.label}
              </label>
            ))}
          </div>
        </details>

        <details className="filter">
          <summary>Возрастной рейтинг</summary>
          <div className="filter-options">
            <label className="filter-checkbox">
              <input
                type="radio"
                name="rating"
                checked={selectedRating === ''}
                onChange={() => onRatingChange('')}
              />
              Любой
            </label>
            {RATING_OPTIONS.map(opt => (
              <label key={opt.value} className="filter-checkbox">
                <input
                  type="radio"
                  name="rating"
                  checked={selectedRating === opt.value}
                  onChange={() => onRatingChange(opt.value)}
                />
                {opt.label}
              </label>
            ))}
          </div>
        </details>
      </div>
    </div>
  );
}

export default CatalogFilters;