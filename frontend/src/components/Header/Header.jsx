import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { animeApi } from "../../services/shikimoriApi";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "./Header.scss";

const IconBars = () => (
  <svg
    className="icon"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 640 640"
  >
    <path d="M96 160C96 142.3 110.3 128 128 128L512 128C529.7 128 544 142.3 544 160C544 177.7 529.7 192 512 192L128 192C110.3 192 96 177.7 96 160zM96 320C96 302.3 110.3 288 128 288L512 288C529.7 288 544 302.3 544 320C544 337.7 529.7 352 512 352L128 352C110.3 352 96 337.7 96 320zM544 480C544 497.7 529.7 512 512 512L128 512C110.3 512 96 497.7 96 480C96 462.3 110.3 448 128 448L512 448C529.7 448 544 462.3 544 480z" />
  </svg>
);

const IconFilter = () => (
  <svg
    className="icon"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 640 640"
  >
    <path d="M96 128C83.1 128 71.4 135.8 66.4 147.8C61.4 159.8 64.2 173.5 73.4 182.6L256 365.3L256 480C256 488.5 259.4 496.6 265.4 502.6L329.4 566.6C338.6 575.8 352.3 578.5 364.3 573.5C376.3 568.5 384 556.9 384 544L384 365.3L566.6 182.7C575.8 173.5 578.5 159.8 573.5 147.8C568.5 135.8 556.9 128 544 128L96 128z" />
  </svg>
);
const IconSearch = () => (
  <svg
    className="icon"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 640 640"
  >
    <path d="M480 272C480 317.9 465.1 360.3 440 394.7L566.6 521.4C579.1 533.9 579.1 554.2 566.6 566.7C554.1 579.2 533.8 579.2 521.3 566.7L394.7 440C360.3 465.1 317.9 480 272 480C157.1 480 64 386.9 64 272C64 157.1 157.1 64 272 64C386.9 64 480 157.1 480 272zM272 416C351.5 416 416 351.5 416 272C416 192.5 351.5 128 272 128C192.5 128 128 192.5 128 272C128 351.5 192.5 416 272 416z" />
  </svg>
);

const RESULTS_LIMIT = 5;

function Header({ onToggleAside, onToggleRightPanel, isMobile }) {
  const location = useLocation();
  const shouldShowRightPanelButton =
    isMobile &&
    (location.pathname.startsWith("/catalog") ||
      location.pathname.startsWith("/watch"));
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef(null);
  const wrapperRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const search = useCallback(async (value) => {
    if (!value.trim()) {
      setResults([]);
      setOpen(false);
      return;
    }
    setLoading(true);
    try {
      const data = await animeApi.getList(
        { search: value, limit: RESULTS_LIMIT + 1 },
        1,
        RESULTS_LIMIT + 1,
      );
      setResults(data);
      setOpen(true);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleInput = (e) => {
    const value = e.target.value;
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(value), 400);
  };

  const handleSeeMore = () => {
    setOpen(false);
    setQuery("");
    navigate(`/catalog?search=${encodeURIComponent(query)}`);
  };

  const handleSelect = () => {
    setOpen(false);
    setQuery("");
  };

  const getPoster = (anime) => {
    const path = anime.poster?.mainUrl || anime.image?.original;
    if (!path) return null;
    return path.startsWith("http") ? path : `https://shikimori.one${path}`;
  };

  const visibleResults = results.slice(0, RESULTS_LIMIT);
  const hasMore = results.length > RESULTS_LIMIT;

  return (
    <header className="header">
      <div className="header__container">
        <div className="header__container-left">
          <button className="btn" onClick={onToggleAside}>
            <IconBars />
          </button>
          <Link to="/" className="logo logo-green">
            ANIMEWKI
          </Link>
        </div>
        <div className="header__container-right">
          <div className="searchBar" ref={wrapperRef}>
            <IconSearch />
            <input
              type="text"
              placeholder="Поиск..."
              className="input"
              value={query}
              onChange={handleInput}
              onFocus={() => results.length > 0 && setOpen(true)}
            />

            {open && (
              <div className="search-dropdown">
                {loading && (
                  <div className="search-dropdown__loading">Поиск...</div>
                )}

                {!loading && visibleResults.length === 0 && (
                  <div className="search-dropdown__empty">
                    Ничего не найдено
                  </div>
                )}

                {!loading &&
                  visibleResults.map((anime) => (
                    <Link
                      key={anime.id}
                      to={`/anime/${anime.id}`}
                      className="search-dropdown__item"
                      onClick={handleSelect}
                    >
                      {getPoster(anime) && (
                        <img
                          src={getPoster(anime)}
                          alt={anime.russian || anime.name}
                          className="search-dropdown__poster"
                        />
                      )}
                      <div className="search-dropdown__info">
                        <span className="search-dropdown__title">
                          {anime.russian || anime.name}
                        </span>
                        {anime.russian && anime.name && (
                          <span className="search-dropdown__orig">
                            {anime.name}
                          </span>
                        )}
                      </div>
                    </Link>
                  ))}

                {!loading && hasMore && (
                  <button
                    className="search-dropdown__more"
                    onClick={handleSeeMore}
                  >
                    Смотреть все результаты →
                  </button>
                )}
              </div>
            )}
          </div>
          {shouldShowRightPanelButton && (
            <button
              className="btn btn-right-panel"
              onClick={onToggleRightPanel}
            >
              <IconFilter />
            </button>
          )}

          {user ? (
            <div className="header__auth">
              <button onClick={logout} className="btn btn-red">
                Выйти
              </button>
            </div>
          ) : (
            <div className="header__auth">
              <Link to="/login" className="btn btn-green">
                Войти
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
