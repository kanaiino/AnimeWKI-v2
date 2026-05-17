import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { animeApi } from "../../services/shikimoriApi";
import {
  removeUserAnime,
  getUserAnimeEntry,
  addOrUpdateUserAnime,
} from "../../services/userAnimeService";
import RatingStars from "../../components/RatingStars/RatingStars";
import RatingModal from "../../components/RatingModal/RatingModal";
import PageLoader from "../../components/PageLoader/PageLoader";
import "./AnimePage.scss";

const STATUS_OPTIONS = [
  { value: "favorite", label: "Избранное" },
  { value: "watching", label: "Смотрю" },
  { value: "planned", label: "В планах" },
  { value: "completed", label: "Просмотрено" },
  { value: "on_hold", label: "Отложено" },
  { value: "dropped", label: "Брошено" },
];

function AnimePage({ isActive }) {
  const { id } = useParams();
const { user } = useAuth();
  const navigate = useNavigate();
  const [anime, setAnime] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userStatus, setUserStatus] = useState("");
  const [userScore, setUserScore] = useState(null);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [similar, setSimilar] = useState([]);

  useEffect(() => {
    const fetchSimilar = async () => {
      if (anime) {
        const sim = await animeApi.getSimilar(anime.id);
        setSimilar(sim);
      }
    };
    fetchSimilar();
  }, [anime]);

  const getPosterUrl = (anime) => {
    const path = anime.poster?.mainUrl || anime.image?.original;
    if (!path) return null;
    return path.startsWith("http") ? path : `https://shikimori.one${path}`;
  };

  const cleanDescription = (html) => {
    if (!html) return "";
    let text = html.replace(
      /\[[a-zA-Z_]+=[^\]]+\]([^\[]+)\[\/[a-zA-Z_]+\]/g,
      "$1"
    );
    text = text.replace(/<[^>]*>/g, "");
    return text.replace(/\s+/g, " ").trim();
  };

  const handleTagClick = (type, value) => {
    const params = new URLSearchParams();
    if (type === "genre") params.set("genre", value);
    if (type === "kind") params.set("kind", value);
    if (type === "status") params.set("status", value);
    navigate(`/catalog?${params.toString()}`);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const animeData = await animeApi.getById(id);
        setAnime(animeData);
        if (user) {
          const entry = await getUserAnimeEntry(user.id, parseInt(id));
          if (entry) {
            setUserStatus(entry.status || "");
            setUserScore(entry.score);
          }
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchData();
  }, [id, user]);

  const handleStatusRadioChange = async (newStatus) => {
    if (!user) return;
    setUpdating(true);
    try {
      if (newStatus === "") {
        await removeUserAnime(user.id, parseInt(id));
        setUserStatus("");
        setUserScore(null);
      } else {
        await addOrUpdateUserAnime(user.id, parseInt(id), newStatus, userScore);
        setUserStatus(newStatus);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  const handleScoreSave = async (newScore) => {
    setUserScore(newScore);
    if (!user) return;
    setUpdating(true);
    try {
      await addOrUpdateUserAnime(user.id, parseInt(id), userStatus, newScore);
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  const getCurrentStatusLabel = () => {
    if (!userStatus) return "Не в списке";
    const found = STATUS_OPTIONS.find((opt) => opt.value === userStatus);
    return found ? found.label : "Не в списке";
  };

  if (loading) return <PageLoader isActive={isActive} />;
  if (error) return <div className="error">Ошибка: {error}</div>;
  if (!anime) return <div className="error">Аниме не найдено</div>;

  const posterUrl = getPosterUrl(anime) || "/placeholder.jpg";
  const titleRussian = anime.russian || anime.name;
  const titleOriginal = anime.name;
  const description = cleanDescription(
    anime.description_html || anime.description || "Описание отсутствует."
  );

  return (
    <div
      className={`anime-page ${isActive ? "aside--padding2" : "aside--padding"}`}
    >
      <div className="anime-page__container">
        {/* Левая колонка */}
        <div className="anime-page__left">
          <img src={posterUrl} alt={titleRussian} className="poster" />
          <button
            className="btn btn-green"
            onClick={() => navigate(`/watch/${id}`)}
          >
            Смотреть
          </button>

          {/* Выпадающий блок выбора статуса (аналог тулбара) */}
          {user && (
            <details className="status-dropdown">
              <summary>
                Статус: <span className="status-current">{getCurrentStatusLabel()}</span>
              </summary>
              <div className="status-options">
                <label className="status-radio">
                  <input
                    type="radio"
                    name="animeStatus"
                    value=""
                    checked={userStatus === ""}
                    onChange={() => handleStatusRadioChange("")}
                    disabled={updating}
                  />
                  Не в списке
                </label>
                {STATUS_OPTIONS.map((opt) => (
                  <label key={opt.value} className="status-radio">
                    <input
                      type="radio"
                      name="animeStatus"
                      value={opt.value}
                      checked={userStatus === opt.value}
                      onChange={() => handleStatusRadioChange(opt.value)}
                      disabled={updating}
                    />
                    {opt.label}
                  </label>
                ))}
              </div>
            </details>
          )}
        </div>

        {/* Правая колонка */}
        <div className="anime-page__right">
          <div className="anime-page__info">
            <div className="anime-page-title">{titleRussian}</div>
            <div className="anime-page-subtitle">{titleOriginal}</div>
            <div className="rating-block">
              <div className="score-display">
                <RatingStars
                  value={Math.floor(anime.score || 0)}
                  onChange={() => {}}
                  disabled
                />
                <span className="score-value">{anime.score || "?"}/10</span>
              </div>
              {user && (
                <button
                  className="btn-small btn-green"
                  onClick={() => setShowRatingModal(true)}
                >
                  Оценить
                </button>
              )}
            </div>
          </div>

          <div className="details-grid">
            <div className="detail-item">
              <span className="detail-label">Тип:</span>
              <button
                className="detail-value clickable"
                onClick={() => handleTagClick("kind", anime.kind)}
              >
                {anime.kind?.toUpperCase() || "Не указан"}
              </button>
            </div>
            <div className="detail-item">
              <span className="detail-label">Статус:</span>
              <button
                className="detail-value clickable"
                onClick={() => handleTagClick("status", anime.status)}
              >
                {anime.status === "anons" && "Анонс"}
                {anime.status === "ongoing" && "Онгоинг"}
                {anime.status === "released" && "Вышел"}
              </button>
            </div>
            <div className="detail-item">
              <span className="detail-label">Год:</span>
              <span className="detail-value">
                {anime.aired_on?.split("-")[0] || "Не указан"}
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Эпизоды:</span>
              <span className="detail-value">
                {anime.episodes_aired || "?"} из {anime.episodes || "?"}
              </span>
            </div>
            <div className="detail-item full-width">
              <span className="detail-label">Жанры:</span>
              <div className="genres-list">
                {anime.genres?.map((genre) => (
                  <button
                    key={genre.id}
                    className="genre-tag"
                    onClick={() => handleTagClick("genre", genre.id)}
                  >
                    {genre.russian}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="description">
            <div className="description-title">Описание</div>
            <div className="description-content">{description ? (description) : ("Информация отсутствует")}</div>
          </div>
        </div>
      </div>

      {showRatingModal && (
        <RatingModal
          currentScore={userScore}
          onSave={handleScoreSave}
          onClose={() => setShowRatingModal(false)}
        />
      )}
    </div>
  );
}

export default AnimePage;