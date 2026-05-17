import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { animeApi, genresApi } from "../../services/shikimoriApi";
import CatalogToolbar from "../../components/CatalogToolbar/CatalogToolbar";
import CatalogFilters from "../../components/CatalogFilters/CatalogFilters";
import AnimeGrid from "../../components/AnimeGrid/AnimeGrid";
import PageLoader from "../../components/PageLoader/PageLoader";
import "./Catalog.scss";

function Catalog({ isActive, isRightPanelOpen, isMobile }) {
  const [searchParams, setSearchParams] = useSearchParams();

  const [sort, setSort] = useState(() => searchParams.get("sort") || "popularity");
  const [debouncedSearch, setDebouncedSearch] = useState(() => searchParams.get("search") || "");
  const [selectedGenres, setSelectedGenres] = useState(() => {
    const g = searchParams.get("genre");
    return g ? [Number(g)] : [];
  });
  const [selectedTypes, setSelectedTypes] = useState(() => {
    const t = searchParams.get("kind");
    return t ? [t] : [];
  });
  const [selectedStatuses, setSelectedStatuses] = useState(() => {
    const s = searchParams.get("status");
    return s ? [s] : [];
  });
  const [selectedRating, setSelectedRating] = useState(() => searchParams.get("rating") || "");

  const [animeList, setAnimeList] = useState([]);
  const [genresList, setGenresList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(null);
  const pageRef = useRef(1);

  useEffect(() => {
    genresApi.getAnimeGenres().then(setGenresList);
  }, []);

  const updateUrl = useCallback((overrides = {}) => {
    const current = {
      search: debouncedSearch,
      sort,
      genres: selectedGenres,
      types: selectedTypes,
      statuses: selectedStatuses,
      rating: selectedRating,
      ...overrides,
    };
    const params = new URLSearchParams();
    if (current.genres.length) params.set("genre", current.genres[0]);
    if (current.types.length) params.set("kind", current.types[0]);
    if (current.statuses.length) params.set("status", current.statuses[0]);
    if (current.search) params.set("search", current.search);
    if (current.sort !== "popularity") params.set("sort", current.sort);
    if (current.rating) params.set("rating", current.rating);
    setSearchParams(params, { replace: true });
  }, [debouncedSearch, sort, selectedGenres, selectedTypes, selectedStatuses, selectedRating, setSearchParams]);

  const handleSortChange = (val) => { setSort(val); updateUrl({ sort: val }); };
  const handleSearchChange = (val) => { setDebouncedSearch(val); updateUrl({ search: val }); };
  const handleGenreChange = (val) => { setSelectedGenres(val); updateUrl({ genres: val }); };
  const handleTypeChange = (val) => { setSelectedTypes(val); updateUrl({ types: val }); };
  const handleStatusChange = (val) => { setSelectedStatuses(val); updateUrl({ statuses: val }); };
  const handleRatingChange = (val) => { setSelectedRating(val); updateUrl({ rating: val }); };

  const loadAnime = useCallback(async (pageNum, append = false) => {
    if (append) setLoadingMore(true);
    else setLoading(true);
    setError(null);
    try {
      const params = {
        order: sort,
        limit: 24,
        page: pageNum,
        ...(debouncedSearch && { search: debouncedSearch }),
        ...(selectedGenres.length && { genre: selectedGenres }),
        ...(selectedTypes.length && { kind: selectedTypes }),
        ...(selectedStatuses.length && { status: selectedStatuses }),
        ...(selectedRating && { rating: selectedRating }),
      };
      const data = await animeApi.getList(params, pageNum, 24);
      if (append) setAnimeList(prev => [...prev, ...data]);
      else setAnimeList(data);
      setHasMore(data.length === 24);
      return data.length === 24;
    } catch (err) {
      console.error(err);
      setError(err.message || "Ошибка при загрузке данных");
      return false;
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [sort, debouncedSearch, selectedGenres, selectedTypes, selectedStatuses, selectedRating]);

  useEffect(() => {
    pageRef.current = 1;
    setAnimeList([]);
    loadAnime(1, false);
  }, [loadAnime]);

  const handleLoadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    const nextPage = pageRef.current + 1;
    const success = await loadAnime(nextPage, true);
    if (success) pageRef.current = nextPage;
  }, [loadAnime, loadingMore, hasMore]);

  const showRightPanel = !isMobile || isRightPanelOpen;

  return (
    <div className={`catalog ${isActive ? "aside--padding2" : "aside--padding"} ${!showRightPanel ? "right-panel--collapsed" : "filters--padding"}`}>
      <div className="catalog__container">
        {showRightPanel && (
          <CatalogFilters
            genresList={genresList}
            selectedGenres={selectedGenres}
            onGenreChange={handleGenreChange}
            selectedTypes={selectedTypes}
            onTypeChange={handleTypeChange}
            selectedStatuses={selectedStatuses}
            onStatusChange={handleStatusChange}
            selectedRating={selectedRating}
            onRatingChange={handleRatingChange}
            search={debouncedSearch}
            onSearchChange={handleSearchChange}
          />
        )}
        <div className="catalog-main">
          <CatalogToolbar sort={sort} onSortChange={handleSortChange} />
          {loading && animeList.length === 0 && <PageLoader isActive={isActive} hasRightPanel={true} error={error} onRetry={() => loadAnime(1, false)} />}
          {!loading && <AnimeGrid items={animeList} />}
          {!loading && animeList.length === 0 && <div className="no-results">Ничего не найдено</div>}
          {hasMore && !loading && animeList.length > 0 && (
            <button className="btn-more btn-green" onClick={handleLoadMore} disabled={loadingMore}>
              {loadingMore ? "Загрузка..." : "Загрузить ещё"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default Catalog;